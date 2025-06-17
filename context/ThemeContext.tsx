"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Define theme colors
const lightTheme = {
  dark: false,
  colors: {
    primary: "#4A6FA5",
    background: "#F5F7FA",
    card: "#FFFFFF",
    text: "#333333",
    border: "#E1E1E1",
    notification: "#FF3B30",
    accent: "#4A6FA5",
    secondary: "#6B7280",
    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    highPriority: "#FF3B30",
    mediumPriority: "#FF9500",
    lowPriority: "#34C759",
  },
}

const darkTheme = {
  dark: true,
  colors: {
    primary: "#6B8CC7",
    background: "#121212",
    card: "#1E1E1E",
    text: "#F5F5F5",
    border: "#2C2C2C",
    notification: "#FF453A",
    accent: "#6B8CC7",
    secondary: "#9CA3AF",
    success: "#30D158",
    warning: "#FFD60A",
    error: "#FF453A",
    highPriority: "#FF453A",
    mediumPriority: "#FFD60A",
    lowPriority: "#30D158",
  },
}

type ThemeType = typeof lightTheme

interface ThemeContextType {
  theme: ThemeType
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useColorScheme()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Load saved theme preference
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("themePreference")
        if (savedTheme !== null) {
          setIsDark(savedTheme === "dark")
        } else {
          // Use device preference if no saved preference
          setIsDark(deviceColorScheme === "dark")
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error)
        // Default to device preference if error
        setIsDark(deviceColorScheme === "dark")
      }
    }

    loadThemePreference()
  }, [deviceColorScheme])

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark
      setIsDark(newTheme)
      await AsyncStorage.setItem("themePreference", newTheme ? "dark" : "light")
    } catch (error) {
      console.error("Failed to save theme preference:", error)
    }
  }

  const theme = isDark ? darkTheme : lightTheme

  return <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

