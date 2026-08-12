"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useCustomerAuth } from "@/lib/customer/auth-context";

const links = [
  { href: "/suppliers", label: "Suppliers" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/register", label: "Register" },
  { href: "/order", label: "Order" },
  { href: "/orders", label: "My orders", authOnly: true },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount, ready: cartReady } = useCart();
  const { customer, ready: authReady, logout } = useCustomerAuth();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand-mark" aria-label="Fieldworx home">
          Fieldworx
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {links.map((link) => {
            if ("authOnly" in link && link.authOnly && !(authReady && customer)) {
              return null;
            }
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "nav-link active" : "nav-link"}
              >
                {link.label}
                {link.href === "/order" && cartReady && itemCount > 0 ? (
                  <span className="cart-count" aria-label={`${itemCount} items`}>
                    {itemCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
          {authReady && customer ? (
            <>
              <span className="nav-user" title={customer.tradingName}>
                {customer.username}
              </span>
              <button type="button" className="nav-link nav-button" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className={pathname === "/login" ? "nav-link active" : "nav-link"}
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
