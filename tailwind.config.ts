import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // sans apontava para a stack default do Tailwind enquanto o body usava
        // Nunito — qualquer `font-sans` trocava de fonte silenciosamente.
        sans: ["Nunito", "system-ui", "sans-serif"],
        fredoka: ["Fredoka", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          deep: "hsl(var(--primary-deep))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          deep: "hsl(var(--success-deep))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
          deep: "hsl(var(--danger-deep))",
        },
        // "teca" e não "sky": Tailwind já tem uma escala sky-* em uso no
        // admin e no login, e sobrescrever o nome apagaria sky-300/500/600.
        teca: {
          DEFAULT: "hsl(var(--sky))",
          foreground: "hsl(var(--sky-foreground))",
          deep: "hsl(var(--sky-deep))",
        },
        sun: {
          DEFAULT: "hsl(var(--sun))",
          foreground: "hsl(var(--sun-foreground))",
          deep: "hsl(var(--sun-deep))",
        },
        ink: "hsl(var(--ink))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        brand: {
          purple: "hsl(var(--brand-purple))",
          "purple-light": "hsl(var(--brand-purple-light))",
          red: "hsl(var(--brand-red))",
          teal: "hsl(var(--brand-teal))",
          blue: "hsl(var(--brand-blue))",
          yellow: "hsl(var(--brand-yellow))",
          lilac: "hsl(var(--brand-lilac))",
          pink: "hsl(var(--brand-pink))",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Escala única do design system (ver src/index.css).
        button: "var(--radius-button)",
        card: "var(--radius-card)",
        panel: "var(--radius-panel)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        // Sombra sólida, não difusa: o efeito "adesivo colado no papel".
        sticker: "var(--shadow-sticker)",
        "sticker-pressed": "var(--shadow-sticker-pressed)",
        "sticker-neutral": "var(--shadow-sticker-neutral)",
        "sticker-neutral-pressed": "var(--shadow-sticker-neutral-pressed)",
        "sticker-sky": "var(--shadow-sticker-sky)",
        "sticker-sky-pressed": "var(--shadow-sticker-sky-pressed)",
        "sticker-success": "var(--shadow-sticker-success)",
        "sticker-success-pressed": "var(--shadow-sticker-success-pressed)",
        "sticker-danger": "var(--shadow-sticker-danger)",
        "sticker-danger-pressed": "var(--shadow-sticker-danger-pressed)",
        "sticker-sun": "var(--shadow-sticker-sun)",
        "sticker-sun-pressed": "var(--shadow-sticker-sun-pressed)",
      },
      // Escala tipográfica do DESIGN.md. Os títulos do app eram montados
      // com `text-2xl`/`text-3xl` escolhidos tela a tela — dois "títulos de
      // página" acabavam com tamanhos diferentes. Aqui o papel vira o nome.
      fontSize: {
        display: ["clamp(2.25rem, 5.5vw, 3.5rem)", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        h1: ["clamp(1.75rem, 3.5vw, 2rem)", { lineHeight: "1.15", letterSpacing: "-0.005em" }],
        h2: ["1.5rem", { lineHeight: "1.2" }],
        h3: ["1.125rem", { lineHeight: "1.25" }],
        "body-lg": ["1.0625rem", { lineHeight: "1.5" }],
        caption: ["0.8125rem", { lineHeight: "1.4", letterSpacing: "0.01em" }],
      },
      transitionTimingFunction: {
        press: "var(--ease-press)",
        back: "var(--ease-back)",
      },
      transitionDuration: {
        press: "var(--dur-press)",
        enter: "var(--dur-enter)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate, typography],
} satisfies Config;
