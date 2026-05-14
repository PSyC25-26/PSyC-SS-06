"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

interface Coche {
  id: number;
  marca: string;
  modelo: string;
  precio: number;
  anio: number;
  stock: number;
}

interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  esAdmin: boolean;
}

interface Marca {
  id: number;
  name: string;
  country: string;
}

const fmtPrecio = (precio: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(precio);

export default function AdminDashboard() {
  const [coches, setCoches] = useState<Coche[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/coches")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCoches)
      .catch(() => setCoches([]));
    fetch("http://localhost:8080/api/usuarios")
      .then((r) => (r.ok ? r.json() : []))
      .then(setUsuarios)
      .catch(() => setUsuarios([]));
    fetch("http://localhost:8080/api/marcas")
      .then((r) => (r.ok ? r.json() : []))
      .then(setMarcas)
      .catch(() => setMarcas([]));
  }, []);

  const stockTotal = coches.reduce((acc, c) => acc + c.stock, 0);
  const admins = usuarios.filter((u) => u.esAdmin).length;
  const sinStock = coches.filter((c) => c.stock === 0).length;
  const valorInventario = coches.reduce(
    (acc, c) => acc + c.precio * c.stock,
    0
  );

  const ultimosCoches = [...coches].reverse().slice(0, 5);
  const ultimosUsuarios = [...usuarios].reverse().slice(0, 5);

  return (
    <AdminShell>
      <main className="max-w-[1380px] mx-auto px-6 lg:px-10 pt-14 lg:pt-20 pb-24">
        {/* Cabecera */}
        <header className="border-b border-line pb-8 mb-14">
          <div className="flex items-baseline justify-between mb-4">
            <p className="kicker">§ Resumen general</p>
            <p className="kicker hidden md:block">
              Vol. III · Trastienda · {new Date().getFullYear()}
            </p>
          </div>
          <h1 className="h-display text-[clamp(3.5rem,8vw,7rem)] rise">
            La <em className="italic-rust">casa</em>
            <br />
            por dentro.
          </h1>
          <p className="text-ink-soft mt-6 max-w-xl leading-relaxed">
            Estado del inventario, movimientos recientes y atajos para gestionar
            piezas y clientes.
          </p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 border-b border-line pb-14 mb-16">
          <Stat label="Piezas en catálogo" value={coches.length} />
          <Stat label="Stock total" value={stockTotal} />
          <Stat label="Clientes registrados" value={usuarios.length} />
          <Stat label="Marcas representadas" value={marcas.length} />
        </section>

        {/* Atajos */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <Link
            href="/admin/coches"
            className="group flex items-end justify-between bg-bone-soft border border-line-soft px-8 py-10 hover:border-ink transition-colors"
          >
            <div>
              <p className="kicker mb-3">§ 01</p>
              <p className="h-display-soft text-3xl lg:text-4xl mb-2">
                Inventario
              </p>
              <p className="text-ink-soft text-sm">
                Añadir, editar o retirar piezas
              </p>
            </div>
            <span className="kicker text-ink group-hover:text-rust transition-colors">
              Entrar →
            </span>
          </Link>

          <Link
            href="/admin/usuarios"
            className="group flex items-end justify-between bg-bone-soft border border-line-soft px-8 py-10 hover:border-ink transition-colors"
          >
            <div>
              <p className="kicker mb-3">§ 02</p>
              <p className="h-display-soft text-3xl lg:text-4xl mb-2">
                Clientela
              </p>
              <p className="text-ink-soft text-sm">
                Altas, permisos y mantenimiento
              </p>
            </div>
            <span className="kicker text-ink group-hover:text-rust transition-colors">
              Entrar →
            </span>
          </Link>
        </section>

        {/* Columnas finales */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-14">
          <section className="lg:col-span-7">
            <header className="flex items-end justify-between mb-6 border-b border-line pb-4">
              <div>
                <p className="kicker mb-2">§ Inventario</p>
                <h2 className="h-display-soft text-3xl">Últimas piezas</h2>
              </div>
              <Link
                href="/admin/coches"
                className="kicker ed-underline !text-ink-soft hover:!text-ink"
              >
                Ver todas →
              </Link>
            </header>

            {ultimosCoches.length === 0 ? (
              <p className="text-ink-muted py-10">Aún no hay piezas.</p>
            ) : (
              <ul>
                {ultimosCoches.map((c) => (
                  <li
                    key={c.id}
                    className="grid grid-cols-12 gap-4 items-baseline py-5 border-b border-line-soft"
                  >
                    <span className="col-span-1 font-mono text-xs text-ink-muted">
                      #{c.id.toString().padStart(3, "0")}
                    </span>
                    <div className="col-span-6 min-w-0">
                      <p className="kicker text-ink-muted">{c.marca}</p>
                      <p className="h-mid text-xl truncate">{c.modelo}</p>
                    </div>
                    <span className="col-span-2 text-right font-mono text-xs text-ink-muted">
                      {c.anio}
                    </span>
                    <span className="col-span-3 text-right h-title">
                      {fmtPrecio(c.precio)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="lg:col-span-5">
            <header className="flex items-end justify-between mb-6 border-b border-line pb-4">
              <div>
                <p className="kicker mb-2">§ Clientela</p>
                <h2 className="h-display-soft text-3xl">Últimos clientes</h2>
              </div>
              <Link
                href="/admin/usuarios"
                className="kicker ed-underline !text-ink-soft hover:!text-ink"
              >
                Ver todos →
              </Link>
            </header>

            {ultimosUsuarios.length === 0 ? (
              <p className="text-ink-muted py-10">Aún no hay clientes.</p>
            ) : (
              <ul>
                {ultimosUsuarios.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-baseline justify-between gap-4 py-5 border-b border-line-soft"
                  >
                    <div className="min-w-0">
                      <p className="h-title text-lg truncate">
                        {u.nombre} {u.apellidos || ""}
                      </p>
                      <p className="font-mono text-xs text-ink-muted truncate">
                        {u.email}
                      </p>
                    </div>
                    <span className={`badge ${u.esAdmin ? "admin" : ""}`}>
                      {u.esAdmin ? "Admin" : "Cliente"}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-10 border border-line-soft bg-bone-soft px-6 py-6">
              <p className="kicker mb-3">§ Apuntes</p>
              <dl className="space-y-3">
                <div className="flex items-baseline justify-between text-sm">
                  <dt className="text-ink-soft">Administradores</dt>
                  <dd className="h-title">
                    {admins.toString().padStart(2, "0")}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between text-sm">
                  <dt className="text-ink-soft">Piezas sin stock</dt>
                  <dd className="h-title">
                    {sinStock.toString().padStart(2, "0")}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between text-sm border-t border-line-soft pt-3">
                  <dt className="text-ink-soft">Valor del inventario</dt>
                  <dd className="h-display-soft text-xl text-rust">
                    {fmtPrecio(valorInventario)}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      </main>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="kicker">{label}</p>
      <p className="numeral text-5xl lg:text-6xl mt-2">
        {value.toString().padStart(2, "0")}
      </p>
    </div>
  );
}
