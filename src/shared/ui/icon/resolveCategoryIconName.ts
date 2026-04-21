import { iconNames, type IconName, DynamicIcon } from 'lucide-react/dynamic'

const LUCIDE_ICON_NAMES = new Set(iconNames as string[])

export function resolveCategoryIconName(iconName: string | null): IconName | null {
  if (!iconName) return null
  if (LUCIDE_ICON_NAMES.has(iconName)) {
    return iconName as IconName
  }
  const normalized = iconName.trim().replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[_\s]+/g, '-').toLowerCase()
  if (LUCIDE_ICON_NAMES.has(normalized)) {
    return normalized as IconName
  }
  return null
}

export { DynamicIcon }
