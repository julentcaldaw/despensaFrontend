import type { PropsWithChildren } from 'react'

interface AuthLayoutProps extends PropsWithChildren {
  eyebrow: string
  title: string
  subtitle: string
}

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-300 p-4 sm:p-6">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-2xl lg:min-h-[640px] lg:grid-cols-[1.05fr_1fr]">
        <aside className="relative flex flex-col justify-between gap-6 bg-gradient-to-br from-primary/20 via-secondary/10 to-base-100 p-6 sm:p-8">
          <div className="badge badge-primary badge-outline w-fit">{eyebrow}</div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold leading-tight text-base-content sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-md text-base leading-relaxed text-base-content/75">
              {subtitle}
            </p>
          </div>

          <ul className="space-y-3 text-sm text-base-content/80 sm:text-base">
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-primary" />
              Controla la despensa en un solo lugar.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-secondary" />
              Descubre recetas según lo que ya tienes.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-success" />
              Crea la compra con sugerencias inteligentes.
            </li>
          </ul>
        </aside>

        <section className="flex items-center p-4 sm:p-8">{children}</section>
      </section>
    </main>
  )
}
