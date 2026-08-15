import Link from "next/link";

export function SiteHeader({ inverse = false }: { inverse?: boolean }) {
  return (
    <header className={`site-header ${inverse ? "site-header--inverse" : ""}`}>
      <Link className="wordmark" href="/" aria-label="Patrick Dawson home">
        <span className="wordmark-mark">+</span>
        <span>Pat Dawson</span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/work">Work</Link>
        <Link href="/#constellation">Map</Link>
        <Link href="/playground">Playground</Link>
        <Link href="/about">About</Link>
      </nav>
      <a className="header-contact" href="mailto:patrickdawsono@gmail.com">
        Say hello ↗
      </a>
    </header>
  );
}
