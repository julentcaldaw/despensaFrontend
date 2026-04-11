interface RecipesSectionHeaderProps {
  title: string
  count: number
}

export function RecipesSectionHeader({ title, count }: RecipesSectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-base-content">{title}</h2>
      </div>
      <span className="badge badge-primary badge-outline">{count} recetas</span>
    </div>
  )
}
