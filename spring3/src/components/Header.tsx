import type { Dispatch, SetStateAction } from 'react';

type HeaderProps = {
    menuOpen: boolean
    setMenuOpen: Dispatch<SetStateAction<boolean>>;
}
// Site Header 
function Header( { menuOpen, setMenuOpen }: HeaderProps) {
    return (
        <header className="site-header">
            <a className="brand" href="#top">
                Circle Weaver
            </a>
            
            {/* Desktop Account Nav */}
            <nav 
                aria-label="Account Navigation" 
                className="header-nav"
            >
                <a 
                    href="#account" className="account-link">
                        Account
                </a>
            </nav>

            {/* Hamburger mobile menu navigation */}
            <button
                className="menu-toggle"
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="workspace-navigation"
            >

                {/* If menu is open show 'x' otherwise show  '☰' menu*/}
                <span aria-hidden="true">
                    {menuOpen ? 'x' : '☰'}
                </span>
                <span>
                    {menuOpen ? 'Close' : 'Menu'}
                </span>
            </button>
         </header>
    )
}

export default Header;