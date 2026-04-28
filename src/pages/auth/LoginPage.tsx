import { useState } from 'react'
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

  const isDisabled = isSubmitting || !values.email || !values.password

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
      eyebrow=""
      title=""
      subtitle=""
    >
      <form className="mx-auto flex w-full max-w-sm flex-col gap-5" onSubmit={onSubmit} noValidate>
        <img src="/logoB.png" alt="Despensa" className="mx-auto h-14 w-auto sm:h-16" />

        <h1 className="text-center text-3xl font-black tracking-[-0.04em] text-base-content sm:text-4xl">
          Iniciar sesión
        </h1>

        <div className="grid gap-3">
          <TextField
            id="login-email"
            label="Correo electrónico"
            hideLabel
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => onChange('email', event.target.value)}
            error={errors.email}
            placeholder="Correo electrónico"
            required
          />
          <TextField
            id="login-password"
            label="Contraseña"
            hideLabel
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(event) => onChange('password', event.target.value)}
            error={errors.password}
            placeholder="Contraseña"
            required
          />
        </div>

        <button className="btn btn-primary h-12 w-full text-base font-semibold" type="submit" disabled={isDisabled}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="text-center text-sm text-base-content/70">
          <Link className="link link-primary font-semibold" to="/register">
            Registrate
          </Link>
        </p>
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
