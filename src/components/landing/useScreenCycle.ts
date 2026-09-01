import { useEffect, useRef, useState } from "react";

/** Intervalo entre telas. O mesmo nos dois celulares da landing. */
export const SCREEN_MS = 3200;

/**
 * Avanço automático das telas de um celular da landing.
 *
 * Só conta o tempo enquanto o aparelho está visível e a aba está em foco — não
 * faz sentido re-renderizar o celular enquanto a visitante lê o resto da
 * página — e não roda nada sob `prefers-reduced-motion`.
 *
 * `setScreen` volta junto porque o tutorial também navega à mão, pelas
 * bolinhas: o timer é conveniência, não a única forma de ver os três passos.
 */
export function useScreenCycle(total: number) {
  const [screen, setScreen] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const el = ref.current;
    if (!el) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    let onScreen = false;

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const sync = () => {
      const shouldRun = onScreen && document.visibilityState === "visible";
      if (shouldRun && !timer) {
        timer = setInterval(() => setScreen((s) => (s + 1) % total), SCREEN_MS);
      } else if (!shouldRun) {
        stop();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          onScreen = entry.isIntersecting;
        });
        sync();
      },
      { threshold: 0 },
    );

    observer.observe(el);
    document.addEventListener("visibilitychange", sync);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [total]);

  return { screen, setScreen, ref };
}
