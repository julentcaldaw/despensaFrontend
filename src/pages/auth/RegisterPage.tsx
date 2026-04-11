import { useMemo, useState } from 'react'
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
  displayName: '',
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

  const isDisabled = useMemo(
    () =>
      isSubmitting ||
      !values.displayName ||
      !values.email ||
      !values.password ||
      !values.confirmPassword,
    [isSubmitting, values],
  )

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
      eyebrow="Despensa"
      title="Crear cuenta"
      subtitle="Empieza a gestionar tu alimentación con una rutina más simple."
    >
      <form className="card w-full bg-base-100" onSubmit={onSubmit} noValidate>
        <div className="card-body gap-4 p-0">
          <h2 className="text-2xl font-semibold text-base-content">Registro</h2>

        <TextField
          id="register-name"
          label="Nombre visible"
          type="text"
          autoComplete="name"
          value={values.displayName}
          onChange={(event) => onChange('displayName', event.target.value)}
          error={errors.displayName}
          placeholder="Tu nombre"
          required
        />
        <TextField
          id="register-email"
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
          id="register-password"
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(event) => onChange('password', event.target.value)}
          error={errors.password}
          placeholder="Minimo 8 caracteres"
          required
        />
        <TextField
          id="register-confirm-password"
          label="Repite la contraseña"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(event) => onChange('confirmPassword', event.target.value)}
          error={errors.confirmPassword}
          placeholder="********"
          required
        />

        <button className="btn btn-primary mt-2 w-full" type="submit" disabled={isDisabled}>
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

          <p className="text-sm text-base-content/70">
            ¿Ya tienes cuenta?{' '}
            <Link className="link link-primary" to="/login">
              Inicia sesión
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
