"use client"
import 'react-native-get-random-values';
import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { v4 as uuidv4 } from 'uuid';
import type { Category } from "../types"

interface CategoryContextType {
  categories: Category[]
  addCategory: (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => Promise<Category>
  updateCategory: (id: string, category: Partial<Category>) => Promise<Category | null>
  deleteCategory: (id: string) => Promise<boolean>
  getCategoryById: (id: string) => Category | undefined
  loading: boolean
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const savedCategories = await AsyncStorage.getItem("categories")
        if (savedCategories) {
          const parsedCategories = JSON.parse(savedCategories)
          // Convert string dates back to Date objects
          const formattedCategories = parsedCategories.map((category: any) => ({
            ...category,
            createdAt: new Date(category.createdAt),
            updatedAt: new Date(category.updatedAt),
          }))
          setCategories(formattedCategories)
        } else {
          setCategories([])
        }
      } catch (error) {
        console.error("Failed to load categories:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  const saveCategories = async (updatedCategories: Category[]) => {
    try {
      await AsyncStorage.setItem("categories", JSON.stringify(updatedCategories))
    } catch (error) {
      console.error("Failed to save categories:", error)
    }
  }

  const addCategory = async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date()
    const newCategory: Category = {
      ...categoryData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }
    if (categories.some(cat => cat.name.toLowerCase() === categoryData.name.toLowerCase())) {
      throw new Error("Category with this name already exists.");
    }
    const updatedCategories = [...categories, newCategory]
    setCategories(updatedCategories)
    await saveCategories(updatedCategories)
    return newCategory
  }

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    const categoryIndex = categories.findIndex((category) => category.id === id)
    if (categoryIndex === -1) return null

    const updatedCategory = {
      ...categories[categoryIndex],
      ...categoryData,
      updatedAt: new Date(),
    }

    const updatedCategories = [...categories]
    updatedCategories[categoryIndex] = updatedCategory
    setCategories(updatedCategories)
    await saveCategories(updatedCategories)
    return updatedCategory
  }

  const deleteCategory = async (id: string) => {
    const updatedCategories = categories.filter((category) => category.id !== id)
    if (updatedCategories.length === categories.length) return false

    setCategories(updatedCategories)
    await saveCategories(updatedCategories)
    return true
  }

  const getCategoryById = (id: string) => {
    return categories.find((category) => category.id === id)
  }

  return (
    <CategoryContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
        loading,
      }}
    >
      {children}
    </CategoryContext.Provider>
  )
}

export const useCategory = () => {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error("useCategory must be used within a CategoryProvider")
  }
  return context
}

