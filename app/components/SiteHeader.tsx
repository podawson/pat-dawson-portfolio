"use client";

import { usePathname } from "next/navigation";

export function SiteHeader({ inverse = false }: { inverse?: boolean }) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Corpus", active: pathname === "/" },
    { href: "/work", label: "Work", active: pathname.startsWith("/work") },
    { href: "/about", label: "About", active: pathname === "/about" },
  ];
  return (
    <header className={`site-header ${inverse ? "site-header--inverse" : ""}`}>
      <a className="wordmark" href="/" aria-label="Home">
        <span>Pat Dawson</span>
      </a>
      <nav aria-label="Primary navigation">
        {items.map((item) => (
          <a
            className={item.active ? "is-active" : ""}
            data-nav-item
            href={item.href}
            key={item.label}
            aria-current={item.active ? "page" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
