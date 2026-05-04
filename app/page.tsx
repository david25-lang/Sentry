"use client";

import { useEffect } from "react";
import { Header } from "@/components/header";
import { Dashboard } from "@/components/dashboard";
import { Detection } from "@/components/detection";
import { Classification } from "@/components/classification";
import { Compare } from "@/components/compare";
import { Settings } from "@/components/settings";
import { useSentryStore } from "@/lib/store";

export default function Page() {
  const { activeTab, fetchHealth, fetchModels, fetchClasses } = useSentryStore();

  // Fetch initial data on mount
  useEffect(() => {
    fetchHealth();
    fetchModels();
    fetchClasses();
  }, [fetchHealth, fetchModels, fetchClasses]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
      case "home":
        return <Dashboard />;
      case "detect":
        return <Detection />;
      case "classify":
        return <Classification />;
      case "compare":
        return <Compare />;
      case "settings":
        return <Settings />;
      default:
        return <Detection />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
}