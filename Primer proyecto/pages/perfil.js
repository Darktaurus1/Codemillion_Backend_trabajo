import Link from 'next/link';
import { useState } from 'react';
import { pedirJSON } from '../lib/api';
import { formatearFecha } from '../lib/formato';
import { validarBoleta } from '../lib/validaciones';
import estilos from '../styles/Talleres.module.css';


// /perfil — el alumno escribe su boleta y ve sus datos, sus talleres y los talleres con lugar.
// Todavía no hay login (llega en la semana 10): por eso se busca por boleta.
// PASO 6: GET /api/usuarios, GET /api/talleres y GET /api/talleres/:id/asistencias (uno por taller).
export default function Perfil() {  
  const [boleta, setBoleta] = useState('');

  const [buscada, setBuscada] = useState('');
  const [alumno, setAlumno] = useState(null);
  const [nombreInscrito, setNombreInscrito] = useState('');
  const [misTalleres, setMisTalleres] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const [exitoRegistro, setExitoRegistro] = useState('');   
  const [nombreRegistro, setNombreRegistro] = useState('');
  const [errorRegistro, setErrorRegistro] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [boletaRegistrar, setBoletaRegistrar] = useState('');
  

  function limpiarFormulario() {
    setNombreRegistro('');
    setCorreo('');
    setContrasena('');
    setConfirmarContrasena('');
    setBoletaRegistrar('');
    setError('');
    setErrorRegistro('');
  
  }






async function buscar(e) {
    e.preventDefault();
    setError('');
    setBuscada('');
    const b = boleta.trim();
    if (!validarBoleta(b)) return setError('La boleta debe tener 10 dígitos.');

    setCargando(true);
    try {
      const usuarios = await pedirJSON('/usuarios');
      const talleres = await pedirJSON('/talleres');
      // El backend no tiene una ruta "talleres de una boleta": se piden las asistencias de cada taller,
      // todas al mismo tiempo, y Promise.all espera a que lleguen todas (en el mismo orden que talleres).
      const listas = await Promise.all(talleres.map((t) => pedirJSON(`/talleres/${t.id}/asistencias`)));
      const conAsistencias = talleres.map((t, i) => ({ ...t, asistencias: listas[i] }));

      const mios = conAsistencias.filter((t) => t.asistencias.some((a) => a.boleta === b));
      const conLugar = conAsistencias.filter(
        (t) => !mios.includes(t) && t.asistencias.length < t.cupo
      );
      // Alguien puede estar inscrito sin tener cuenta: en ese caso se usa el nombre de su inscripción.
      const inscripcion = mios.length > 0 ? mios[0].asistencias.find((a) => a.boleta === b) : null;

      setAlumno(usuarios.find((u) => u.boleta === b) || null);
      setNombreInscrito(inscripcion ? inscripcion.nombre_alumno : '');
      setMisTalleres(mios);
      setDisponibles(conLugar);
      setBuscada(b);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

async function registrarAlumno(e) {
  e.preventDefault();
  setErrorRegistro('');
  setExitoRegistro('');

  if (contrasena !== confirmarContrasena) {
    setErrorRegistro('Las contraseñas no coinciden');
    return;
  }

  try {
    await pedirJSON('/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombreRegistro.trim(),
        correo: correo.trim(),
        contrasena,
        confirmarContrasena,
        boleta: boletaRegistrar.trim()
      })
    });

    limpiarFormulario();
    setExitoRegistro('Cuenta creada correctamente.');
  } catch (err) {
    setErrorRegistro(err.message || 'No se pudo registrar el usuario');
  }
}
  const nombre = alumno ? alumno.nombre : nombreInscrito;

  return (
    <main>
      <h1>Mi perfil</h1>
    
       <form onSubmit={buscar} className="formulario">
        <input placeholder="Tu boleta (10 dígitos)" value={boleta} onChange={(e) => setBoleta(e.target.value)} />
        <button type="submit" disabled={cargando}>{cargando ? 'Buscando…' : 'Ver mi perfil'}</button>
      </form>
      {error && <p className="error">{error}</p>}

      {buscada && (
        <>
          <section className={estilos.panel}>
            {alumno ? (
              <>
                <h2>{alumno.nombre}</h2>
                <p><strong>Correo:</strong> {alumno.correo}</p>
                <p><strong>Boleta:</strong> {alumno.boleta}</p>
                <p><strong>Rol:</strong> {alumno.rol}</p>
              </>
            ) : (
              <p>
                La boleta {buscada} no tiene cuenta registrada
                {nombreInscrito ? ` (inscripciones a nombre de ${nombreInscrito})` : ''}. Aun así puedes
                inscribirte en un taller.
              </p>
            )}
          </section>

          <h2>Mis talleres ({misTalleres.length})</h2>
          {misTalleres.length === 0 ? (
            <p>Todavía no estás inscrito en ningún taller.</p>
          ) : (
            <ul className={estilos.lista}>
              {misTalleres.map((t) => (
                <li key={t.id}>
                  <Link href={`/talleres/${t.id}`}>{t.nombre}</Link> — {formatearFecha(t.fecha)}
                </li>
              ))}
            </ul>
          )}

          <h2>Talleres con lugar disponible</h2>
      {disponibles.length === 0 ? (
        <p>No hay más talleres con lugar.</p>
      ) : (
        <ul className={estilos.lista}>
          {disponibles.map((t) => {
            const ocupados = t.asistencias ? t.asistencias.length : 0;
            const libres = Math.max(0, t.cupo - ocupados);
            return (
              <li key={t.id}>
                <Link href={`/talleres/${t.id}`}>{t.nombre}</Link> — {libres} {libres === 1 ? 'lugar' : 'lugares'} ·{' '}
                <Link href={`/talleres/${t.id}?boleta=${buscada}&nombre=${encodeURIComponent(alumno ? alumno.nombre : nombreInscrito)}`}>
                  Inscribirme
                </Link>
              </li>
            );
          })}
        </ul>
      )}
        </>
      )}

      <h2>Registrarse</h2>
      <form onSubmit={registrarAlumno} className='formulario'>
      <input
         placeholder="Nombre..."
        type="text"
        name="nombre"
        value={nombreRegistro}
        onChange={(e) => setNombreRegistro(e.target.value)}
        maxLength={80}
        autoComplete="name"
      required
    />
      <input
        placeholder='Correo...'
        type='email'
        name='correo'
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        maxLength={254}
        autoComplete='email'
        required
      />
      <input
        placeholder='Contraseña (8 caracteres, mayúscula, número y símbolo)'
        type='password'
        name='contrasena'
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        minLength={8}
        maxLength={128}
        autoComplete='new-password'
        required
      />
      <input
        placeholder='Confirmar Contraseña'
        type='password'
        name='confirmarContrasena'
        value={confirmarContrasena}
        onChange={(e) => setConfirmarContrasena(e.target.value)}
        minLength={8}
        maxLength={128}
        autoComplete='new-password'
        required
      />
      <input
        placeholder='Boleta (10 dígitos)'
        type='text'
        name='boleta'
        value={boletaRegistrar}
        onChange={(e) => setBoletaRegistrar(e.target.value)}
        inputMode='numeric'
        pattern='\d{10}'
        maxLength={10}
        title='La boleta debe tener 10 dígitos'
        required
      />
    {errorRegistro && <p className="error">{errorRegistro}</p>}
    {exitoRegistro && <p>{exitoRegistro}</p>}

      <button type='submit'>Registrarse</button>
      <button type='button' onClick={limpiarFormulario}>Cancelar</button>
    </form>

    </main>
  );
}
