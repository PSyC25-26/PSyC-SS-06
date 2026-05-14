"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  variant?: "light" | "dark";
  label?: string;
  className?: string;
  id?: string;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Selecciona…",
  variant = "light",
  label,
  className = "",
  id: idProp,
}: SelectProps) {
  const reactId = useId();
  const id = idProp ?? reactId;
  const listboxId = `${id}-listbox`;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);
  const isDark = variant === "dark";

  // Cerrar al pulsar fuera
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  // Teclado: Escape, flechas, Enter
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Home") {
        e.preventDefault();
        setActiveIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setActiveIndex(options.length - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < options.length) {
          onChange(options[activeIndex].value);
          setOpen(false);
        }
      } else if (e.key === "Tab") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, activeIndex, options, onChange]);

  // Scroll del item activo a la vista
  useEffect(() => {
    if (!open || activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const toggleOpen = () => {
    if (!open) {
      // Al abrir, posicionar el highlight sobre el seleccionado
      const idx = options.findIndex((o) => o.value === value);
      setActiveIndex(idx >= 0 ? idx : 0);
    }
    setOpen((v) => !v);
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`kicker block mb-1 ${isDark ? "!text-bone/60" : ""}`}
        >
          {label}
        </label>
      )}

      <button
        type="button"
        id={id}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={`group w-full flex items-center justify-between gap-3 text-left cursor-pointer outline-none py-3 transition-colors ${
          isDark
            ? "text-bone border-b border-bone/20 hover:border-bone/45 focus-visible:border-bone"
            : "text-ink border-b border-line hover:border-ink-soft focus-visible:border-ink"
        }`}
      >
        <span
          className={`truncate text-[0.95rem] tracking-[0.01em] ${
            selected
              ? ""
              : isDark
              ? "text-bone/40"
              : "text-ink-muted"
          }`}
        >
          {selected ? selected.label : placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          className={`shrink-0 ${isDark ? "text-bone/55" : "text-ink-muted"}`}
          aria-hidden="true"
        >
          <svg
            width="11"
            height="7"
            viewBox="0 0 11 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1l4.5 4.5L10 1"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="square"
            />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className={`absolute top-full left-0 right-0 mt-2 z-50 max-h-72 overflow-y-auto py-1.5 ${
              isDark
                ? "bg-ink-lift text-bone border border-bone/10 shadow-[0_24px_40px_rgba(0,0,0,0.45)]"
                : "bg-bone-soft text-ink border border-line shadow-[0_18px_30px_rgba(20,17,13,0.10)]"
            }`}
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              const isActive = i === activeIndex;
              const baseBg = isDark
                ? isActive
                  ? "bg-bone/10"
                  : ""
                : isActive
                ? "bg-bone"
                : "";
              const hoverBg = isDark ? "hover:bg-bone/10" : "hover:bg-bone";
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  data-index={i}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-baseline justify-between gap-4 cursor-pointer transition-colors ${baseBg} ${hoverBg}`}
                  >
                    <span className="flex items-baseline gap-3 min-w-0">
                      <span
                        className={`shrink-0 font-mono text-[0.62rem] tracking-[0.22em] uppercase ${
                          isDark ? "text-bone/40" : "text-ink-muted"
                        }`}
                      >
                        {(i + 1).toString().padStart(2, "0")}
                      </span>
                      <span
                        className={`h-title truncate text-[1.05rem] ${
                          isSelected
                            ? isDark
                              ? "text-bone"
                              : "text-ink"
                            : isDark
                            ? "text-bone/85"
                            : "text-ink-soft"
                        }`}
                      >
                        {opt.label}
                      </span>
                      {opt.hint && (
                        <span
                          className={`shrink-0 kicker ${
                            isDark ? "!text-bone/40" : ""
                          }`}
                        >
                          {opt.hint}
                        </span>
                      )}
                    </span>
                    {isSelected && (
                      <span
                        className="shrink-0 inline-block w-1.5 h-1.5 rounded-full bg-rust"
                        aria-hidden
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
