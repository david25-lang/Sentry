"use client";

import * as React from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { PageTransition } from "@/components/page-transition";
import { useSentryStore } from "@/lib/store";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { fetchHealth, fetchModels, fetchClasses } = useSentryStore();

  React.useEffect(() => {
    fetchHealth();
    fetchModels();
    fetchClasses();
  }, [fetchHealth, fetchModels, fetchClasses]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,116,144,0.25),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.18),transparent_45%)]" />
        <div className="absolute inset-0 opacity-40 bg-sentry-grid" />
        <div className="absolute -top-32 right-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl animate-float-slow" />
        <div className="absolute bottom-10 left-20 h-60 w-60 rounded-full bg-orange-500/10 blur-3xl animate-float-medium" />
      </div>

      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-72">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
