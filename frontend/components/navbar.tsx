"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Bell, Bot, Sun, Moon } from "lucide-react";
import { NAV_ITEMS } from "@/components/navigation/nav-items";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { AssistantPanel } from "@/components/assistant-panel";
import { useTheme } from "next-themes";

export function Navbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const activeItem = NAV_ITEMS.find((item) => item.href === pathname);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-200">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="border-white/10 bg-slate-950 text-white">
                <SheetHeader>
                  <SheetTitle className="text-white">Sentry</SheetTitle>
                </SheetHeader>
                <Separator className="my-4 bg-white/10" />
                <nav className="flex flex-col gap-2">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm text-zinc-300",
                          isActive
                            ? "border-orange-500/40 bg-orange-500/10 text-white"
                            : "hover:border-white/10 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-xs text-zinc-500">{item.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {activeItem?.title || "Sentry AI"}
            </p>
            <p className="text-xs text-zinc-500">
              {activeItem?.description || "Road Damage Intelligence"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden border-orange-500/30 text-xs text-orange-200 md:flex">
            Live 
          </Badge>
          <Button variant="ghost" size="icon" className="text-zinc-200" onClick={toggleTheme}>
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-200">
            <Bell className="h-4 w-4" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="border-white/10 bg-white/5 text-zinc-100">
                <Bot className="mr-2 h-4 w-4" />
                Assistant
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full border-white/10 bg-slate-950 text-white sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="text-white">Assistant</SheetTitle>
              </SheetHeader>
              <Separator className="my-4 bg-white/10" />
              <AssistantPanel />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
