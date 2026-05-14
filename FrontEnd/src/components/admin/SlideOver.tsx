"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  children: React.ReactNode;
}

export default function SlideOver({
  open,
  onClose,
  title,
  kicker,
  children,
}: SlideOverProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 60,
            pointerEvents: "auto",
          }}
        >
          {/* Backdrop — opacity-only para evitar repaints caros */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(20, 17, 13, 0.55)",
              border: 0,
              padding: 0,
              margin: 0,
              cursor: "default",
              willChange: "opacity",
            }}
          />

          {/* Panel — solo transform, sin animar shadow ni blur */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 38,
              mass: 0.9,
              restDelta: 0.001,
            }}
            role="dialog"
            aria-modal="true"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              maxWidth: 540,
              background: "var(--ink)",
              color: "var(--bone)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "-24px 0 50px rgba(0, 0, 0, 0.35)",
              willChange: "transform",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          >
            {/* Línea decorativa cobre */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: "var(--rust)",
                zIndex: 1,
              }}
            />

            <header className="flex items-start justify-between gap-6 px-8 lg:px-10 pt-10 pb-6 border-b border-bone/10">
              <div className="min-w-0">
                {kicker && (
                  <p className="kicker !text-bone/55 mb-3">{kicker}</p>
                )}
                <h2
                  className="text-3xl lg:text-4xl"
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontVariationSettings: '"opsz" 144, "SOFT" 40',
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="kicker !text-bone/60 hover:!text-bone shrink-0 cursor-pointer"
                style={{ transition: "color 0.3s ease" }}
              >
                Cerrar ✕
              </button>
            </header>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 overflow-y-auto px-8 lg:px-10 py-8"
            >
              {children}
            </motion.div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
