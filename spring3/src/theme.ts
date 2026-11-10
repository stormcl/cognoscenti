export const THEME_KEY = 'weaver-dev-theme'

export const themes = [
  { id: 'primary-1', label: 'Primary 1' },
  { id: 'primary-2', label: 'Primary 2' },
  { id: 'additional-dark', label: 'Additional dark' },
  { id: 'additional-light', label: 'Additional light' },
] as const

export type ThemeId = (typeof themes)[number]['id']

export function isThemeId(value: string | null): value is ThemeId {
  return themes.some((theme) => theme.id === value)
}

export function readTheme(): ThemeId {
  try {
    const stored = window.localStorage.getItem(THEME_KEY)
    return isThemeId(stored) ? stored : 'primary-1'
  } catch {
    return 'primary-1'
  }
}

export function applyTheme(id: ThemeId) {
  document.documentElement.dataset.theme = id
  try {
    window.localStorage.setItem(THEME_KEY, id)
  } catch {
    // the theme still applies for this visit
  }
  window.dispatchEvent(new Event('weaver-theme'))
}

export function brandMark(theme: ThemeId) {
  if (theme === 'primary-1') return '/weaver-mark-on-dark.svg'
  if (theme === 'additional-dark') return '/weaver-mark-dark.svg'
  return '/weaver-mark.svg'
}
