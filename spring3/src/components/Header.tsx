import type { Dispatch, SetStateAction } from 'react';

type HeaderProps = {
    menuOpen: boolean
    setMenuOpen: Dispatch<SetStateAction<boolean>>;
}

function Header({ menuOpen, setMenuOpen }: HeaderProps) {
    return (
        <header className="site-header">
            <p className="page-label">Workspaces</p>

            <div className="global-tools">
                <label className="search">
                    <img src="/search1.png" alt="" width={10} height={10} />
                    <span className="visually-hidden">Search Circle Weaver</span>
                    <input type="search" placeholder="Search Circle Weaver" />
                    <kbd>⌘ K</kbd>
                </label>

                <button className="workspace-selector" type="button">
                    <img src="/layers1.svg" alt="" width={14} height={16} />
                    <span>All workspaces</span>
                    <img src="/chevron-down1.svg" alt="" width={14} height={14} />
                </button>

                <button className="icon-button" type="button" aria-label="Notifications">
                    <img src="/bell0.svg" alt="" width={18} height={18} />
                </button>
            </div>

            <button
                className="menu-toggle"
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="workspace-navigation"
            >
                <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
                <span>{menuOpen ? 'Close' : 'Menu'}</span>
            </button>
        </header>
    )
}

export default Header;
