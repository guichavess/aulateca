import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // `field-sticker` traz borda de 2px, raio de botão e foco azul-céu
        // (ver src/index.css). Antes o campo tinha 1px e raio `md`, e num
        // formulário ficava visivelmente de outro kit que o botão abaixo dele.
        "field-sticker flex h-11 w-full px-3.5 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
