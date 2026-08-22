"use client";

import {
  ShoppingCart, HeartPulse, Cpu, Building2, Landmark, Plane,
  Scale, GraduationCap, UtensilsCrossed, Car, LayoutGrid,
  LucideProps,
} from "lucide-react";

const ICONS: Record<string, React.FC<LucideProps>> = {
  ShoppingCart,
  HeartPulse,
  Cpu,
  Building2,
  Landmark,
  Plane,
  Scale,
  GraduationCap,
  UtensilsCrossed,
  Car,
};

export function DomainIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const Icon = ICONS[name] ?? LayoutGrid;
  return <Icon {...props} />;
}
