export function SiteHeader({ inverse = false }: { inverse?: boolean }) {
  return (
    <header className={`site-header ${inverse ? "site-header--inverse" : ""}`}>
      <a className="wordmark" href="/" aria-label="Patrick Dawson home">
        <span className="wordmark-mark">+</span>
        <span>Pat Dawson</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="/work">Work</a>
        <a href="/#field">Play</a>
        <a href="/studies">Studies</a>
        <a href="/about">About</a>
      </nav>
    </header>
  );
}
