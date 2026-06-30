"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { useEstadoSync } from "@/lib/sync";
import { useAlarmaValidacion } from "@/lib/notificaciones";

const NAV = [
  { href: "/", etiqueta: "Inicio", icono: "◉" },
  { href: "/ninos", etiqueta: "Niños", icono: "🧒" },
  { href: "/reunificacion", etiqueta: "Reunificar", icono: "🤝" },
  { href: "/cordones", etiqueta: "Cordones", icono: "🛡" },
  { href: "/voluntarios", etiqueta: "Voluntarios", icono: "👥" },
  { href: "/validacion", etiqueta: "Validar", icono: "🔔" },
  { href: "/insumos", etiqueta: "Insumos", icono: "📦" },
  { href: "/brazaletes", etiqueta: "Brazaletes", icono: "🏷" },
  { href: "/mascotas", etiqueta: "Mascotas", icono: "🐾" },
  { href: "/notificaciones", etiqueta: "Avisos", icono: "📨" },
];

function IndicadorSync() {
  const { online, configurado, pendientes } = useEstadoSync();
  let texto: string;
  let color: string;
  if (!online) {
    texto = pendientes > 0 ? `Sin señal · ${pendientes} por sincronizar` : "Sin señal · guardando local";
    color = "var(--ambar)";
  } else if (!configurado) {
    texto = "Local (sin servidor)";
    color = "var(--gris)";
  } else if (pendientes > 0) {
    texto = `Sincronizando · ${pendientes}`;
    color = "var(--azul)";
  } else {
    texto = "Sincronizado";
    color = "var(--verde)";
  }
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      {texto}
    </span>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pendientesValidacion = useAlarmaValidacion();
  return (
    <div className="flex min-h-full flex-col">
      {/* Barra superior */}
      <header className="sticky top-0 z-30 border-b border-[var(--linea)] bg-[var(--blanco)]/95 backdrop-blur no-imprimir">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--verde)] text-base font-black text-white">
              W
            </span>
            <span className="text-base font-extrabold tracking-tight text-[var(--tinta)]">Waraira</span>
          </Link>
          <IndicadorSync />
        </div>
        {/* Banner legal persistente */}
        <div className="bg-[var(--ambar-bg)] px-4 py-1.5 text-center text-[11px] font-semibold text-[var(--ambar)]">
          Waraira coordina y <b>deriva</b> al Consejo de Protección / Tribunal · no es autoridad legal · identidad de menores nunca pública (LOPNNA art. 65)
        </div>
      </header>

      {/* Contenido */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-4">{children}</main>

      {/* Navegación inferior (scroll horizontal en móvil) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--linea)] bg-[var(--blanco)]/95 backdrop-blur no-imprimir">
        <div className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-2 py-1.5">
          {NAV.map((n) => {
            const activo = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className="relative flex min-w-[64px] flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-bold no-underline"
                style={{
                  color: activo ? "#fff" : "var(--gris)",
                  background: activo ? "var(--verde)" : "transparent",
                }}
              >
                <span className="text-lg leading-none">{n.icono}</span>
                {n.href === "/validacion" && pendientesValidacion > 0 && (
                  <span className="absolute right-2 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--rojo)] px-1 text-[10px] font-black text-white">
                    {pendientesValidacion}
                  </span>
                )}
                {n.etiqueta}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
