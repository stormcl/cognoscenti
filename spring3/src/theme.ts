export const THEME_KEY = 'weaver-dev-theme'
export const DEFAULT_THEME = 'weaver-indigo' as const

export const themes = [
  { id: 'weaver-indigo', label: 'Weaver Indigo (Light)', group: 'main' },
  { id: 'weaver-midnight', label: 'Weaver Midnight (Dark)', group: 'main' },
  { id: 'weaver-aqua', label: 'Weaver Aqua (Light)', group: 'main' },
  { id: 'weaver-depth', label: 'Weaver Depth (Dark)', group: 'main' },
  { id: 'additional-light', label: 'Weaver Sun', group: 'experimental' },
  { id: 'additional-dark', label: 'Weaver Moon', group: 'experimental' },
] as const

export type ThemeId = (typeof themes)[number]['id']

export const mainThemes = themes.filter((theme) => theme.group === 'main')
export const experimentalThemes = themes.filter((theme) => theme.group === 'experimental')

const legacyThemes: Record<string, ThemeId> = {
  'primary-1': 'weaver-indigo',
  'primary-2': 'weaver-aqua',
}

export function isThemeId(value: string | null): value is ThemeId {
  return themes.some((theme) => theme.id === value)
}

export function readTheme(): ThemeId {
  try {
    const stored = window.localStorage.getItem(THEME_KEY)
    if (isThemeId(stored)) return stored
    if (stored && legacyThemes[stored]) return legacyThemes[stored]
    return DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function applyTheme(id: ThemeId): ThemeId {
  const next = isThemeId(id) ? id : DEFAULT_THEME
  try {
    document.documentElement.dataset.theme = next
    window.localStorage.setItem(THEME_KEY, next)
  } catch {
    document.documentElement.dataset.theme = DEFAULT_THEME
    try {
      window.localStorage.setItem(THEME_KEY, DEFAULT_THEME)
    } catch {
      // indigo still applies for this visit
    }
    window.dispatchEvent(new Event('weaver-theme'))
    return DEFAULT_THEME
  }
  window.dispatchEvent(new Event('weaver-theme'))
  return next
}

const darkBoxThemes: ThemeId[] = ['weaver-midnight', 'weaver-depth']

export function brandMark(theme: ThemeId) {
  if (theme === 'additional-light') return '/weaver-mark-light.svg'
  if (theme === 'additional-dark') return '/weaver-mark-dark.svg'
  if (darkBoxThemes.includes(theme)) return '/weaver-knot-dark.svg'
  return '/weaver-knot-light.svg'
}
