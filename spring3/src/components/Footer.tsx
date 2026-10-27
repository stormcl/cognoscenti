function Footer() {
    return (
        <footer>
            <div className="footer-row">
                <p>© {new Date().getFullYear()} Circle Weaver</p>
                <nav aria-label="Footer">
                    <a href="#about">Getting started</a>
                    <a href="#help">Help center</a>
                    <a href="#help">Contact support</a>
                    <a href="#about">Privacy</a>
                    <a href="#about">Terms</a>
                </nav>
            </div>
            <div className="footer-row footer-meta">
                <button className="language-selector" type="button">
                    <img src="/globe1.svg" alt="" width={12} height={12} />
                    English
                </button>
            </div>
        </footer>
    )
}

export default Footer;
