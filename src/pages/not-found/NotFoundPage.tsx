import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base-200 p-4">
      <section className="card w-full max-w-md border border-base-300 bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <h1 className="card-title text-2xl">Pagina no encontrada</h1>
          <p className="text-base-content/70">
            La ruta que intentas abrir no existe todavia.
          </p>
          <Link className="btn btn-primary" to="/login">
            Volver al acceso
          </Link>
        </div>
      </section>
    </main>
  )
}
