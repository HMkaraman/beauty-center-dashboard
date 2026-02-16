import type { Metadata } from "next";
import { Noto_Kufi_Arabic, Outfit } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "بيوتي سنتر - لوحة التحكم",
  description: "لوحة تحكم إدارة مركز التجميل",
  manifest: "/manifest.json",
  themeColor: "#C5A572",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "بيوتي سنتر",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.classList.remove("dark","light");document.documentElement.classList.add(t)}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${notoKufiArabic.variable} ${outfit.variable} antialiased`}
      >
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster
              position={dir === "rtl" ? "bottom-left" : "bottom-right"}
              dir={dir}
              richColors
              toastOptions={{
                className: "font-[family-name:var(--font-noto-kufi-arabic)]",
              }}
            />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
