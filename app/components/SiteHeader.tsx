"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { NavMetaball, rememberNavOrigin } from "./NavMetaball";

export function SiteHeader({ inverse = false }: { inverse?: boolean }) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Corpus", active: pathname === "/" },
    { href: "/work", label: "Work", active: pathname.startsWith("/work") },
    { href: "/about", label: "About", active: pathname === "/about" },
  ];
  const activeIndex = Math.max(0, items.findIndex((item) => item.active));
  const navRef = useRef<HTMLElement>(null);

  return (
    <header className={`site-header ${inverse ? "site-header--inverse" : ""}`}>
      <a className="wordmark" href="/" aria-label="Patrick Dawson home">
        <span>Pat Dawson</span>
      </a>
      <nav aria-label="Primary navigation" ref={navRef}>
        <NavMetaball activeIndex={activeIndex} inverse={inverse} navRef={navRef} />
        {items.map((item) => (
          <a
            className={item.active ? "is-active" : ""}
            data-nav-item
            href={item.href}
            key={item.label}
            aria-current={item.active ? "page" : undefined}
            onPointerDown={() => rememberNavOrigin(activeIndex)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
