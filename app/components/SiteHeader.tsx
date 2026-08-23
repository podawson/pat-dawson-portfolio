"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader({ inverse = false }: { inverse?: boolean }) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Map", active: pathname === "/" },
    { href: "/work", label: "Work", active: pathname.startsWith("/work") },
    { href: "/play", label: "Play", active: pathname === "/play" || pathname === "/studies" || pathname === "/playground" },
    { href: "/about", label: "About", active: pathname === "/about" },
  ];

  return (
    <header className={`site-header ${inverse ? "site-header--inverse" : ""}`}>
      <Link className="wordmark" href="/" aria-label="Patrick Dawson home">
        <span>Pat Dawson</span>
      </Link>
      <nav aria-label="Primary navigation">
        {items.map((item) => (
          <Link className={item.active ? "is-active" : ""} href={item.href} key={item.label} aria-current={item.active ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
