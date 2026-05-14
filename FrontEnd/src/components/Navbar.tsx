"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavbarProps {
  variant?: "light" | "transparent";
}

export default function Navbar({ variant = "light" }: NavbarProps) {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    window.location.href = "/";
  };

  const isTransparent = variant === "transparent";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 ${
          isTransparent
            ? "bg-transparent"
            : "bg-bone/85 backdrop-blur-sm border-b border-line-soft"
        }`}
      >
      <div className="max-w-[1380px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between gap-10">
        <Link href="/" className="group flex items-baseline gap-2">
          <span
            className="text-2xl tracking-tight"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontVariationSettings: '"opsz" 144, "SOFT" 60',
              fontStyle: "italic",
            }}
          >
            AutoElite
          </span>
          <span className="kicker hidden sm:inline group-hover:text-rust transition-colors">
            est. 2026
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10 text-[0.78rem] tracking-[0.22em] uppercase text-ink-soft">
          <Link href="/" className="ed-underline hover:text-ink transition-colors">
            Colección
          </Link>
          <Link
            href="/#marcas"
            className="ed-underline hover:text-ink transition-colors"
          >
            Marcas
          </Link>
          <Link
            href="/#contacto"
            className="ed-underline hover:text-ink transition-colors"
          >
            Contacto
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {loggedIn && (
            <Link
              href="/admin"
              className="hidden sm:inline-block text-[0.72rem] tracking-[0.22em] uppercase text-ink-soft hover:text-ink ed-underline"
            >
              Admin
            </Link>
          )}
          {loggedIn ? (
            <button
              onClick={handleLogout}
              className="text-[0.72rem] tracking-[0.22em] uppercase text-ink-soft hover:text-rust transition-colors cursor-pointer"
            >
              Salir
            </button>
          ) : (
            <Link
              href="/login"
              className="text-[0.72rem] tracking-[0.22em] uppercase text-ink border-b border-ink pb-1 hover:text-rust hover:border-rust transition-colors"
            >
              Acceder
            </Link>
          )}
        </div>
      </div>
      </nav>

      {/* Spacer del alto del nav fijo */}
      <div className="h-20" aria-hidden />
    </>
  );
}
