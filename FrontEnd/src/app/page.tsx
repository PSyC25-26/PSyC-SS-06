"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [loggedIn, setLoggedIn] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem("token")
  );

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  const cochesFiltrados = filtroMarca
    ? coches.filter((c) => c.marca.toLowerCase() === filtroMarca.toLowerCase())
    : coches;

  const formatPrecio = (precio: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(precio);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Auto<span className="text-blue-500">Elite</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#catalogo" className="hover:text-white transition-colors">
              Catálogo
            </a>
            <a href="#marcas" className="hover:text-white transition-colors">
              Marcas
            </a>
          </div>

          <div className="flex items-center gap-3">
            {loggedIn && (
              <Link
                href="/admin"
                className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg transition-colors"
              >
                Admin
              </Link>
            )}
            {loggedIn ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight leading-tight">
            Encuentra el coche
            <br />
            <span className="text-blue-500">perfecto para ti.</span>
          </h1>
          <p className="text-slate-400 text-lg mt-4 leading-relaxed">
            Explora nuestro catálogo de vehículos nuevos y de ocasión. Las
            mejores marcas con las mejores condiciones.
          </p>
          <div className="flex gap-4 mt-8">
            <a
              href="#catalogo"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-sm"
            >
              Ver catálogo
            </a>
            {!loggedIn && (
              <Link
                href="/login"
                className="px-6 py-3 border border-slate-700 hover:border-slate-500 rounded-lg font-medium transition-colors text-sm"
              >
                Crear cuenta
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg">
          <div>
            <p className="text-3xl font-bold">{coches.length}</p>
            <p className="text-slate-500 text-sm mt-1">Vehículos</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{marcas.length}</p>
            <p className="text-slate-500 text-sm mt-1">Marcas</p>
          </div>
          <div>
            <p className="text-3xl font-bold">
              {coches.reduce((acc, c) => acc + c.stock, 0)}
            </p>
            <p className="text-slate-500 text-sm mt-1">En stock</p>
          </div>
        </div>
      </section>

      {marcas.length > 0 && (
        <section id="marcas" className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-semibold mb-6">Marcas disponibles</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFiltroMarca("")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                filtroMarca === ""
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Todas
            </button>
            {marcas.map((marca) => (
              <button
                key={marca.id}
                onClick={() =>
                  setFiltroMarca(
                    filtroMarca === marca.name ? "" : marca.name
                  )
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  filtroMarca === marca.name
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {marca.name}
                <span className="text-slate-500 ml-1.5 text-xs">
                  {marca.country}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section id="catalogo" className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            Catálogo
            {filtroMarca && (
              <span className="text-blue-500 ml-2">· {filtroMarca}</span>
            )}
          </h2>
          <p className="text-slate-500 text-sm">
            {cochesFiltrados.length} vehículo
            {cochesFiltrados.length !== 1 ? "s" : ""}
          </p>
        </div>

        {cochesFiltrados.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">No hay vehículos disponibles</p>
            <p className="text-sm mt-1">
              {filtroMarca
                ? "Prueba con otra marca"
                : "El catálogo se actualizará pronto"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cochesFiltrados.map((coche) => (
              <Link
                href={`/coches/${coche.id}`}
                key={coche.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors block"
              >
                <div className="bg-slate-800 rounded-lg h-40 flex items-center justify-center mb-4 overflow-hidden">
                  <img src="/car-placeholder.svg" alt="Imagen del vehículo" className="w-full h-full object-cover" />
                </div>

                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-blue-500 font-medium uppercase tracking-wider">
                      {coche.marca}
                    </p>
                    <h3 className="text-lg font-semibold mt-0.5">
                      {coche.modelo}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    {coche.anio}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                  <p className="text-xl font-bold">
                    {formatPrecio(coche.precio)}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      coche.stock > 0
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {coche.stock > 0
                      ? `${coche.stock} en stock`
                      : "Sin stock"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <p className="text-slate-600 text-sm">
            © 2026 AutoElite. Todos los derechos reservados.
          </p>
          <p className="text-slate-700 text-xs">Concesionario de coches</p>
        </div>
      </footer>
    </div>
  );
}
