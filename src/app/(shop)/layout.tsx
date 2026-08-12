import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CartProvider } from "@/lib/cart";
import { CustomerAuthProvider } from "@/lib/customer/auth-context";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CustomerAuthProvider>
      <CartProvider>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </CartProvider>
    </CustomerAuthProvider>
  );
}
