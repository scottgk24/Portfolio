import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit, Syne } from "next/font/google";
import "./globals.css";

const brand = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const display = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Scott Kluempke — Portfolio",
  description:
    "Selected work by Scott Kluempke — family apps, budgeting tools, photography sites, and Mac utilities.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07090e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${brand.variable} ${display.variable} ${body.variable} h-full antialiased dark`}
    >
      <body className="h-full overflow-hidden font-sans">{children}</body>
    </html>
  );
}
