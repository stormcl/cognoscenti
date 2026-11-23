const IMAGE_FILE = /\.(?:svg|png|jpe?g|gif|webp|ico)$/i

// The built script lives at <folder>/assets/index-xxxxx.js. Everything before
// /assets/ is the folder Tomcat is serving, so one dist works under any name.
export function appBaseFromModuleUrl(moduleUrl: string): string {
  let path: string
  try {
    path = new URL(moduleUrl).pathname
  } catch {
    return ''
  }
  const at = path.lastIndexOf('/assets/')
  if (at <= 0) return ''
  const base = path.slice(0, at)
  try {
    return decodeURIComponent(base)
  } catch {
    return base
  }
}

export function appBasePath(): string {
  return appBaseFromModuleUrl(import.meta.url)
}

export function publicUrl(url: string): string {
  if (!url.startsWith('/') || url.startsWith('//')) return url
  if (url === '/weaver' || url.startsWith('/weaver/')) return url
  const file = url.split(/[?#]/, 1)[0] ?? url
  if (!IMAGE_FILE.test(file)) return url
  const base = appBasePath()
  if (!base || url === base || url.startsWith(`${base}/`)) return url
  return `${base}${url}`
}

let installed = false

// Pages still say src="/house0.svg". Prefix those image urls once, before React
// paints, so the page files themselves can stay on root-shaped paths.
export function installPublicBase(): void {
  if (installed || !appBasePath()) return
  installed = true

  const original = Element.prototype.setAttribute
  Element.prototype.setAttribute = function (name: string, value: string) {
    if ((name === 'src' || name === 'href') && typeof value === 'string') {
      original.call(this, name, publicUrl(value))
      return
    }
    original.call(this, name, value)
  }

  const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')
  if (!desc?.set || !desc.get) return
  const set = desc.set
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    configurable: true,
    enumerable: desc.enumerable,
    get: desc.get,
    set(value: string) {
      set.call(this, publicUrl(String(value)))
    },
  })
}
