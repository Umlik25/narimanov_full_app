import {
  Building2,
  CircleHelp,
  Construction,
  Lightbulb,
  Trash2,
  Trees,
  Waves,
} from "lucide-react";
import { IssueCategory } from "./mockData";

const iconByCategory = {
  road: Construction,
  lighting: Lightbulb,
  trash: Trash2,
  flooding: Waves,
  infrastructure: Building2,
  greenery: Trees,
  other: CircleHelp,
} satisfies Record<IssueCategory, typeof Construction>;

const colorByCategory: Record<IssueCategory, string> = {
  road: "#F97316",
  lighting: "#EAB308",
  trash: "#64748B",
  flooding: "#0EA5E9",
  infrastructure: "#7C3AED",
  greenery: "#16A34A",
  other: "#6B7280",
};

export function CategoryIcon({
  category,
  color,
  size = 20,
}: {
  category: IssueCategory;
  color?: string;
  size?: number;
}) {
  const Icon = iconByCategory[category];

  return <Icon aria-hidden="true" size={size} strokeWidth={2.35} color={color || colorByCategory[category]} />;
}
