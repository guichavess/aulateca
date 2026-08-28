import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-pill border-2 border-border bg-muted",
      className,
    )}
    {...props}
  >
    {/* O preenchimento anima em 320ms: rápido o bastante para ser resposta,
        lento o bastante para o professor VER que avançou. Sem isso o número
        pula e o progresso não é percebido como progresso. */}
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 rounded-pill bg-primary transition-transform duration-enter ease-press"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
