import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="footer-brand">Fieldworx</p>
          <p className="footer-copy">
            Ordering between restaurants and suppliers — without the back-and-forth.
          </p>
        </div>
        <div className="footer-links">
          <Link href="/suppliers">Browse suppliers</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/register">Register</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/order">Current order</Link>
          <Link href="/orders">Order history</Link>
        </div>
      </div>
    </footer>
  );
}
