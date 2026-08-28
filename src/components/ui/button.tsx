import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Botão-adesivo.
 *
 * A sombra é sólida e fica ABAIXO do botão; no `:active` ele desce 2px e a
 * sombra encolhe, produzindo a sensação física de afundar.
 *
 * A variante `default` é a do design system — antes era a do shadcn (chapada,
 * `rounded-md`, `font-medium`) e o estilo da Aulateca era opcional. Como
 * resultado, o admin e os diálogos ficaram com botões de outro produto: quem
 * escrevia `<Button>` sem pensar recebia o genérico. Agora o padrão é a marca
 * e o genérico tem nome próprio (`flat`), para quem realmente precisar.
 *
 * Desabilitado perde a sombra de propósito: sem o relevo, o botão deixa de
 * prometer que afunda — o estado fica legível mesmo para quem não distingue
 * a diferença de opacidade.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
    "font-fredoka font-bold tracking-[0.02em]",
    "transition-[color,background-color,border-color,box-shadow,transform] duration-press ease-press",
    "disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none disabled:translate-y-0",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground rounded-button shadow-sticker hover:bg-primary/95 active:translate-y-[2px] active:shadow-sticker-pressed",
        // Alias explícito: várias telas já pedem `sticker` pelo nome.
        sticker:
          "bg-primary text-primary-foreground rounded-button shadow-sticker hover:bg-primary/95 active:translate-y-[2px] active:shadow-sticker-pressed",
        // Ação secundária: papel branco com traço, o "white with bottom-shadow".
        secondary:
          "bg-card text-ink border-2 border-border rounded-button shadow-sticker-neutral hover:border-muted-foreground/50 active:translate-y-[2px] active:shadow-sticker-neutral-pressed",
        "sticker-outline":
          "bg-card text-primary border-2 border-border rounded-button shadow-sticker-neutral hover:border-primary active:translate-y-[2px] active:shadow-sticker-neutral-pressed",
        outline:
          "bg-card text-ink border-2 border-border rounded-button shadow-sticker-neutral hover:border-muted-foreground/50 active:translate-y-[2px] active:shadow-sticker-neutral-pressed",
        // Verde é acerto, vermelho é erro: cor com significado, não decoração.
        "sticker-success":
          "bg-success text-success-foreground rounded-button shadow-sticker-success hover:bg-success/95 active:translate-y-[2px] active:shadow-sticker-success-pressed",
        "sticker-sky":
          "bg-teca text-teca-foreground rounded-button shadow-sticker-sky hover:bg-teca/95 active:translate-y-[2px] active:shadow-sticker-sky-pressed",
        "sticker-sun":
          "bg-sun text-sun-foreground rounded-button shadow-sticker-sun hover:bg-sun/95 active:translate-y-[2px] active:shadow-sticker-sun-pressed",
        destructive:
          "bg-danger text-danger-foreground rounded-button shadow-sticker-danger hover:bg-danger/95 active:translate-y-[2px] active:shadow-sticker-danger-pressed",

        // ── Sem relevo ──
        // `ghost` é o "Cancelar" ao lado de um botão-adesivo: precisa ser
        // visivelmente a ação menor, então não ganha sombra nenhuma.
        ghost: "rounded-button text-muted-foreground hover:bg-secondary hover:text-ink",
        link: "text-primary underline-offset-4 hover:underline",
        // Escape para superfícies onde o relevo não cabe (dentro de célula
        // de tabela, barra de ferramentas densa).
        flat: "bg-primary text-primary-foreground rounded-button hover:bg-primary/90",
      },
      size: {
        // 44px: alvo de toque confortável. O h-10 anterior (40px) ficava no
        // limite, e a maioria dos botões do app é usada no celular.
        default: "h-11 px-5 text-[15px]",
        sm: "h-9 px-3.5 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
        // Tracking 0.053em em caixa alta: a medida do DESIGN.md para rótulos
        // de ação. É o que faz o botão soar "brinquedo" e não "formulário".
        chunky: "h-12 px-6 text-base uppercase tracking-[0.053em]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
