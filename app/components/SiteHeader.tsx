import Link from "next/link";

export function SiteHeader({ inverse = false }: { inverse?: boolean }) {
  return (
    <header className={`site-header ${inverse ? "site-header--inverse" : ""}`}>
      <Link className="wordmark" href="/" aria-label="Patrick Dawson home">
        <span>Pat Dawson</span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/#field">Map</Link>
        <Link href="/work">Work</Link>
        <Link href="/studies">Studies</Link>
        <Link href="/about">About</Link>
      </nav>
    </header>
  );
}
