import { FreshDataOnReturn } from "@/components/FreshDataOnReturn";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CartProvider } from "@/lib/cart";
import { CustomerAuthProvider } from "@/lib/customer/auth-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CustomerAuthProvider>
      <CartProvider>
        <FreshDataOnReturn />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </CartProvider>
    </CustomerAuthProvider>
  );
}
