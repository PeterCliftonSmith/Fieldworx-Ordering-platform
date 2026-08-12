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
          <Link href="/suppliers" prefetch={false}>
            Browse suppliers
          </Link>
          <Link href="/how-it-works" prefetch={false}>
            How it works
          </Link>
          <Link href="/register" prefetch={false}>
            Register
          </Link>
          <Link href="/login" prefetch={false}>
            Sign in
          </Link>
          <Link href="/order" prefetch={false}>
            Current order
          </Link>
          <Link href="/orders" prefetch={false}>
            Order history
          </Link>
        </div>
      </div>
    </footer>
  );
}
