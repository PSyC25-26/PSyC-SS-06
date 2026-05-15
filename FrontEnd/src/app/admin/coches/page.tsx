"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import SlideOver from "@/components/admin/SlideOver";
import Select, { type SelectOption } from "@/components/admin/Select";

interface Coche {
  id: number;
  marca: string;
  modelo: string;
  precio: number;
  anio: number;
  stock: number;
  imagenUrl?: string;
}

interface Marca {
  id: number;
  name: string;
  country: string;
}

interface CocheForm {
  marca: string;
  modelo: string;
  precio: string;
  anio: string;
  stock: string;
  imagenUrl: string;
}

const FORM_VACIO: CocheForm = {
  marca: "",
  modelo: "",
  precio: "",
  anio: "",
  stock: "",
  imagenUrl: "",
};

const fmtPrecio = (precio: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(precio);

type Orden = "recientes" | "precio-asc" | "precio-desc" | "anio-desc";

const OPCIONES_ORDEN: SelectOption[] = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio-desc", label: "Precio: alto a bajo" },
  { value: "precio-asc", label: "Precio: bajo a alto" },
  { value: "anio-desc", label: "Año: nuevos primero" },
];

export default function AdminCochesPage() {
  const [coches, setCoches] = useState<Coche[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [orden, setOrden] = useState<Orden>("recientes");

  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [editando, setEditando] = useState<Coche | null>(null);
  const [form, setForm] = useState<CocheForm>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [borrando, setBorrando] = useState<number | null>(null);

  const [aviso, setAviso] = useState<{ tipo: "ok" | "err"; texto: string } | null>(
    null
  );

  const cargarDatos = () => {
    fetch("http://localhost:8080/api/coches")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCoches)
      .catch(() => setCoches([]));
    fetch("http://localhost:8080/api/marcas")
      .then((r) => (r.ok ? r.json() : []))
      .then(setMarcas)
      .catch(() => setMarcas([]));
  };

  useEffect(cargarDatos, []);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 3500);
    return () => clearTimeout(t);
  }, [aviso]);

  const cochesFiltrados = useMemo(() => {
    let lista = coches;
    if (filtroMarca) {
      lista = lista.filter(
        (c) => c.marca.toLowerCase() === filtroMarca.toLowerCase()
      );
    }
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter(
        (c) =>
          c.modelo.toLowerCase().includes(q) ||
          c.marca.toLowerCase().includes(q)
      );
    }
    const ord = [...lista];
    switch (orden) {
      case "precio-asc":
        ord.sort((a, b) => a.precio - b.precio);
        break;
      case "precio-desc":
        ord.sort((a, b) => b.precio - a.precio);
        break;
      case "anio-desc":
        ord.sort((a, b) => b.anio - a.anio);
        break;
      default:
        ord.sort((a, b) => b.id - a.id);
    }
    return ord;
  }, [coches, filtroMarca, busqueda, orden]);

  const opcionesMarca: SelectOption[] = useMemo(
    () => [
      { value: "", label: "Todas las marcas" },
      ...marcas.map((m) => ({
        value: m.name,
        label: m.name,
        hint: m.country,
      })),
    ],
    [marcas]
  );

  const opcionesMarcaForm: SelectOption[] = useMemo(
    () =>
      marcas.map((m) => ({
        value: m.name,
        label: m.name,
        hint: m.country,
      })),
    [marcas]
  );

  const abrirNuevo = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setErrorForm("");
    setDrawerAbierto(true);
  };

  const abrirEditar = (c: Coche) => {
    setEditando(c);
    setForm({
      marca: c.marca,
      modelo: c.modelo,
      precio: c.precio.toString(),
      anio: c.anio.toString(),
      stock: c.stock.toString(),
      imagenUrl: c.imagenUrl || "",
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

    const precio = parseFloat(form.precio);
    const anio = parseInt(form.anio);
    const stock = parseInt(form.stock);

    if (
      !form.marca ||
      !form.modelo ||
      Number.isNaN(precio) ||
      Number.isNaN(anio) ||
      Number.isNaN(stock)
    ) {
      setErrorForm("Revisa los campos: faltan datos válidos.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorForm("Sesión expirada. Vuelve a iniciar sesión.");
      return;
    }

    const payload = {
      marca: form.marca,
      modelo: form.modelo,
      precio,
      anio,
      stock,
      imagenUrl: form.imagenUrl.trim() || null,
    };

    setGuardando(true);
    try {
      const url = editando
        ? `http://localhost:8080/api/coches/${editando.id}`
        : "http://localhost:8080/api/coches";
      const res = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 403) {
          setErrorForm("No tienes permisos para esta acción.");
        } else if (res.status === 404) {
          setErrorForm("La pieza ya no existe.");
        } else {
          setErrorForm("No se pudo guardar. Inténtalo de nuevo.");
        }
        return;
      }

      setAviso({
        tipo: "ok",
        texto: editando ? "Pieza actualizada." : "Pieza añadida al catálogo.",
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
      const res = await fetch(`http://localhost:8080/api/coches/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setAviso({ tipo: "err", texto: "No se pudo eliminar la pieza." });
        return;
      }
      setAviso({ tipo: "ok", texto: "Pieza retirada del catálogo." });
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
            <p className="kicker">§ 01 · Inventario</p>
            <p className="kicker hidden md:block">
              {cochesFiltrados.length.toString().padStart(2, "0")} de{" "}
              {coches.length.toString().padStart(2, "0")}
            </p>
          </div>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <h1 className="h-display text-5xl md:text-6xl lg:text-7xl">
              El <em className="italic-rust">catálogo</em>,
              <br />
              pieza a pieza.
            </h1>
            <button onClick={abrirNuevo} className="btn-ink shrink-0">
              + Nueva pieza
            </button>
          </div>
        </header>

        {/* Filtros */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 mb-10 items-end">
          <div className="md:col-span-5">
            <label htmlFor="busqueda" className="kicker block mb-1">
              Buscar por modelo o marca
            </label>
            <input
              id="busqueda"
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="ej. Mustang, Toyota…"
              className="field"
            />
          </div>
          <div className="md:col-span-4">
            <Select
              label="Filtrar por marca"
              value={filtroMarca}
              onChange={setFiltroMarca}
              options={opcionesMarca}
            />
          </div>
          <div className="md:col-span-3">
            <Select
              label="Ordenar"
              value={orden}
              onChange={(v) => setOrden(v as Orden)}
              options={OPCIONES_ORDEN}
            />
          </div>
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
        {cochesFiltrados.length === 0 ? (
          <div className="py-32 text-center border-t border-b border-line">
            <p className="h-mid italic-soft text-3xl md:text-4xl text-ink-muted">
              Nada que mostrar
            </p>
            <p className="kicker mt-3">
              {busqueda || filtroMarca
                ? "Prueba con otros filtros"
                : "Empieza añadiendo una pieza"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  <th className="w-[60px]">#</th>
                  <th>Marca · Modelo</th>
                  <th className="w-[90px]">Año</th>
                  <th className="w-[150px]">Precio</th>
                  <th className="w-[120px]">Stock</th>
                  <th className="w-[200px] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cochesFiltrados.map((c) => {
                  const esConfirmacion = confirmId === c.id;
                  return (
                    <tr key={c.id}>
                      <td className="font-mono text-ink-muted">
                        {c.id.toString().padStart(3, "0")}
                      </td>
                      <td>
                        <p className="kicker !text-ink-muted mb-1">{c.marca}</p>
                        <p className="h-mid text-[1.2rem]">{c.modelo}</p>
                      </td>
                      <td className="font-mono text-ink-soft">{c.anio}</td>
                      <td className="h-title text-[1.05rem]">
                        {fmtPrecio(c.precio)}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            c.stock === 0
                              ? "stock-out"
                              : c.stock <= 2
                              ? "stock-low"
                              : ""
                          }`}
                        >
                          {c.stock === 0
                            ? "Sin stock"
                            : `${c.stock} ud${c.stock > 1 ? "s" : ""}`}
                        </span>
                      </td>
                      <td className="text-right">
                        {esConfirmacion ? (
                          <span className="inline-flex items-center gap-4">
                            <span className="kicker !text-rust">
                              ¿Eliminar?
                            </span>
                            <button
                              onClick={() => borrar(c.id)}
                              disabled={borrando === c.id}
                              className="row-action danger"
                            >
                              {borrando === c.id ? "…" : "Sí"}
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
                              onClick={() => abrirEditar(c)}
                              className="row-action"
                            >
                              Editar
                            </button>
                            <span className="text-line">·</span>
                            <button
                              onClick={() => setConfirmId(c.id)}
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
            ? `§ Pieza #${editando.id.toString().padStart(3, "0")}`
            : "§ Nueva pieza"
        }
        title={editando ? "Editar ficha" : "Añadir al catálogo"}
      >
        <form onSubmit={guardar} className="space-y-1">
          <p className="text-bone/70 leading-relaxed mb-8">
            {editando
              ? "Modifica los datos de la pieza. Los cambios se aplicarán al instante."
              : "Rellena los datos para registrar un nuevo vehículo en el catálogo."}
          </p>

          {marcas.length > 0 ? (
            <Select
              label="Marca"
              variant="dark"
              value={form.marca}
              onChange={(v) => setForm({ ...form, marca: v })}
              options={opcionesMarcaForm}
              placeholder="Selecciona una marca…"
            />
          ) : (
            <div>
              <label className="kicker !text-bone/60 block mb-1">Marca</label>
              <input
                type="text"
                name="marca"
                value={form.marca}
                onChange={onChange}
                required
                placeholder="Toyota, Ford, BMW…"
                className="field-dark"
              />
            </div>
          )}

          <div>
            <label className="kicker !text-bone/60 block mb-1 mt-5">
              Modelo
            </label>
            <input
              type="text"
              name="modelo"
              value={form.modelo}
              onChange={onChange}
              required
              placeholder="Corolla, Mustang…"
              className="field-dark"
            />
          </div>

          <div className="grid grid-cols-3 gap-5 mt-5">
            <div>
              <label className="kicker !text-bone/60 block mb-1">
                Precio (€)
              </label>
              <input
                type="number"
                name="precio"
                value={form.precio}
                onChange={onChange}
                required
                min="0"
                step="100"
                placeholder="25000"
                className="field-dark"
              />
            </div>
            <div>
              <label className="kicker !text-bone/60 block mb-1">Año</label>
              <input
                type="number"
                name="anio"
                value={form.anio}
                onChange={onChange}
                required
                min="1900"
                max="2035"
                placeholder="2024"
                className="field-dark"
              />
            </div>
            <div>
              <label className="kicker !text-bone/60 block mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={onChange}
                required
                min="0"
                placeholder="5"
                className="field-dark"
              />
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-baseline justify-between mb-1">
              <label className="kicker !text-bone/60">URL de imagen</label>
              {form.imagenUrl && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imagenUrl: "" })}
                  className="kicker !text-bone/40 hover:!text-rust cursor-pointer"
                >
                  Quitar
                </button>
              )}
            </div>
            <input
              type="text"
              name="imagenUrl"
              value={form.imagenUrl}
              onChange={onChange}
              placeholder="/seed/toyota-corolla.jpg o https://…"
              className="field-dark"
            />
            <div className="mt-3 h-36 bg-bone/5 border border-bone/10 overflow-hidden flex items-center justify-center">
              {form.imagenUrl ? (
                <img
                  src={form.imagenUrl}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.display = "block";
                  }}
                />
              ) : (
                <span className="kicker !text-bone/30">Sin imagen</span>
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
                : "Añadir pieza"}
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
