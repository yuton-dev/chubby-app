"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/masters", label: "Masters" },
  { href: "/chubbies", label: "Chubbies" }
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b" style={{ borderColor: "var(--border-soft)", background: "var(--primary-soft)" }}>
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
        <strong style={{ color: "var(--foreground)" }}>Chubby App</strong>
        <nav className="flex items-center gap-2">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1 text-sm transition-colors"
                style={
                  active
                    ? { background: "var(--primary-strong)", color: "#fff8f2" }
                    : { background: "#ffffff99", color: "var(--foreground)" }
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}