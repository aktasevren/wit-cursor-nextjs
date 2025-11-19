import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "alertifyjs/build/css/alertify.css";
import "leaflet/dist/leaflet.css";
import StoreProvider from "@/lib/redux/StoreProvider";

export const metadata: Metadata = {
  title: "Where is this? - Filming Location Finder",
  description: "Find filming locations of your favorite movies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
