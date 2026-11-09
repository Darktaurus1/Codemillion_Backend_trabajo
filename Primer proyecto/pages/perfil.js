import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { pedirJSON } from '../lib/api';
import { formatearFecha } from '../lib/formato';
import { useSesion } from '../context/SesionContext';
import estilos from '../styles/Talleres.module.css';

export default function Perfil() {
  const router = useRouter();
  const { usuario, cargando: cargandoSesion, refrescar } = useSesion();

  const [misTalleres, setMisTalleres] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [exitoAsistencia, setExitoAsistencia] = useState('');
  const [errorAsistencia, setErrorAsistencia] = useState('');

  useEffect(() => {
    if (!cargandoSesion && !usuario) {
      router.replace('/iniciar-sesion?siguiente=/perfil');
    }
  }, [cargandoSesion, usuario]);

  useEffect(() => {
    if (usuario) cargarTalleres(usuario.boleta);
  }, [usuario]);

  async function cargarTalleres(boleta) {
    setError('');
    setCargando(true);
    try {
      const talleres = await pedirJSON('/talleres');
      const listas = await Promise.all(talleres.map((t) => pedirJSON(`/talleres/${t.id}/asistencias`)));
      const conAsistencias = talleres.map((t, i) => ({ ...t, asistencias: listas[i] }));

      const mios = conAsistencias.filter((t) => t.asistencias.some((a) => a.boleta === boleta));
      const conLugar = conAsistencias.filter(
        (t) => !mios.includes(t) && t.asistencias.length < t.cupo
      );

      setMisTalleres(
        mios.map((t) => ({ ...t, miAsistencia: t.asistencias.find((a) => a.boleta === boleta) }))
      );
      setDisponibles(conLugar);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function registrarAsistencia(taller) {
    setErrorAsistencia('');
    setExitoAsistencia('');

    try {
      await pedirJSON(`/asistencias/${taller.miAsistencia.id}`, { method: 'PUT' });

      setMisTalleres((prev) =>
        prev.map((t) =>
          t.id === taller.id
            ? { ...t, miAsistencia: { ...t.miAsistencia, asistencia: 1 } }
            : t
        )
      );
      setExitoAsistencia(`Asistencia registrada en ${taller.nombre}.`);
    } catch (err) {
      setErrorAsistencia(err.message || 'No se pudo registrar la asistencia');
      if (err.status === 401) refrescar();
    }
  }

  if (cargandoSesion || !usuario) {
    return <main><p>Cargando…</p></main>;
  }

  return (
    <main>
      <h1>Mi perfil</h1>

      <section className={estilos.panel}>
        <h2>{usuario.nombre}</h2>
        <p><strong>Correo:</strong> {usuario.correo}</p>
        <p><strong>Boleta:</strong> {usuario.boleta}</p>
        <p><strong>Rol:</strong> {usuario.rol}</p>
      </section>

      {cargando && <p>Cargando tus talleres…</p>}
      {error && <p className="error">{error}</p>}

      <h2>Mis talleres ({misTalleres.length})</h2>
      {errorAsistencia && <p className="error">{errorAsistencia}</p>}
      {exitoAsistencia && <p>{exitoAsistencia}</p>}
      {misTalleres.length === 0 ? (
        <p>Todavía no estás inscrito en ningún taller.</p>
      ) : (
        <ul className={estilos.lista}>
          {misTalleres.map((t) => (
            <li key={t.id}>
              <Link href={`/talleres/${t.id}`}>{t.nombre}</Link> — {formatearFecha(t.fecha)}
              <button
                onClick={() => registrarAsistencia(t)}
                disabled={Boolean(t.miAsistencia?.asistencia)}
              >
                {t.miAsistencia?.asistencia ? 'Asistencia registrada ✓' : 'Registrar Asistencia'}
              </button>
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
                <Link href={`/talleres/${t.id}`}>Inscribirme</Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}