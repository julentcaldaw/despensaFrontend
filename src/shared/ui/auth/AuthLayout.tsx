import type { PropsWithChildren } from 'react'

interface AuthLayoutProps extends PropsWithChildren {
  eyebrow: string
  title: string
  subtitle: string
}

export function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(253,199,0,0.26),transparent_34%),linear-gradient(180deg,#fffdf8_0%,#fff8ec_100%)] px-4 py-6 sm:px-6">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-lg items-center justify-center">
        <div className="w-full rounded-[2rem] border border-warning/20 bg-base-100/92 p-6 shadow-[0_24px_60px_rgba(115,62,10,0.12)] backdrop-blur sm:p-8">
          <div className="mb-8 space-y-3 text-center">
            {title ? (
              <h1 className="text-3xl font-black tracking-[-0.04em] text-base-content sm:text-4xl">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="text-sm text-base-content/62 sm:text-base">{subtitle}</p>
            ) : null}
          </div>

          {children}
        </div>
      </section>
    </main>
  )
}
