import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, glow = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          /* glass base */
          "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md",
          "shadow-[0_8px_32px_oklch(0_0_0_/_0.12),inset_0_1px_0_oklch(1_0_0_/_0.1)]",
          "dark:bg-white/5 dark:border-white/8",
          /* optional teal glow */
          glow && "shadow-[0_8px_32px_oklch(0_0_0_/_0.12),inset_0_1px_0_oklch(1_0_0_/_0.1),0_0_24px_oklch(0.636_0.131_185.7_/_0.2)]",
          /* hover lift */
          hover && [
            "transition-all duration-300 ease-out",
            "hover:-translate-y-1",
            "hover:bg-white/15 dark:hover:bg-white/8",
            "hover:shadow-[0_16px_48px_oklch(0_0_0_/_0.18),inset_0_1px_0_oklch(1_0_0_/_0.15)]",
            "hover:border-white/30 dark:hover:border-white/15",
          ],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
