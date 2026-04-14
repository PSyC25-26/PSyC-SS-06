"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Coche {
  id: number;
  marca: string;
  modelo: string;
  precio: number;
  anio: number;
  stock: number;
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
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Cargando...</p>
      </div>
    );
  }

  if (error || !coche) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400 text-lg">Vehículo no encontrado</p>
        <Link
          href="/"
          className="text-blue-500 hover:text-blue-400 text-sm"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Auto<span className="text-blue-500">Elite</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Volver al catálogo
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-slate-300">
            {coche.marca} {coche.modelo}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-slate-900 border border-slate-800 rounded-xl h-80 flex items-center justify-center overflow-hidden">
            <img src="/car-placeholder.svg" alt="Imagen del vehículo" className="w-full h-full object-cover" />
          </div>

          <div>
            <p className="text-sm text-blue-500 font-medium uppercase tracking-wider">
              {coche.marca}
            </p>
            <h1 className="text-3xl font-bold mt-1">{coche.modelo}</h1>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-400">Precio</span>
                <span className="text-2xl font-bold">
                  {formatPrecio(coche.precio)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-400">Año</span>
                <span className="font-medium">{coche.anio}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-400">Marca</span>
                <span className="font-medium">{coche.marca}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-400">Disponibilidad</span>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    coche.stock > 0
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {coche.stock > 0
                    ? `${coche.stock} unidades disponibles`
                    : "Sin stock"}
                </span>
              </div>
            </div>

            {coche.stock > 0 && (
              <button className="w-full mt-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors cursor-pointer">
                Solicitar información
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
