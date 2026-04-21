import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../features/auth/api/auth.api'
import { useAuthSessionStore } from '../../features/auth/model/session/auth-session.store'
import { validateLoginForm } from '../../features/auth/model/validation/auth.validation'
import type { LoginFormModel } from '../../features/auth/model/types/auth.model'
import { ApiClientError } from '../../shared/lib/http/api-client'
import { AuthLayout } from '../../shared/ui/auth/AuthLayout'
import { AppToast } from '../../shared/ui/feedback/AppToast'
import { TextField } from '../../shared/ui/form/TextField'

const initialValues: LoginFormModel = {
  email: '',
  password: '',
}

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthSessionStore((state) => state.setSession)
  const [values, setValues] = useState<LoginFormModel>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning'
    message: string
  } | null>(null)

  const isDisabled = useMemo(
    () => isSubmitting || !values.email || !values.password,
    [isSubmitting, values.email, values.password],
  )

  function onChange(field: keyof LoginFormModel, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setFeedback(null)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateLoginForm(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      setIsSubmitting(true)
      const session = await login(values)
      setSession(session)
      setFeedback({
        type: 'success',
        message: `Bienvenido de nuevo, ${session.user.username}.`,
      })
      window.setTimeout(() => {
        navigate('/pantry', { replace: true })
      }, 700)
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFeedback({ type: 'warning', message: error.message })
      } else {
        setFeedback({
          type: 'warning',
          message: 'Ha ocurrido un error al iniciar sesión.',
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Despensa"
      title="Iniciar sesión"
      subtitle="Accede en segundos a tu despensa, lista de la compra y recetas."
    >
      <form className="card w-full bg-base-100" onSubmit={onSubmit} noValidate>
        <div className="card-body gap-4 p-0">
          <h2 className="text-2xl font-semibold text-base-content">Acceso</h2>

        <TextField
          id="login-email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => onChange('email', event.target.value)}
          error={errors.email}
          placeholder="tu@email.com"
          required
        />
        <TextField
          id="login-password"
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(event) => onChange('password', event.target.value)}
          error={errors.password}
          placeholder="********"
          required
        />

        <button className="btn btn-primary mt-2 w-full" type="submit" disabled={isDisabled}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>

          <p className="text-sm text-base-content/70">
            ¿Aun no tienes cuenta?{' '}
            <Link className="link link-primary" to="/register">
              Registrate
            </Link>
          </p>
        </div>
      </form>

      {feedback ? (
        <AppToast
          message={feedback.message}
          type={feedback.type}
          autoCloseMs={3000}
          onClose={() => setFeedback(null)}
        />
      ) : null}
    </AuthLayout>
  )
}
