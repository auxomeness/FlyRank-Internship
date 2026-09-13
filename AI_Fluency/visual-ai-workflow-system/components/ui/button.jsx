import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", size = "default", ...props }) {
  return (
    <button
      className={cn(
        "button",
        variant === "secondary" && "button-secondary",
        variant === "ghost" && "button-ghost",
        variant === "danger" && "button-danger",
        size === "sm" && "button-sm",
        className,
      )}
      {...props}
    />
  );
}
