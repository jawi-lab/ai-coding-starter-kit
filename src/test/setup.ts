import '@testing-library/jest-dom'

// Node 26 bringt ein eigenes globales `localStorage` mit, das ohne
// `--localstorage-file` undefined ist und die jsdom-Variante verdeckt. Ohne
// Ersatz scheitert jeder Test an Code, der Speicher liest (z. B. useTheme).
if (typeof window !== 'undefined' && !window.localStorage) {
  const createStorage = (): Storage => {
    const store = new Map<string, string>()
    return {
      get length() {
        return store.size
      },
      key: (i: number) => [...store.keys()][i] ?? null,
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    } as Storage
  }

  for (const name of ['localStorage', 'sessionStorage'] as const) {
    Object.defineProperty(window, name, { value: createStorage(), configurable: true })
    Object.defineProperty(globalThis, name, { value: window[name], configurable: true })
  }
}
