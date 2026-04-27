import type { Metadata } from "next";
import "./globals.css";
import { SidebarShell } from "@/components/sidebar-shell";

export const metadata: Metadata = {
  title: "Project 4H Growth OS",
  description: "Answered.City acquisition command center",
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
