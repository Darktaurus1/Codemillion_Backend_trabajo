import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSesion } from '../context/SesionContext';

export default function Menu() {
  const router = useRouter();
  const { usuario, cargando, cerrarSesion } = useSesion();

  async function salir() {
    await cerrarSesion();
    router.push('/');
  }

  return (
    <nav>
      <Link href="/">Inicio</Link>
      <Link href="/practica/1">Práctica /1</Link>
      <Link href="/talleres">Talleres</Link>
      {usuario && <Link href="/perfil">Mi perfil</Link>}

      {!cargando && (
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          {usuario ? (
            <>
              <span style={{ color: '#fff', fontSize: 15 }}>Hola, {usuario.nombre}</span>
              <button type="button" onClick={salir}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href="/iniciar-sesion">Iniciar sesión</Link>
              <Link href="/registro">Registrarse</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}