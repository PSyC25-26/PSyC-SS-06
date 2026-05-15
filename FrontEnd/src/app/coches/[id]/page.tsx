"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Coche {
  id: number;
  marca: string;
  modelo: string;
  precio: number;
  anio: number;
  stock: number;
  imagenUrl?: string;
}

export default function CocheDetalle() {
  const params = useParams();
  const [coche, setCoche] = useState<Coche | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8080/api/coches/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setCoche(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [params.id]);

  const formatPrecio = (precio: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(precio);

  if (loading) {
    return (
      <div className="paper-grain min-h-screen bg-bone text-ink">
        <Navbar />
        <div className="max-w-[1380px] mx-auto px-6 lg:px-10 py-32 flex items-center justify-center">
          <p className="kicker">Cargando ficha…</p>
        </div>
      </div>
    );
  }

  if (error || !coche) {
    return (
      <div className="paper-grain min-h-screen bg-bone text-ink">
        <Navbar />
        <div className="max-w-[1380px] mx-auto px-6 lg:px-10 py-32 text-center">
          <p
            className="display text-5xl md:text-6xl"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
          >
            Ficha no encontrada.
          </p>
          <p className="text-ink-soft mt-4">
            El vehículo que buscas ya no está en catálogo.
          </p>
          <Link href="/" className="btn-ghost mt-10">
            ← Volver a la colección
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-grain min-h-screen bg-bone text-ink">
      <Navbar />

      <article className="max-w-[1380px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
        {/* Migas / referencia editorial */}
        <div className="flex items-center justify-between border-b border-line pb-4 mb-10">
          <p className="kicker">
            <Link href="/" className="hover:text-ink ed-underline">
              Colección
            </Link>
            <span className="dot mx-3 align-middle" />
            {coche.marca}
            <span className="dot mx-3 align-middle" />
            <span className="text-ink">{coche.modelo}</span>
          </p>
          <p className="kicker hidden md:block">
            Ficha N.º {coche.id.toString().padStart(3, "0")}
          </p>
        </div>

        <div className="grid grid-cols-12 gap-x-6 gap-y-12">
          {/* Imagen, ocupa lo grande */}
          <div className="col-span-12 lg:col-span-8 relative bg-bone-deep aspect-[4/3] lg:aspect-[16/11] overflow-hidden">
            <img
              src={coche.imagenUrl || "/car-placeholder.svg"}
              alt={`${coche.marca} ${coche.modelo}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/car-placeholder.svg";
              }}
            />
            <div className="absolute top-5 left-5 kicker bg-bone/90 px-3 py-1.5">
              {coche.marca} · {coche.anio}
            </div>
            <div
              className={`absolute top-5 right-5 kicker px-3 py-1.5 ${
                coche.stock > 0
                  ? "bg-ink text-bone"
                  : "bg-bone/90 text-ink-muted"
              }`}
            >
              {coche.stock > 0
                ? `${coche.stock} en stock`
                : "Reservado"}
            </div>
          </div>

          {/* Ficha lateral */}
          <aside className="col-span-12 lg:col-span-4">
            <p className="kicker mb-4">{coche.marca}</p>
            <h1
              className="display text-5xl md:text-6xl"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 40' }}
            >
              {coche.modelo}
            </h1>

            <div className="mt-8 mb-2">
              <p className="kicker">Precio</p>
              <p
                className="text-rust mt-1"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontVariationSettings: '"opsz" 144, "SOFT" 30',
                  fontSize: "clamp(2.4rem, 4vw, 3.4rem)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {formatPrecio(coche.precio)}
              </p>
            </div>

            <dl className="mt-10">
              <div className="spec-row">
                <dt>Marca</dt>
                <dd>{coche.marca}</dd>
              </div>
              <div className="spec-row">
                <dt>Modelo</dt>
                <dd>{coche.modelo}</dd>
              </div>
              <div className="spec-row">
                <dt>Año</dt>
                <dd>{coche.anio}</dd>
              </div>
              <div className="spec-row" style={{ borderBottom: "none" }}>
                <dt>Existencias</dt>
                <dd>{coche.stock}</dd>
              </div>
            </dl>

            {coche.stock > 0 ? (
              <button className="btn-ink w-full mt-10">
                Solicitar visita
                <span aria-hidden>→</span>
              </button>
            ) : (
              <button
                disabled
                className="btn-ghost w-full mt-10 opacity-50 cursor-not-allowed"
              >
                Sin stock
              </button>
            )}
            <p className="kicker mt-4 text-center">
              Respuesta en menos de 24h hábiles
            </p>
          </aside>
        </div>

        {/* Cita editorial bajo la ficha */}
        <div className="mt-24 grid grid-cols-12 gap-6 border-t border-line pt-10">
          <p className="col-span-12 md:col-span-2 kicker">
            Nota del editor
          </p>
          <p
            className="col-span-12 md:col-span-8 text-2xl md:text-3xl leading-snug"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontVariationSettings: '"opsz" 100, "SOFT" 60',
              fontStyle: "italic",
            }}
          >
            “Un {coche.modelo} no se vende, se cede a alguien que lo entiende.
            Reserva tu visita y déjanos contarte su historia.”
          </p>
        </div>
      </article>

      <Footer />
    </div>
  );
}
