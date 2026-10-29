import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type MenuProps = {
  label: ReactNode
  className?: string
  menuClassName?: string
  children: ReactNode
  ariaLabel?: string
}

function Menu({ label, className, menuClassName, children, ariaLabel }: MenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className={`menu ${menuClassName ?? ''}`} ref={ref}>
      <button
        className={className}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        {label}
      </button>
      {open ? (
        <div id={menuId} className="menu-panel" role="menu" onClick={() => setOpen(false)}>
          {children}
        </div>
      ) : null}
    </div>
  )
}

export default Menu
