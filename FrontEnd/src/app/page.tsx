import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <h1 className="text-5xl font-bold tracking-tight mb-2">
        Auto<span className="text-blue-500">Elite</span>
      </h1>
      <p className="text-slate-400 mb-8 text-lg">Tu concesionario de confianza</p>
      <Link
        href="/login"
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-600/20"
      >
        Acceder
      </Link>
    </div>
  );
}
