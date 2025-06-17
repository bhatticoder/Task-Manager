"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"
import { v4 as uuidv4 } from "uuid"
import type { Notification, Task } from "../types"
import { useTodo } from "./TodoContext"

interface NotificationContextType {
  notifications: Notification[]
  scheduleNotification: (task: Task) => Promise<string | null>
  cancelNotification: (taskId: string) => Promise<boolean>
  loading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { tasks } = useTodo()

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const savedNotifications = await AsyncStorage.getItem("notifications")
        if (savedNotifications) {
          const parsedNotifications = JSON.parse(savedNotifications)
          // Convert string dates back to Date objects
          const formattedNotifications = parsedNotifications.map((notification: any) => ({
            ...notification,
            date: new Date(notification.date),
          }))
          setNotifications(formattedNotifications)
        }
      } catch (error) {
        console.error("Failed to load notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    // Request notification permissions
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync()
      if (status !== "granted") {
        console.log("Notification permissions not granted")
      }
    }

    requestPermissions()
    loadNotifications()
  }, [])

  const saveNotifications = async (updatedNotifications: Notification[]) => {
    try {
      await AsyncStorage.setItem("notifications", JSON.stringify(updatedNotifications))
    } catch (error) {
      console.error("Failed to save notifications:", error)
    }
  }

  const scheduleNotification = async (task: Task) => {
    if (!task.reminderDate) return null

    try {
      // Cancel any existing notifications for this task
      await cancelNotification(task.id)

      // Schedule the new notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Reminder: ${task.title}`,
          body: task.description || "Task reminder",
          data: { taskId: task.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(task.reminderDate)
        },
      })

      const newNotification: Notification = {
        id: uuidv4(),
        taskId: task.id,
        title: `Reminder: ${task.title}`,
        body: task.description || "Task reminder",
        date: task.reminderDate,
        triggered: false,
      }

      const updatedNotifications = [...notifications, newNotification]
      setNotifications(updatedNotifications)
      await saveNotifications(updatedNotifications)

      return notificationId
    } catch (error) {
      console.error("Failed to schedule notification:", error)
      return null
    }
  }

  const cancelNotification = async (taskId: string) => {
    try {
      // Find all notifications for this task
      const taskNotifications = notifications.filter((notification) => notification.taskId === taskId)

      // Cancel each notification
      for (const notification of taskNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.id)
      }

      // Remove the notifications from state
      const updatedNotifications = notifications.filter((notification) => notification.taskId !== taskId)
      setNotifications(updatedNotifications)
      await saveNotifications(updatedNotifications)

      return true
    } catch (error) {
      console.error("Failed to cancel notification:", error)
      return false
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        scheduleNotification,
        cancelNotification,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export type NotificationInput = {
  id: string;
  title: string;
  body: string;
  date: Date;
  triggered: boolean;
  taskId: string;
};

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  const { scheduleNotification, cancelNotification } = context
  return { scheduleNotification, cancelNotification }
}

