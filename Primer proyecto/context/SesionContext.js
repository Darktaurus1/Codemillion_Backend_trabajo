import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { pedirJSON } from '../lib/api';

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const refrescar = useCallback(async () => {
    try {
      const datos = await pedirJSON('/sesion');
      setUsuario(datos.usuario);
    } catch {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  async function iniciarSesion(correo, contrasena) {
    const datos = await pedirJSON('/login', {
      method: 'POST',
      body: JSON.stringify({ correo, contrasena }),
    });
    setUsuario(datos);
    return datos;
  }

  async function cerrarSesion() {
    try {
      await pedirJSON('/logout', { method: 'POST' });
    } finally {
      setUsuario(null);
    }
  }

  return (
    <SesionContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion, refrescar }}>
      {children}
    </SesionContext.Provider>
  );
}

export function useSesion() {
  const contexto = useContext(SesionContext);
  if (!contexto) throw new Error('useSesion debe usarse dentro de <SesionProvider> (revisa pages/_app.js)');
  return contexto;
}