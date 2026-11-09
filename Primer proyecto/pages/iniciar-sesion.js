import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSesion } from "../context/SesionContext";
import { destinoSeguro } from "../lib/redireccion";
import { validarCorreo } from "../lib/validaciones";

export default function IniciarSesion() {
  const router = useRouter();
  const { usuario, cargando, iniciarSesion } = useSesion();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (router.isReady && !cargando && usuario) {
      router.replace(destinoSeguro(router.query.siguiente));
    }
  }, [router.isReady, cargando, usuario]);

  async function enviar(e) {
    e.preventDefault();
    setError("");

    const correoLimpio = correo.trim();
    if (!validarCorreo(correoLimpio)) return setError("Escribe un correo válido.");
    if (!contrasena) return setError("Escribe tu contraseña.");

    setEnviando(true);
    try {
      await iniciarSesion(correoLimpio, contrasena);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const siguiente = router.query.siguiente;

  return (
    <main>
      <div className="sesion-tarjeta">
        <h2>Iniciar Sesión</h2>
        {siguiente && <p>Inicia sesión para continuar.</p>}
        <form onSubmit={enviar} className="formulario">
          <input
            placeholder="Correo..."
            type="email"
            name="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            maxLength={254}
            autoComplete="email"
            required
          />
          <input
            placeholder="Contraseña"
            type="password"
            name="contrasena"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            maxLength={128}
            autoComplete="current-password"
            required
          />
          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={enviando}>
            {enviando ? "Entrando…" : "Iniciar sesión"}
          </button>
        </form>
        <p>
          ¿No tienes cuenta?{" "}
          <Link href={siguiente ? `/registro?siguiente=${encodeURIComponent(siguiente)}` : "/registro"}>
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}