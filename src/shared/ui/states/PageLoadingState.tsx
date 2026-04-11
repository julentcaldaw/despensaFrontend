/**
 * PageLoadingState
 * Centered loading spinner for full pages
 */

export function PageLoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="loading loading-spinner loading-lg" />
    </div>
  )
}
