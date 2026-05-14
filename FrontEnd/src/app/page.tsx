"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Coche {
  id: number;
  marca: string;
  modelo: string;
  precio: number;
  anio: number;
  stock: number;
}

interface Marca {
  id: number;
  name: string;
  country: string;
}

export default function Home() {
  const [coches, setCoches] = useState<Coche[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [filtroMarca, setFiltroMarca] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/coches")
      .then((res) => (res.ok ? res.json() : []))
      .then(setCoches)
      .catch(() => setCoches([]));

    fetch("http://localhost:8080/api/marcas")
      .then((res) => (res.ok ? res.json() : []))
      .then(setMarcas)
      .catch(() => setMarcas([]));
  }, []);

  const cochesFiltrados = filtroMarca
    ? coches.filter((c) => c.marca.toLowerCase() === filtroMarca.toLowerCase())
    : coches;

  const formatPrecio = (precio: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(precio);

  const stockTotal = coches.reduce((acc, c) => acc + c.stock, 0);
  const featured = cochesFiltrados[0];
  const rest = cochesFiltrados.slice(1);

  return (
    <div className="paper-grain min-h-screen bg-bone text-ink">
      <Navbar />

      {/* HERO EDITORIAL */}
      <section className="max-w-[1380px] mx-auto px-6 lg:px-10 pt-12 lg:pt-20 pb-24 lg:pb-32">
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          {/* Cabecera estilo portada de revista */}
          <div className="col-span-12 flex items-start justify-between border-b border-line pb-5 wash">
            <div className="kicker">
              Vol. III <span className="dot mx-2 align-middle" /> Primavera 2026
            </div>
            <div className="kicker hidden sm:block">
              {coches.length.toString().padStart(2, "0")} vehículos en catálogo
            </div>
          </div>

          {/* Headline */}
          <div className="col-span-12 lg:col-span-8 mt-6">
            <h1
              className="display text-[clamp(3rem,9vw,8.5rem)] rise"
              style={{ animationDelay: "60ms" }}
            >
              Una colección
              <br />
              <em>curada</em> de
              <br />
              automóviles.
            </h1>
          </div>

          {/* Columna lateral derecha tipo entradilla */}
          <div
            className="col-span-12 lg:col-span-4 lg:pt-4 rise"
            style={{ animationDelay: "260ms" }}
          >
            <p className="text-ink-soft leading-relaxed max-w-md text-[1.02rem]">
              Vehículos nuevos y de ocasión seleccionados uno a uno por nuestro
              equipo. Sin filtros engañosos, sin letra pequeña; cada ficha es
              honesta porque cada coche pasa por nuestras manos antes de pasar
              por las tuyas.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#catalogo" className="btn-ink">
                Ver catálogo
                <span aria-hidden>→</span>
              </a>
              <Link href="/login" className="btn-ghost">
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>

        {/* Strip de cifras editorial */}
        <div
          className="mt-20 lg:mt-28 grid grid-cols-3 gap-6 border-y border-line py-8 rise"
          style={{ animationDelay: "420ms" }}
        >
          <div>
            <p className="kicker">Vehículos</p>
            <p className="numeral text-5xl mt-2">
              {coches.length.toString().padStart(2, "0")}
            </p>
          </div>
          <div className="border-l border-line-soft pl-6">
            <p className="kicker">Marcas</p>
            <p className="numeral text-5xl mt-2">
              {marcas.length.toString().padStart(2, "0")}
            </p>
          </div>
          <div className="border-l border-line-soft pl-6">
            <p className="kicker">En stock</p>
            <p className="numeral text-5xl mt-2">
              {stockTotal.toString().padStart(2, "0")}
            </p>
          </div>
        </div>
      </section>

      {/* ÍNDICE DE MARCAS — tipo table of contents */}
      {marcas.length > 0 && (
        <section
          id="marcas"
          className="max-w-[1380px] mx-auto px-6 lg:px-10 pb-16"
        >
          <div className="flex items-end justify-between mb-8 gap-6">
            <div>
              <p className="kicker mb-3">§ 01 — Marcas representadas</p>
              <h2
                className="display text-4xl md:text-5xl"
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
              >
                Casas y carrocerías.
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar -mx-6 lg:-mx-10 px-6 lg:px-10">
            <div className="flex gap-8 min-w-min">
              <button
                onClick={() => setFiltroMarca("")}
                className={`shrink-0 group text-left ${
                  filtroMarca === "" ? "is-active" : ""
                }`}
              >
                <span
                  className={`ed-underline text-2xl md:text-3xl ${
                    filtroMarca === "" ? "is-active text-ink" : "text-ink-muted"
                  }`}
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontVariationSettings: '"opsz" 100, "SOFT" 50',
                    fontStyle: filtroMarca === "" ? "italic" : "normal",
                  }}
                >
                  Todas
                </span>
                <p className="kicker mt-2">
                  {coches.length.toString().padStart(2, "0")}
                </p>
              </button>

              {marcas.map((marca) => {
                const count = coches.filter(
                  (c) => c.marca.toLowerCase() === marca.name.toLowerCase()
                ).length;
                const active = filtroMarca === marca.name;
                return (
                  <button
                    key={marca.id}
                    onClick={() =>
                      setFiltroMarca(active ? "" : marca.name)
                    }
                    className="shrink-0 text-left"
                  >
                    <span
                      className={`ed-underline text-2xl md:text-3xl block ${
                        active ? "is-active text-ink" : "text-ink-muted"
                      }`}
                      style={{
                        fontFamily: "var(--font-fraunces)",
                        fontVariationSettings: '"opsz" 100, "SOFT" 50',
                        fontStyle: active ? "italic" : "normal",
                      }}
                    >
                      {marca.name}
                    </span>
                    <p className="kicker mt-2">
                      {marca.country}{" "}
                      <span className="dot mx-2 align-middle" />{" "}
                      {count.toString().padStart(2, "0")}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CATÁLOGO */}
      <section
        id="catalogo"
        className="max-w-[1380px] mx-auto px-6 lg:px-10 pb-20"
      >
        <div className="flex items-end justify-between mb-12 border-t border-line pt-8">
          <div>
            <p className="kicker mb-3">§ 02 — Catálogo</p>
            <h2
              className="display text-4xl md:text-5xl"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
            >
              En el showroom
              {filtroMarca && (
                <em
                  className="italic text-rust"
                  style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
                >
                  {" "}· {filtroMarca}
                </em>
              )}
              .
            </h2>
          </div>
          <p className="kicker shrink-0 hidden md:block">
            {cochesFiltrados.length.toString().padStart(2, "0")}{" "}
            {cochesFiltrados.length === 1 ? "pieza" : "piezas"}
          </p>
        </div>

        {cochesFiltrados.length === 0 ? (
          <div className="py-32 text-center">
            <p
              className="display text-3xl md:text-4xl text-ink-muted"
              style={{ fontVariationSettings: '"opsz" 100, "SOFT" 50' }}
            >
              Sin vehículos por ahora.
            </p>
            <p className="kicker mt-4">
              {filtroMarca
                ? "Prueba con otra marca"
                : "El catálogo se renueva semanalmente"}
            </p>
          </div>
        ) : (
          <>
            {/* Pieza destacada */}
            {featured && (
              <Link
                href={`/coches/${featured.id}`}
                className="group block grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 lg:mb-24"
              >
                <div className="lg:col-span-8 relative overflow-hidden bg-bone-deep aspect-[4/3] lg:aspect-[16/10]">
                  <img
                    src="/car-placeholder.svg"
                    alt={`${featured.marca} ${featured.modelo}`}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute top-5 left-5 kicker bg-bone/90 px-3 py-1.5">
                    Pieza destacada
                  </div>
                </div>
                <div className="lg:col-span-4 flex flex-col justify-between">
                  <div>
                    <p className="kicker mb-3">{featured.marca}</p>
                    <h3
                      className="display text-4xl md:text-5xl"
                      style={{
                        fontVariationSettings: '"opsz" 144, "SOFT" 40',
                      }}
                    >
                      {featured.modelo}
                    </h3>
                    <p className="text-ink-soft mt-5 leading-relaxed">
                      Ejemplar disponible para visita en showroom. Toda la
                      documentación a tu disposición.
                    </p>
                  </div>
                  <dl className="mt-10">
                    <div className="spec-row">
                      <dt>Año</dt>
                      <dd>{featured.anio}</dd>
                    </div>
                    <div className="spec-row">
                      <dt>Existencias</dt>
                      <dd>{featured.stock}</dd>
                    </div>
                    <div className="spec-row" style={{ borderBottom: "none" }}>
                      <dt>Precio</dt>
                      <dd
                        className="text-rust"
                        style={{
                          fontVariationSettings: '"opsz" 144, "SOFT" 30',
                          fontSize: "1.6rem",
                        }}
                      >
                        {formatPrecio(featured.precio)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </Link>
            )}

            {/* Rejilla del resto */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {rest.map((coche, idx) => (
                  <Link
                    href={`/coches/${coche.id}`}
                    key={coche.id}
                    className="group block"
                  >
                    <div className="relative overflow-hidden bg-bone-deep aspect-[4/3] mb-5">
                      <img
                        src="/car-placeholder.svg"
                        alt={`${coche.marca} ${coche.modelo}`}
                        className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                      />
                      <span
                        className={`absolute top-4 right-4 kicker px-2.5 py-1 ${
                          coche.stock > 0
                            ? "bg-ink text-bone"
                            : "bg-bone/90 text-ink-muted"
                        }`}
                      >
                        {coche.stock > 0 ? "Disponible" : "Reservado"}
                      </span>
                      <span className="absolute bottom-4 left-4 kicker bg-bone/90 px-2.5 py-1">
                        N.º {(idx + 2).toString().padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="min-w-0">
                        <p className="kicker mb-1">{coche.marca}</p>
                        <h3
                          className="display text-2xl md:text-[1.75rem] truncate"
                          style={{
                            fontVariationSettings: '"opsz" 100, "SOFT" 30',
                          }}
                        >
                          {coche.modelo}
                        </h3>
                      </div>
                      <span
                        className="font-mono text-xs text-ink-muted shrink-0"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        {coche.anio}
                      </span>
                    </div>
                    <div className="flex items-end justify-between mt-3 pt-3 border-t border-line-soft">
                      <span
                        className="text-lg"
                        style={{
                          fontFamily: "var(--font-fraunces)",
                          fontVariationSettings: '"opsz" 100, "SOFT" 20',
                        }}
                      >
                        {formatPrecio(coche.precio)}
                      </span>
                      <span className="kicker text-ink-soft group-hover:text-rust transition-colors">
                        Ver ficha →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
