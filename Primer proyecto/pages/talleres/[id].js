import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { pedirJSON } from "../../lib/api";
import { formatearFecha, ocultarBoleta } from "../../lib/formato";
import { validarBoleta } from "../../lib/validaciones";
import { useSesion } from "../../context/SesionContext";
import estilos from "../../styles/Talleres.module.css";

// /talleres/[id] — detalle de un taller.
// PASO 4: datos del taller, barra de lugares y lista de inscritos
//         (GET /api/talleres/:id y GET /api/talleres/:id/asistencias).
// PASO 5: formulario de inscripción (POST /api/asistencias).
export default function DetalleTaller() {
  const router = useRouter();
  const { id } = router.query;
  const { usuario, cargando: cargandoSesion, refrescar } = useSesion();

  const [taller, setTaller] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [errorCarga, setErrorCarga] = useState("");

  const [errorForm, setErrorForm] = useState("");
  const [exito, setExito] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    cargar();
  }, [router.isReady, id]);

  async function cargar() {
    try {
      setTaller(await pedirJSON(`/talleres/${id}`));
      setAsistencias(await pedirJSON(`/talleres/${id}/asistencias`));
      setErrorCarga("");
    } catch (err) {
      setErrorCarga(err.message);
    }
  }

  // Lugares y validación de fecha: se calculan con lo que ya está en el estado.
  const ocupados = asistencias.length;
  const libres = taller ? Math.max(0, taller.cupo - ocupados) : 0;
  const lleno = taller !== null && libres === 0;
  const yaInscrito = usuario ? asistencias.some((a) => a.boleta === usuario.boleta) : false;

  // Comparamos la fecha actual con la fecha del taller
  const pasado = taller
    ? new Date() > new Date(`${String(taller.fecha).slice(0, 10)}T23:59:59`)
    : false;

  async function inscribir(e) {
    e.preventDefault();
    setErrorForm("");
    setExito("");

    if (!usuario)
      return setErrorForm("Inicia sesión para Inscribirte  un taller");
    if (yaInscrito) return setErrorForm("Ya estas inscrito en este taller");

    if (lleno) return setErrorForm("El taller ya no tiene lugares.");
    if (pasado) return setErrorForm("Este taller ya ha finalizado.");

    setEnviando(true);
    try {
      await pedirJSON("/asistencias", {
        method: "POST",
        body: JSON.stringify({ taller_id: id }),
      });
      setExito(`¡Listo! ${usuario.nombre} quedó inscrito(a) en el taller.`);
      await cargar();
    } catch (err) {
      setErrorForm(err.message);
      if (err.status === 401) refrescar();
    } finally {
      setEnviando(false);
    }
  }

  if (errorCarga) {
    return (
      <main>
        <p className="error">{errorCarga}</p>
        <Link className={estilos.volver} href="/talleres">
          ← Volver a talleres
        </Link>
      </main>
    );
  }
  if (!taller)
    return (
      <main>
        <p>Cargando taller…</p>
      </main>
    );



  const porcentaje = Math.min(100, (ocupados / taller.cupo) * 100);

  return (
    <main>
      <Link className={estilos.volver} href="/talleres">
        ← Volver a talleres
      </Link>
      <h1>{taller.nombre}</h1>

      <section className={estilos.panel}>
        <p>
          <strong>Instructor:</strong> {taller.instructor || "Por confirmar"}
        </p>
        <p>
          <strong>Fecha:</strong> {formatearFecha(taller.fecha)}
        </p>
        <div className={estilos.barra}>
          <div
            className={estilos.relleno}
            style={{ width: `${porcentaje}%` }}
          />
        </div>
        <p>
          {ocupados} de {taller.cupo} lugares ocupados ·{" "}
          {pasado ? (
            <span className={estilos.lleno}>Taller finalizado</span>
          ) : lleno ? (
            <span className={estilos.lleno}>Taller lleno</span>
          ) : (
            `${libres} ${libres === 1 ? "lugar libre" : "lugares libres"}`
          )}
        </p>
      </section>

      <section className={estilos.panel}>
        <h2>Inscribirme</h2>
        
        {cargandoSesion ? (
          <p>Comprobando sesión…</p>
        ) : !usuario ? (
          <p>
            Para inscribirte necesitas iniciar sesión.{" "}
            <Link
              href={`/iniciar-sesion?siguiente=${encodeURIComponent(`/talleres/${id}`)}`}
            >
              Iniciar sesión
            </Link>{" "}
            o{" "}
            <Link
              href={`/registro?siguiente=${encodeURIComponent(`/talleres/${id}`)}`}
            >
              crear una cuenta
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={inscribir} className="formulario">
            <p>
              Te inscribirás como <strong>{usuario.nombre}</strong> (boleta{" "}
              {usuario.boleta}).
            </p>
            <button
              type="submit"
              disabled={yaInscrito || lleno || enviando || pasado}
            >
              {pasado
                ? "Taller finalizado"
                : yaInscrito
                  ? "Ya estás inscrito ✓"
                  : lleno
                    ? "Sin lugares"
                    : enviando
                      ? "Inscribiendo…"
                      : "Inscribirme"}
            </button>
          </form>
        )}
        {errorForm && <p className="error">{errorForm}</p>}
        {exito && <p className={estilos.exito}>{exito}</p>}
      </section>

      <h2>Inscritos ({ocupados})</h2>
      {ocupados === 0 ? (
        <p>Todavía no hay inscritos. ¡Sé el primero!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Boleta</th>
              <th>Asistencia</th>
            </tr>
          </thead>
          <tbody>
            {asistencias.map((a, i) => (
              <tr key={a.id}>
                <td>{i + 1}</td>
                <td>{a.nombre_alumno}</td>
                <td>{ocultarBoleta(a.boleta)}</td>
                <td>{a.asistencia ? "Sí" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
