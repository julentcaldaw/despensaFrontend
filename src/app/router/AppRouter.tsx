import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuthSessionStore } from '../../features/auth/model/session/auth-session.store'
import { LoginPage } from '../../pages/auth/LoginPage'
import { RegisterPage } from '../../pages/auth/RegisterPage'
import { NotFoundPage } from '../../pages/not-found/NotFoundPage'
import { PantryPage } from '../../pages/pantry/PantryPage'
import { RecipesPage } from '../../pages/recipes/RecipesPage'
import { ShoppingListPage } from '../../pages/shopping-list/ShoppingListPage'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'

export function AppRouter() {
  const hasSession = useAuthSessionStore((state) => Boolean(state.session?.accessToken))

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={hasSession ? '/pantry' : '/login'} replace />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/pantry"
          element={
            <ProtectedRoute>
              <PantryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shopping-list"
          element={
            <ProtectedRoute>
              <ShoppingListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <RecipesPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
