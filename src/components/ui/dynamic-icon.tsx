import dynamic from "next/dynamic";
import type { LucideProps } from "lucide-react";

const lazyIcon = (name: string) =>
  dynamic(() => import("lucide-react").then((mod) => {
    const Icon = mod[name as keyof typeof mod] as React.ComponentType<LucideProps>;
    return Icon ? { default: Icon } : { default: () => null };
  }));

const iconCache = new Map<string, ReturnType<typeof lazyIcon>>();

function getIcon(name: string) {
  if (!iconCache.has(name)) {
    iconCache.set(name, lazyIcon(name));
  }
  return iconCache.get(name)!;
}

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const Icon = getIcon(name);
  return <Icon {...props} />;
}
