"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";

const links = [
  { href: "/suppliers", label: "Suppliers" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/order", label: "Order" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount, ready } = useCart();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand-mark" aria-label="Fieldworx home">
          Fieldworx
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "nav-link active" : "nav-link"}
              >
                {link.label}
                {link.href === "/order" && ready && itemCount > 0 ? (
                  <span className="cart-count" aria-label={`${itemCount} items`}>
                    {itemCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
