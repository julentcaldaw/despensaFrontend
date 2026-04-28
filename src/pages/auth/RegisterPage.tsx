import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../features/auth/api/auth.api'
import { useAuthSessionStore } from '../../features/auth/model/session/auth-session.store'
import { validateRegisterForm } from '../../features/auth/model/validation/auth.validation'
import type { RegisterFormModel } from '../../features/auth/model/types/auth.model'
import { ApiClientError } from '../../shared/lib/http/api-client'
import { AuthLayout } from '../../shared/ui/auth/AuthLayout'
import { AppToast } from '../../shared/ui/feedback/AppToast'
import { TextField } from '../../shared/ui/form/TextField'

const initialValues: RegisterFormModel = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function RegisterPage() {
  const navigate = useNavigate()
  const setSession = useAuthSessionStore((state) => state.setSession)
  const [values, setValues] = useState<RegisterFormModel>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning'
    message: string
  } | null>(null)

  const isDisabled =
    isSubmitting ||
    !values.username ||
    !values.email ||
    !values.password ||
    !values.confirmPassword

  function onChange(field: keyof RegisterFormModel, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setFeedback(null)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateRegisterForm(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      setIsSubmitting(true)
      const session = await register(values)
      setSession(session)
      setFeedback({
        type: 'success',
        message: 'Cuenta creada correctamente. Entrando en tu despensa...',
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
          message: 'Ha ocurrido un error al crear la cuenta.',
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
          Crear cuenta
        </h1>

        <div className="grid gap-3">
          <TextField
            id="register-username"
            label="Nombre de usuario"
            hideLabel
            type="text"
            autoComplete="username"
            value={values.username}
            onChange={(event) => onChange('username', event.target.value)}
            error={errors.username}
            placeholder="Nombre de usuario"
            required
          />
          <TextField
            id="register-email"
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
            id="register-password"
            label="Contraseña"
            hideLabel
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => onChange('password', event.target.value)}
            error={errors.password}
            placeholder="Contraseña"
            required
          />
          <TextField
            id="register-confirm-password"
            label="Repite la contraseña"
            hideLabel
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(event) => onChange('confirmPassword', event.target.value)}
            error={errors.confirmPassword}
            placeholder="Repite la contraseña"
            required
          />
        </div>

        <button className="btn btn-primary h-12 w-full text-base font-semibold" type="submit" disabled={isDisabled}>
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p className="text-center text-sm text-base-content/70">
          <Link className="link link-primary font-semibold" to="/login">
            Inicia sesión
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
