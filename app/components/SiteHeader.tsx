"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { NavMetaball, rememberNavOrigin } from "./NavMetaball";

export function SiteHeader({ inverse = false }: { inverse?: boolean }) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Corpus", active: pathname === "/" },
    { href: "/work", label: "Work", active: pathname.startsWith("/work") },
    { href: "/play", label: "Play", active: pathname === "/play" || pathname === "/studies" || pathname === "/playground" },
    { href: "/about", label: "About", active: pathname === "/about" },
  ];
  const activeIndex = Math.max(0, items.findIndex((item) => item.active));
  const navRef = useRef<HTMLElement>(null);

  return (
    <header className={`site-header ${inverse ? "site-header--inverse" : ""}`}>
      <Link className="wordmark" href="/" aria-label="Patrick Dawson home">
        <span>Pat Dawson</span>
      </Link>
      <nav aria-label="Primary navigation" ref={navRef}>
        <NavMetaball activeIndex={activeIndex} inverse={inverse} navRef={navRef} />
        {items.map((item) => (
          <Link
            className={item.active ? "is-active" : ""}
            data-nav-item
            href={item.href}
            key={item.label}
            aria-current={item.active ? "page" : undefined}
            onPointerDown={() => rememberNavOrigin(activeIndex)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
