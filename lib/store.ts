// Zustand Store for Sentry Road Damage Detection
// ================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ImageAnalysisResult,
  ModelComparisonResult,
  ModelInfo,
  HealthResponse,
  DamageClassInfo,
  AnalysisSettings,
} from "@/lib/types";
import * as api from "@/lib/api";

// Main app state interface
interface SentryState {
  // UI State
  isLoading: boolean;
  error: string | null;
  activeTab: string;
  sidebarOpen: boolean;

  // API Data
  health: HealthResponse | null;
  models: ModelInfo[];
  classes: DamageClassInfo[];
  
  // Analysis Results
  lastDetectionResult: ImageAnalysisResult | null;
  lastClassificationResult: ImageAnalysisResult | null;
  lastComparisonResult: ModelComparisonResult | null;
  
  // History
  detectionHistory: ImageAnalysisResult[];
  
  // Settings
  settings: AnalysisSettings;
  
  // Image state
  currentImageUrl: string | null;
  currentImageFile: File | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveTab: (tab: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentImage: (url: string | null, file?: File | null) => void;
  updateSettings: (settings: Partial<AnalysisSettings>) => void;
  clearResults: () => void;
  clearHistory: () => void;
  
  // API Actions
  fetchHealth: () => Promise<void>;
  fetchModels: () => Promise<void>;
  fetchClasses: () => Promise<void>;
  
  // Detection Actions
  detectFromURL: (url: string) => Promise<ImageAnalysisResult | null>;
  detectFromFile: (file: File) => Promise<ImageAnalysisResult | null>;
  classifyFromURL: (url: string) => Promise<ImageAnalysisResult | null>;
  classifyFromFile: (file: File) => Promise<ImageAnalysisResult | null>;
  compareModels: (url: string) => Promise<ModelComparisonResult | null>;
  compareModelsFromFile: (file: File) => Promise<ModelComparisonResult | null>;
}

export const useSentryStore = create<SentryState>()(
  persist(
    (set, get) => ({
      // Initial State
      isLoading: false,
      error: null,
      activeTab: "detect",
      sidebarOpen: true,
      
      health: null,
      models: [],
      classes: [],
      
      lastDetectionResult: null,
      lastClassificationResult: null,
      lastComparisonResult: null,
      
      detectionHistory: [],
      
      settings: {
        showBoundingBoxes: true,
        potholeOnly: false,
        autoSaveResults: true,
        enableNotifications: false,
        theme: "system" as const,
      },
      
      currentImageUrl: null,
      currentImageFile: null,

      // Basic Setters
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setCurrentImage: (url, file = null) => set({ 
        currentImageUrl: url, 
        currentImageFile: file 
      }),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      
      clearResults: () => set({
        lastDetectionResult: null,
        lastClassificationResult: null,
        lastComparisonResult: null,
        currentImageUrl: null,
        currentImageFile: null,
      }),
      
      clearHistory: () => set({ detectionHistory: [] }),

      // API Actions
      fetchHealth: async () => {
        try {
          const health = await api.getHealth();
          const normalizedStatus = (health.status || "").toLowerCase();
          const isHealthy =
            normalizedStatus === "healthy" ||
            normalizedStatus === "ok" ||
            normalizedStatus === "up";

          set({
            health: {
              ...health,
              // Normalize common healthy variants for consistent UI status handling.
              status: isHealthy ? "healthy" : health.status,
            },
            error: null,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to connect to API",
          });
        }
      },

      fetchModels: async () => {
        try {
          const models = await api.getModels();
          set({ models });
        } catch (error) {
          console.error("Failed to fetch models:", error);
        }
      },

      fetchClasses: async () => {
        try {
          const response = await api.getClasses();
          set({ classes: response.classes });
        } catch (error) {
          console.error("Failed to fetch classes:", error);
        }
      },

      // Detection Actions
      detectFromURL: async (url) => {
        const { settings } = get();
        try {
          set({ isLoading: true, error: null, currentImageUrl: url });
          const result = await api.detectFromURL(url, settings.potholeOnly);
          set((state) => ({ 
            lastDetectionResult: result, 
            isLoading: false,
            detectionHistory: [result, ...state.detectionHistory.slice(0, 49)]
          }));
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Detection failed";
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      detectFromFile: async (file) => {
        const { settings } = get();
        try {
          set({ isLoading: true, error: null, currentImageFile: file });
          const previewUrl = URL.createObjectURL(file);
          set({ currentImageUrl: previewUrl });
          
          const result = await api.detectFromUpload(file, settings.potholeOnly);
          set((state) => ({ 
            lastDetectionResult: result, 
            isLoading: false,
            detectionHistory: [result, ...state.detectionHistory.slice(0, 49)]
          }));
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Detection failed";
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      classifyFromURL: async (url) => {
        try {
          set({ isLoading: true, error: null, currentImageUrl: url });
          const result = await api.classifyFromURL(url, 0.5);
          set((state) => ({
            lastClassificationResult: result,
            isLoading: false,
            detectionHistory: [result, ...state.detectionHistory.slice(0, 49)],
          }));
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Classification failed";
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      classifyFromFile: async (file) => {
        try {
          set({ isLoading: true, error: null, currentImageFile: file });
          const previewUrl = URL.createObjectURL(file);
          set({ currentImageUrl: previewUrl });

          const result = await api.classifyFromUpload(file, 0.5);
          set((state) => ({
            lastClassificationResult: result,
            isLoading: false,
            detectionHistory: [result, ...state.detectionHistory.slice(0, 49)],
          }));
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Classification failed";
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      compareModels: async (url) => {
        const { settings } = get();
        try {
          set({ isLoading: true, error: null, currentImageUrl: url });
          const result = await api.compareFromURL(url, settings.potholeOnly);
          set((state) => ({
            lastComparisonResult: result,
            lastDetectionResult: result.yolo_result,
            lastClassificationResult: result.cnn_result,
            isLoading: false,
            detectionHistory: [result.yolo_result, result.cnn_result, ...state.detectionHistory.slice(0, 48)],
          }));
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Model comparison failed";
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      compareModelsFromFile: async (file) => {
        const { settings } = get();
        try {
          set({ isLoading: true, error: null, currentImageFile: file });
          const previewUrl = URL.createObjectURL(file);
          set({ currentImageUrl: previewUrl });

          const result = await api.compareFromUpload(file, settings.potholeOnly);
          set((state) => ({
            lastComparisonResult: result,
            lastDetectionResult: result.yolo_result,
            lastClassificationResult: result.cnn_result,
            isLoading: false,
            detectionHistory: [result.yolo_result, result.cnn_result, ...state.detectionHistory.slice(0, 48)],
          }));
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Model comparison failed";
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },
    }),
    {
      name: "sentry-storage",
      partialize: (state) => ({
        settings: state.settings,
        detectionHistory: state.detectionHistory.slice(0, 20),
      }),
    }
  )
);
