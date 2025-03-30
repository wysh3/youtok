"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define the Settings type locally for now
interface Settings {
  defaultSummaryLength: "short" | "long"
  saveHistory: boolean
  trendingTopic: string // e.g., "US", "IN"
  userTopics: string[] // User-defined topics for filtering
  viewMode: "trending" | "topics" // Which view is active
  apiKey?: string // Add optional API Key
}

interface SettingsContextType {
  settings: Settings // This now includes apiKey implicitly
  updateSettings: (newSettings: Partial<Settings>) => void // Allow partial updates
}

const defaultSettings: Settings = {
  defaultSummaryLength: "short",
  saveHistory: true,
  trendingTopic: "US",
  userTopics: [],
  viewMode: "trending",
  apiKey: "" // Add default apiKey
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  // Load settings from localStorage on initial mount
  useEffect(() => {
    const storedSettings = localStorage.getItem("youtok-settings")
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings)
        // Merge stored settings with defaults to handle missing keys if the structure changed
        setSettings(prev => ({ ...prev, ...parsedSettings }))
      } catch (error) {
        console.error("Failed to parse settings from localStorage", error)
        // Fallback to default settings if parsing fails
        localStorage.removeItem("youtok-settings"); // Clear corrupted data
        setSettings(defaultSettings)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("youtok-settings", JSON.stringify(settings))
  }, [settings])

  // Function to update settings (allowing partial updates)
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}