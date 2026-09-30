"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioLines } from "lucide-react";

export default function Nav() {
  const path = usePathname();
  const links = [["/", "Live Studio"], ["/benchmark", "Benchmark"]];
  return (
    <header className="nav">
      <Link href="/" className="brand"><AudioLines size={20} /> DuplexFlow AI</Link>
      <nav>
        {links.map(([href, label]) => (
          <Link key={href} href={href} className={path === href ? "on" : ""}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}
