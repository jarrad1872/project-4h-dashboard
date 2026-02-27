import type { Metadata } from "next";
import "./globals.css";
import { SidebarShell } from "@/components/sidebar-shell";

export const metadata: Metadata = {
  title: "Project 4H Dashboard",
  description: "Saw.City Campaign Command Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SidebarShell>{children}</SidebarShell>
      </body>
    </html>
  );
}
