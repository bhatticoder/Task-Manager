"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native"
import { format } from "date-fns"
import * as Notifications from "expo-notifications"

import { fetchAISuggestion } from "../prediction1"
import { useTodo } from "../context/TodoContext"
import { useCategory } from "../context/CategoryContext"
import { useTheme } from "../context/ThemeContext"
import { useNotification } from "../context/NotificationContext"

import type { Task } from "../types"
import type {
  HomeStackParamList,
  TaskDetailScreenNavigationProp,
} from "../types/navigation"

type TaskDetailScreenRouteProp = RouteProp<HomeStackParamList, "TaskDetail">

const TaskDetailScreen = () => {
  const navigation = useNavigation<TaskDetailScreenNavigationProp>()
  const route = useRoute<TaskDetailScreenRouteProp>()

  const { theme } = useTheme()
  const { getTaskById, toggleTaskCompletion, deleteTask, tasks } = useTodo()
  const { getCategoryById } = useCategory()
  const { cancelNotification, scheduleNotification } = useNotification()

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null)

  const taskId = route.params.taskId

  useEffect(() => {
    if (taskId) {
      const taskData = getTaskById(taskId)
      setTask(taskData || null)
    }
    setLoading(false)
  }, [taskId, getTaskById])

  useEffect(() => {
    Notifications.requestPermissionsAsync()
  }, [])

  const handleEdit = () => {
    if (task) {
      navigation.navigate("AddEditTask", { task })
    }
  }

  const handleDelete = () => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (task?.reminderDate) {
            await cancelNotification(task.id)
          }
          if (task) {
            await deleteTask(task.id)
          }
          if (navigation.canGoBack()) {
            navigation.goBack()
          } else {
            navigation.navigate({ name: "Tasks", params: undefined })
          }
        },
      },
    ])
  }

  const handleToggleCompletion = async () => {
    if (task) {
      const updatedTask = await toggleTaskCompletion(task.id)
      setTask(updatedTask)
    }
  }

  const getSuggestions = async () => {
    const userData = tasks
      .map((t) => `Title: ${t.title}, Status: ${t.status}, Due: ${t.dueDate}`)
      .join("\n")

    const prompt = `
    You are a smart productivity assistant.
    Here is the user's task history:
    ${userData}

    Based on this, suggest 3 new tasks the user should consider next. Respond with a numbered list.
    `

    const suggestions = await fetchAISuggestion(prompt)
    setAiSuggestions(suggestions)
  }

  const getSuggestionAndNotify = async () => {
    const userData = tasks
      .map((t) => `Title: ${t.title}, Status: ${t.status}, Due: ${t.dueDate}`)
      .join("\n")

    const prompt = `
    You are a smart productivity assistant.
    Here is the user's task history:
    ${userData}

    Based on this, suggest ONE most important task the user should do next. Respond with a single actionable sentence.
    `

    const suggestion = await fetchAISuggestion(prompt)
    setAiSuggestions(suggestion)

    try {
      await scheduleNotification({
        id: "ai-suggestion",
        title: "AI Suggestion",
        body: suggestion,
        date: new Date(Date.now() + 10000),
        triggered: false,
        taskId: task?.id ?? "",
      })
    } catch (e) {
      console.log("Notification error:", e)
    }
  }

  const parseValidDate = (value: any): Date | null => {
    if (!value || typeof value !== "string") return null
    const parsed = new Date(value)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  const dueDateObj = parseValidDate(task?.dueDate)
  const reminderDateObj = parseValidDate(task?.reminderDate)
  const createdAtObj = parseValidDate(task?.createdAt)

  const category = task?.categoryId ? getCategoryById(task.categoryId) : null

  const getPriorityColor = () => {
    switch (task?.priority) {
      case "high":
        return theme.colors.highPriority
      case "medium":
        return theme.colors.mediumPriority
      case "low":
        return theme.colors.lowPriority
      default:
        return theme.colors.secondary
    }
  }

  const getPriorityLabel = () => {
    switch (task?.priority) {
      case "high":
        return "High Priority"
      case "medium":
        return "Medium Priority"
      case "low":
        return "Low Priority"
      default:
        return "No Priority"
    }
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Task not found
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.titleRow}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                {
                  borderColor: theme.colors.primary,
                  backgroundColor: task.completed ? theme.colors.primary : "transparent",
                },
              ]}
              onPress={handleToggleCompletion}
            >
              {task.completed && (
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            <Text style={[styles.title, { color: theme.colors.text }]}>
              {task.title}
            </Text>
          </View>

          <View style={styles.priorityBadge}>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor() }]} />
            <Text style={[styles.priorityText, { color: theme.colors.secondary }]}>
              {getPriorityLabel()}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondary }]}>Description</Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>
            {task.description || "No description provided"}
          </Text>
        </View>

        {/* Details */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondary }]}>Details</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.secondary} />
              <View style={styles.detailTextContainer}>
                <Text style={[styles.detailLabel, { color: theme.colors.secondary }]}>Due Date</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {dueDateObj ? format(dueDateObj, "MMMM d, yyyy") : "No due date"}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="alarm-outline" size={20} color={theme.colors.secondary} />
              <View style={styles.detailTextContainer}>
                <Text style={[styles.detailLabel, { color: theme.colors.secondary }]}>Reminder</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {reminderDateObj ? format(reminderDateObj, "MMMM d, yyyy h:mm a") : "Not set"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="folder-outline" size={20} color={theme.colors.secondary} />
              <View style={styles.detailTextContainer}>
                <Text style={[styles.detailLabel, { color: theme.colors.secondary }]}>Category</Text>
                {category ? (
                  <View style={styles.categoryContainer}>
                    <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      {category.name}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>No category</Text>
                )}
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color={theme.colors.secondary} />
              <View style={styles.detailTextContainer}>
                <Text style={[styles.detailLabel, { color: theme.colors.secondary }]}>Created</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {createdAtObj ? format(createdAtObj, "MMMM d, yyyy") : "Unknown"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Buttons */}
        <TouchableOpacity onPress={getSuggestions} style={{ margin: 16, backgroundColor: theme.colors.primary, padding: 12, borderRadius: 8 }}>
          <Text style={{ color: "#fff", textAlign: "center" }}>Get Suggestions</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={getSuggestionAndNotify} style={{ margin: 16, backgroundColor: theme.colors.primary, padding: 12, borderRadius: 8 }}>
          <Text style={{ color: "#fff", textAlign: "center" }}>Get AI Suggestion & Notify</Text>
        </TouchableOpacity>

        {aiSuggestions && (
          <View style={{ margin: 16, backgroundColor: theme.colors.card, padding: 12, borderRadius: 8 }}>
            <Text style={{ color: theme.colors.text, fontWeight: "bold" }}>AI Suggestions:</Text>
            <Text style={{ color: theme.colors.text }}>{aiSuggestions}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[styles.footerButton, { backgroundColor: theme.colors.error }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.footerButtonText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleEdit}
        >
          <Ionicons name="pencil-outline" size={20} color="#FFFFFF" />
          <Text style={styles.footerButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, textAlign: "center", margin: 24 },
  scrollContent: { padding: 16 },
  header: { paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  checkbox: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 2,
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  title: { fontSize: 22, fontWeight: "600", flex: 1 },
  priorityBadge: { flexDirection: "row", alignItems: "center", marginLeft: 40 },
  priorityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  priorityText: { fontSize: 14 },
  section: { marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8, textTransform: "uppercase" },
  description: { fontSize: 16, lineHeight: 24 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  detailItem: { flexDirection: "row", width: "48%" },
  detailTextContainer: { marginLeft: 8, flex: 1 },
  detailLabel: { fontSize: 12, marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: "500" },
  categoryContainer: { flexDirection: "row", alignItems: "center" },
  categoryDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  footerButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  footerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
})
export default TaskDetailScreen