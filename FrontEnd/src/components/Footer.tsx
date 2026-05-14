import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contacto" className="border-t border-line-soft mt-32">
      <div className="max-w-[1380px] mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <p
              className="text-4xl md:text-5xl leading-[0.95] tracking-tight"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontVariationSettings: '"opsz" 144, "SOFT" 60',
              }}
            >
              Una cita,
              <br />
              <em className="italic text-rust">una historia.</em>
            </p>
            <p className="mt-6 text-ink-soft max-w-sm leading-relaxed">
              Visita nuestro showroom o concierta una llamada con un
              especialista. Te acompañamos durante todo el proceso de compra.
            </p>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <p className="kicker mb-4">Showroom</p>
            <p className="text-ink leading-relaxed">
              Calle Velázquez 64
              <br />
              28001 Madrid
            </p>
            <p className="text-ink-soft mt-3 text-sm">
              Lunes — Sábado · 10 a 20h
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="kicker mb-4">Contacto</p>
            <p className="text-ink">+34 910 000 000</p>
            <p className="text-ink-soft mt-1 text-sm">hola@autoelite.es</p>
            <div className="flex gap-5 mt-5 text-[0.7rem] tracking-[0.22em] uppercase text-ink-muted">
              <Link href="#" className="ed-underline hover:text-ink">
                Instagram
              </Link>
              <Link href="#" className="ed-underline hover:text-ink">
                LinkedIn
              </Link>
            </div>
          </div>
        </div>

        <div className="rule mt-14" />

        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[0.7rem] tracking-[0.22em] uppercase text-ink-muted">
          <p>© 2026 AutoElite · Concesionario</p>
          <p>
            Madrid <span className="dot mx-3 align-middle" /> España
          </p>
        </div>
      </div>
    </footer>
  );
}
