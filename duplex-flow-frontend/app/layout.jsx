import "./globals.css";
import "@livekit/components-styles";
import Nav from "@/components/Nav";

export const metadata = { title: "DuplexFlow AI", description: "Full-duplex voice agent that acts while you talk" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
