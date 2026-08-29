import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// jsdom não implementa IntersectionObserver, e componentes que animam ao
// entrar na tela (HeroPhone) quebram no mount sem ele. O dublê nunca dispara:
// o que os testes verificam é o conteúdo renderizado, não a animação.
class ObservadorDeInterseccaoFalso implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: ObservadorDeInterseccaoFalso,
});
globalThis.IntersectionObserver = ObservadorDeInterseccaoFalso;
