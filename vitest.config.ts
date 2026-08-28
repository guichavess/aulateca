import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // As Edge Functions rodam em Deno, mas as regras puras do webhook da Cakto
    // (supabase/functions/**/cakto.ts) não tocam nenhuma API do runtime — e são
    // a parte que decide quem tem acesso pago. Ficam cobertas aqui.
    include: ["src/**/*.{test,spec}.{ts,tsx}", "supabase/functions/**/*.{test,spec}.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
