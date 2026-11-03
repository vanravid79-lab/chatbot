import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

//Configuring the Fonts

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// This is a special Next.js feature used for Server Components
export const metadata = {
  title: "RC Labs Cambodia | Customer Support",
  description:
    "Get product information and helpful answers from RC Labs Cambodia customer support.",
};
//RootLayout: In the Next.js App Router, the layout
// .js file acts as the universal shell for your pages.
// Every page inside your application gets
//  wrapped inside this layout automatically.

export default function RootLayout({ children }) {

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
