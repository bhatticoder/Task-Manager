"use client"
import 'react-native-get-random-values';
import React, { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { v4 as uuidv4 } from "uuid"
import type { Task } from "../types"

export type TodoContextType = {
  tasks: Task[];
  addTask: (task: Task) => void;
  addTasks: (tasks: Task[]) => void;
  updateTask: (id: string, task: Partial<Task>) => Promise<Task | null>
  deleteTask: (id: string) => Promise<boolean>
  getTaskById: (id: string) => Task | undefined
  getTasksByCategory: (categoryId: string | null) => Task[]
  toggleTaskCompletion: (id: string) => Promise<Task | null>
  searchTasks: (query: string) => Task[]
  loading: boolean
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem("tasks")
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks)
          // Convert string dates back to Date objects
          const formattedTasks = parsedTasks.map((task: any) => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            reminderDate: task.reminderDate ? new Date(task.reminderDate) : null,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
          }))
          setTasks(formattedTasks)
        }
      } catch (error) {
        console.error("Failed to load tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [])

  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks))
    } catch (error) {
      console.error("Failed to save tasks:", error)
    }
  }

  const addTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date()
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }

    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    await saveTasks(updatedTasks)
    return newTask
  }

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    const taskIndex = tasks.findIndex((task) => task.id === id)
    if (taskIndex === -1) return null

    const updatedTask = {
      ...tasks[taskIndex],
      ...taskData,
      updatedAt: new Date(),
    }

    const updatedTasks = [...tasks]
    updatedTasks[taskIndex] = updatedTask
    setTasks(updatedTasks)
    await saveTasks(updatedTasks)
    return updatedTask
  }

  const deleteTask = async (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id)
    if (updatedTasks.length === tasks.length) return false

    setTasks(updatedTasks)
    await saveTasks(updatedTasks)
    return true
  }

  const getTaskById = (id: string) => {
    return tasks.find((task) => task.id === id)
  }

  const getTasksByCategory = (categoryId: string | null) => {
    return tasks.filter((task) => task.categoryId === categoryId)
  }

  const toggleTaskCompletion = async (id: string) => {
    const task = getTaskById(id)
    if (!task) return null

    return updateTask(id, { completed: !task.completed })
  }

  const searchTasks = (query: string) => {
    const searchTerm = query.toLowerCase().trim()
    if (!searchTerm) return tasks

    return tasks.filter(
      (task) => task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm),
    )
  }

  const addTasks = (newTasks: Task[]) => {
    setTasks((prev) => [...prev, ...newTasks]);
  };

  return (
    <TodoContext.Provider
      value={{
        tasks,
        addTask,
        addTasks,
        updateTask,
        deleteTask,
        getTaskById,
        getTasksByCategory,
        toggleTaskCompletion,
        searchTasks,
        loading,
      }}
    >
      {children}
    </TodoContext.Provider>
  )
}

export const useTodo = () => {
  const context = useContext(TodoContext)
  if (context === undefined) {
    throw new Error("useTodo must be used within a TodoProvider")
  }
  return context
}

