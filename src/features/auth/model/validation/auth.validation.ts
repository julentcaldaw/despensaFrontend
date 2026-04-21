import type {
  LoginFormModel,
  RegisterFormModel,
} from '../types/auth.model'

export type AuthFormErrors = Partial<Record<keyof RegisterFormModel, string>> & {
  email?: string
  password?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLoginForm(values: LoginFormModel): AuthFormErrors {
  const errors: AuthFormErrors = {}

  if (!values.email.trim()) {
    errors.email = 'El correo electronico es obligatorio.'
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Introduce un correo electronico valido.'
  }

  if (!values.password.trim()) {
    errors.password = 'La contraseña es obligatoria.'
  }

  return errors
}


export function validateRegisterForm(values: RegisterFormModel): AuthFormErrors {
  const errors: AuthFormErrors = {}

  if (!values.username.trim()) {
    errors.username = 'El nombre de usuario es obligatorio.'
  }

  if (!values.email.trim()) {
    errors.email = 'El correo electronico es obligatorio.'
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Introduce un correo electronico valido.'
  }

  if (!values.password.trim()) {
    errors.password = 'La contraseña es obligatoria.'
  } else if (values.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.'
  }

  if (!values.confirmPassword.trim()) {
    errors.confirmPassword = 'Confirma tu contraseña.'
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.'
  }

  return errors
}
