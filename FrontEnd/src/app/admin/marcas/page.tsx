"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import SlideOver from "@/components/admin/SlideOver";

interface Marca {
  id: number;
  name: string;
  country: string;
  logoUrl?: string;
}

interface Coche {
  id: number;
  marca: string;
}

interface MarcaForm {
  name: string;
  country: string;
  logoUrl: string;
}

const FORM_VACIO: MarcaForm = {
  name: "",
  country: "",
  logoUrl: "",
};

export default function AdminMarcasPage() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [coches, setCoches] = useState<Coche[]>([]);
  const [busqueda, setBusqueda] = useState("");

  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [editando, setEditando] = useState<Marca | null>(null);
  const [form, setForm] = useState<MarcaForm>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [borrando, setBorrando] = useState<number | null>(null);

  const [aviso, setAviso] = useState<{ tipo: "ok" | "err"; texto: string } | null>(
    null
  );

  const cargarDatos = () => {
    fetch("http://localhost:8080/api/marcas")
      .then((r) => (r.ok ? r.json() : []))
      .then(setMarcas)
      .catch(() => setMarcas([]));
    fetch("http://localhost:8080/api/coches")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCoches)
      .catch(() => setCoches([]));
  };

  useEffect(cargarDatos, []);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 3500);
    return () => clearTimeout(t);
  }, [aviso]);

  const contarCoches = (nombreMarca: string) =>
    coches.filter(
      (c) => c.marca.toLowerCase() === nombreMarca.toLowerCase()
    ).length;

  const marcasFiltradas = useMemo(() => {
    const lista = busqueda.trim()
      ? marcas.filter((m) => {
          const q = busqueda.trim().toLowerCase();
          return (
            m.name.toLowerCase().includes(q) ||
            (m.country || "").toLowerCase().includes(q)
          );
        })
      : marcas;
    return [...lista].sort((a, b) => b.id - a.id);
  }, [marcas, busqueda]);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setErrorForm("");
    setDrawerAbierto(true);
  };

  const abrirEditar = (m: Marca) => {
    setEditando(m);
    setForm({
      name: m.name,
      country: m.country || "",
      logoUrl: m.logoUrl || "",
    });
    setErrorForm("");
    setDrawerAbierto(true);
  };

  const cerrarDrawer = () => {
    if (guardando) return;
    setDrawerAbierto(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm("");

    if (!form.name.trim() || !form.country.trim()) {
      setErrorForm("Nombre y país son obligatorios.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorForm("Sesión expirada. Vuelve a iniciar sesión.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      country: form.country.trim(),
      logoUrl: form.logoUrl.trim() || null,
    };

    setGuardando(true);
    try {
      const url = editando
        ? `http://localhost:8080/api/marcas/${editando.id}`
        : "http://localhost:8080/api/marcas";
      const res = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 409) {
          setErrorForm("Ya existe una marca con ese nombre.");
        } else if (res.status === 403) {
          setErrorForm("No tienes permisos para esta acción.");
        } else if (res.status === 404) {
          setErrorForm("La marca ya no existe.");
        } else {
          setErrorForm("No se pudo guardar. Inténtalo de nuevo.");
        }
        return;
      }

      setAviso({
        tipo: "ok",
        texto: editando ? "Marca actualizada." : "Marca añadida.",
      });
      setDrawerAbierto(false);
      cargarDatos();
    } catch {
      setErrorForm("No se pudo conectar con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setBorrando(id);
    try {
      const res = await fetch(`http://localhost:8080/api/marcas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setAviso({ tipo: "err", texto: "No se pudo eliminar la marca." });
        return;
      }
      setAviso({ tipo: "ok", texto: "Marca eliminada." });
      setConfirmId(null);
      cargarDatos();
    } catch {
      setAviso({ tipo: "err", texto: "Sin conexión con el servidor." });
    } finally {
      setBorrando(null);
    }
  };

  return (
    <AdminShell>
      <main className="max-w-[1380px] mx-auto px-6 lg:px-10 pt-12 lg:pt-16 pb-24">
        <header className="border-b border-line pb-8 mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <p className="kicker">§ 03 · Marcas</p>
            <p className="kicker hidden md:block">
              {marcasFiltradas.length.toString().padStart(2, "0")} de{" "}
              {marcas.length.toString().padStart(2, "0")}
            </p>
          </div>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <h1 className="h-display text-5xl md:text-6xl lg:text-7xl">
              Casas y
              <br />
              <em className="italic-rust">carrocerías.</em>
            </h1>
            <button onClick={abrirNuevo} className="btn-ink shrink-0">
              + Nueva marca
            </button>
          </div>
        </header>

        {/* Búsqueda */}
        <section className="mb-10 max-w-md">
          <label htmlFor="busqueda-marcas" className="kicker block mb-1">
            Buscar por nombre o país
          </label>
          <input
            id="busqueda-marcas"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="ej. Toyota, Japón…"
            className="field"
          />
        </section>

        {/* Aviso transitorio */}
        {aviso && (
          <div
            className={`mb-8 px-4 py-3 border-l-2 text-sm animate-fadeup ${
              aviso.tipo === "ok"
                ? "border-ink bg-bone-soft text-ink"
                : "border-rust bg-bone-soft text-rust"
            }`}
          >
            {aviso.texto}
          </div>
        )}

        {/* Tabla */}
        {marcasFiltradas.length === 0 ? (
          <div className="py-32 text-center border-t border-b border-line">
            <p className="h-mid italic-soft text-3xl md:text-4xl text-ink-muted">
              Nada que mostrar
            </p>
            <p className="kicker mt-3">
              {busqueda
                ? "Prueba con otra búsqueda"
                : "Empieza añadiendo una marca"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  <th className="w-[60px]">#</th>
                  <th>Nombre</th>
                  <th>País</th>
                  <th className="w-[140px]">Coches</th>
                  <th className="w-[200px] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {marcasFiltradas.map((m) => {
                  const esConfirmacion = confirmId === m.id;
                  const nCoches = contarCoches(m.name);
                  return (
                    <tr key={m.id}>
                      <td className="font-mono text-ink-muted">
                        {m.id.toString().padStart(3, "0")}
                      </td>
                      <td>
                        <p className="h-mid text-[1.2rem]">{m.name}</p>
                      </td>
                      <td className="text-ink-soft">{m.country || "—"}</td>
                      <td>
                        <span className="badge">
                          {nCoches} coche{nCoches === 1 ? "" : "s"}
                        </span>
                      </td>
                      <td className="text-right">
                        {esConfirmacion ? (
                          <span className="inline-flex items-center gap-4">
                            <span className="kicker !text-rust">
                              ¿Eliminar?
                            </span>
                            <button
                              onClick={() => borrar(m.id)}
                              disabled={borrando === m.id}
                              className="row-action danger"
                            >
                              {borrando === m.id ? "…" : "Sí"}
                            </button>
                            <span className="text-ink-muted">·</span>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="row-action"
                            >
                              No
                            </button>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-5">
                            <button
                              onClick={() => abrirEditar(m)}
                              className="row-action"
                            >
                              Editar
                            </button>
                            <span className="text-line">·</span>
                            <button
                              onClick={() => setConfirmId(m.id)}
                              className="row-action danger"
                            >
                              Eliminar
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <SlideOver
        open={drawerAbierto}
        onClose={cerrarDrawer}
        kicker={
          editando
            ? `§ Marca #${editando.id.toString().padStart(3, "0")}`
            : "§ Nueva marca"
        }
        title={editando ? "Editar marca" : "Añadir marca"}
      >
        <form onSubmit={guardar} className="space-y-1">
          <p className="text-bone/70 leading-relaxed mb-8">
            {editando
              ? "Modifica los datos de la marca. Afecta solo al catálogo de marcas."
              : "Registra una marca nueva para poder asignarla a los coches."}
          </p>

          <div>
            <label className="kicker !text-bone/60 block mb-1">Nombre</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              required
              placeholder="Toyota, Ford, BMW…"
              className="field-dark"
            />
          </div>

          <div>
            <label className="kicker !text-bone/60 block mb-1 mt-5">
              País
            </label>
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={onChange}
              required
              placeholder="Japón, EEUU, Alemania…"
              className="field-dark"
            />
          </div>

          <div className="mt-5">
            <div className="flex items-baseline justify-between mb-1">
              <label className="kicker !text-bone/60">URL de logo</label>
              {form.logoUrl && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, logoUrl: "" })}
                  className="kicker !text-bone/40 hover:!text-rust cursor-pointer"
                >
                  Quitar
                </button>
              )}
            </div>
            <input
              type="text"
              name="logoUrl"
              value={form.logoUrl}
              onChange={onChange}
              placeholder="/seed/toyota-logo.svg o https://…"
              className="field-dark"
            />
            <div className="mt-3 h-28 bg-bone/5 border border-bone/10 overflow-hidden flex items-center justify-center p-4">
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt="Vista previa del logo"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.display = "block";
                  }}
                />
              ) : (
                <span className="kicker !text-bone/30">Sin logo</span>
              )}
            </div>
          </div>

          {errorForm && (
            <p
              className="mt-6 text-rust text-sm border-l-2 border-rust pl-3"
              role="alert"
            >
              {errorForm}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-10 pt-6 border-t border-bone/10">
            <button
              type="submit"
              disabled={guardando}
              className="btn-bone flex-1"
            >
              {guardando
                ? "Guardando…"
                : editando
                ? "Guardar cambios"
                : "Añadir marca"}
            </button>
            <button
              type="button"
              onClick={cerrarDrawer}
              className="btn-bone-ghost"
              disabled={guardando}
            >
              Cancelar
            </button>
          </div>
        </form>
      </SlideOver>
    </AdminShell>
  );
}
