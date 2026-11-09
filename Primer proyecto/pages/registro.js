import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { pedirJSON } from '../lib/api';
import { useSesion } from '../context/SesionContext';
import { destinoSeguro } from '../lib/redireccion';
import { validarBoleta, validarContrasenaSegura, validarCorreo, validarNombre } from '../lib/validaciones';

export default function Registro() {
  const router = useRouter();
  const { usuario, cargando, iniciarSesion } = useSesion();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [boleta, setBoleta] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (router.isReady && !cargando && usuario) {
      router.replace(destinoSeguro(router.query.siguiente));
    }
  }, [router.isReady, cargando, usuario]);

  function limpiarFormulario() {
    setNombre('');
    setCorreo('');
    setContrasena('');
    setConfirmarContrasena('');
    setBoleta('');
    setError('');
  }

  async function registrar(e) {
    e.preventDefault();
    setError('');
    setExito('');

    if (!validarNombre(nombre)) return setError('El nombre solo puede tener letras y espacios (2 a 80 caracteres).');
    if (!validarCorreo(correo.trim())) return setError('El correo no tiene un formato válido.');
    if (!validarBoleta(boleta.trim())) return setError('La boleta debe tener 10 dígitos. Ejemplo: 2025090001.');
    if (!validarContrasenaSegura(contrasena)) {
      return setError('La contraseña debe tener 8 caracteres o más, con mayúscula, minúscula, número y símbolo.');
    }
    if (contrasena !== confirmarContrasena) return setError('Las contraseñas no coinciden.');

    setEnviando(true);
    try {
      await pedirJSON('/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          correo: correo.trim(),
          contrasena,
          confirmarContrasena,
          boleta: boleta.trim(),
        }),
      });
    } catch (err) {
      setError(err.message || 'No se pudo registrar el usuario');
      setEnviando(false);
      return;
    }

    // Cuenta creada: se inicia sesión sola y el useEffect redirige
    try {
      await iniciarSesion(correo.trim(), contrasena);
    } catch {
      setExito('Cuenta creada correctamente. Ahora inicia sesión.');
    } finally {
      setEnviando(false);
    }
  }

  const siguiente = router.query.siguiente;

  return (
    <main>
      <div className="sesion-tarjeta">
        <h2>Registrarse</h2>
        <form onSubmit={registrar} className="formulario">
          <input placeholder="Nombre..." type="text" name="nombre" value={nombre}
            onChange={(e) => setNombre(e.target.value)} maxLength={80} autoComplete="name" required />
          <input placeholder="Correo..." type="email" name="correo" value={correo}
            onChange={(e) => setCorreo(e.target.value)} maxLength={254} autoComplete="email" required />
          <input placeholder="Boleta (10 dígitos)" type="text" name="boleta" value={boleta}
            onChange={(e) => setBoleta(e.target.value)} inputMode="numeric" pattern="\d{10}"
            maxLength={10} title="La boleta debe tener 10 dígitos" required />
          <input placeholder="Contraseña (8 caracteres, mayúscula, número y símbolo)" type="password"
            name="contrasena" value={contrasena} onChange={(e) => setContrasena(e.target.value)}
            minLength={8} maxLength={128} autoComplete="new-password" required />
          <input placeholder="Confirmar contraseña" type="password" name="confirmarContrasena"
            value={confirmarContrasena} onChange={(e) => setConfirmarContrasena(e.target.value)}
            minLength={8} maxLength={128} autoComplete="new-password" required />
          {error && <p className="error">{error}</p>}
          {exito && <p>{exito}</p>}

          <button type="submit" disabled={enviando}>{enviando ? 'Creando cuenta…' : 'Registrarse'}</button>
          <button type="button" onClick={limpiarFormulario}>Cancelar</button>
        </form>
        <p>
          ¿Ya tienes cuenta?{' '}
          <Link href={siguiente ? `/iniciar-sesion?siguiente=${encodeURIComponent(siguiente)}` : '/iniciar-sesion'}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}