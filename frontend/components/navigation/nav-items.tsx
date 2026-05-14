import {
  Home,
  Camera,
  Brain,
  SplitSquareHorizontal,
  BarChart3,
  Info,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  description: string;
  icon: typeof Home;
};

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Home",
    href: "/",
    description: "Platform overview",
    icon: Home,
  },
  {
    title: "YOLO Detection",
    href: "/detect",
    description: "Object detection",
    icon: Camera,
  },
  {
    title: "CNN Classification",
    href: "/classify",
    description: "Road condition",
    icon: Brain,
  },
  {
    title: "Model Comparison",
    href: "/compare",
    description: "Side-by-side analysis",
    icon: SplitSquareHorizontal,
  },
  {
    title: "Analytics",
    href: "/analytics",
    description: "Operational insights",
    icon: BarChart3,
  },
  {
    title: "About",
    href: "/about",
    description: "Project context",
    icon: Info,
  },
];
