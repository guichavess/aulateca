import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Toast no estilo adesivo.
 *
 * O padrão do shadcn usava `shadow-lg` — sombra difusa, justamente o efeito
 * que o resto do app abandonou. E os três tipos (erro, sucesso, informação)
 * saíam idênticos: só o texto mudava, então a cor não carregava significado
 * nenhum e o professor precisava ler para saber se deu certo.
 *
 * Aqui cada tipo tem sua borda e sua sombra sólida na cor do significado —
 * verde é acerto, vermelho é erro, azul é recado. O texto continua sendo a
 * mensagem real: a cor confirma, não substitui.
 */
const base =
  "group toast group-[.toaster]:rounded-card group-[.toaster]:border-2 group-[.toaster]:font-nunito group-[.toaster]:text-[15px] group-[.toaster]:font-semibold";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: `${base} group-[.toaster]:bg-card group-[.toaster]:text-ink group-[.toaster]:border-border group-[.toaster]:shadow-sticker-neutral`,
          success: `${base} group-[.toaster]:bg-card group-[.toaster]:text-ink group-[.toaster]:border-success group-[.toaster]:shadow-sticker-success`,
          error: `${base} group-[.toaster]:bg-card group-[.toaster]:text-ink group-[.toaster]:border-danger group-[.toaster]:shadow-sticker-danger`,
          info: `${base} group-[.toaster]:bg-card group-[.toaster]:text-ink group-[.toaster]:border-teca group-[.toaster]:shadow-sticker-sky`,
          warning: `${base} group-[.toaster]:bg-card group-[.toaster]:text-ink group-[.toaster]:border-sun group-[.toaster]:shadow-sticker-sun`,
          title: "group-[.toast]:font-fredoka group-[.toast]:font-bold",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:font-normal",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-button group-[.toast]:font-fredoka group-[.toast]:font-bold",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-muted-foreground group-[.toast]:rounded-button",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
