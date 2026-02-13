import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChangeBadgeProps {
  change: number;
  className?: string;
}

export function ChangeBadge({ change, className }: ChangeBadgeProps) {
  const isPositive = change >= 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium font-english",
        isPositive ? "bg-green/15 text-green" : "bg-red/15 text-red",
        className
      )}
    >
      {isPositive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {isPositive ? "+" : ""}
      {change}%
    </span>
  );
}
