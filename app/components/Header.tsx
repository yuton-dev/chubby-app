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
    <header className="border-b border-black/10">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
        <strong>Chubby App</strong>
        <nav className="flex items-center gap-2">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1 text-sm ${
                  active ? "bg-black text-white" : "bg-black/5 text-black"
                }`}
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