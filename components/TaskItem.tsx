"use client"

import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet, GestureResponderEvent } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"
import { useTheme } from "../context/ThemeContext"
import { useCategory } from "../context/CategoryContext"
import { useTodo } from "../context/TodoContext"
import type { Task } from "../types"

interface TaskItemProps {
  task: Task
  onPress: () => void
}

const TaskItem = ({ task, onPress }: TaskItemProps) => {
  const { theme } = useTheme()
  const { getCategoryById } = useCategory()
  const { toggleTaskCompletion } = useTodo()

  const category = task.categoryId ? getCategoryById(task.categoryId) : null

  const getPriorityColor = () => {
    switch (task.priority) {
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

  const handleToggleCompletion = (e: GestureResponderEvent) => {
    e.stopPropagation()
    toggleTaskCompletion(task.id)
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderLeftColor: getPriorityColor(),
          opacity: task.completed ? 0.7 : 1,
        },
      ]}
      onPress={onPress}
    >
      <TouchableOpacity style={styles.checkbox} onPress={handleToggleCompletion}>
        <View
          style={[
            styles.checkboxInner,
            {
              borderColor: theme.colors.primary,
              backgroundColor: task.completed ? theme.colors.primary : "transparent",
            },
          ]}
        >
          {task.completed && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
              textDecorationLine: task.completed ? "line-through" : "none",
            },
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>

        {task.description ? (
          <Text
            style={[
              styles.description,
              {
                color: theme.colors.secondary,
                textDecorationLine: task.completed ? "line-through" : "none",
              },
            ]}
            numberOfLines={1}
          >
            {task.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          {task.dueDate && (
            <View style={styles.footerItem}>
              <Ionicons name="calendar-outline" size={14} color={theme.colors.secondary} />
              <Text style={[styles.footerText, { color: theme.colors.secondary }]}>
                {format(task.dueDate, "MMM d, yyyy")}
              </Text>
            </View>
          )}

          {task.reminderDate && (
            <View style={styles.footerItem}>
              <Ionicons name="alarm-outline" size={14} color={theme.colors.secondary} />
              <Text style={[styles.footerText, { color: theme.colors.secondary }]}>
                {format(task.reminderDate, "h:mm a")}
              </Text>
            </View>
          )}

          {category && (
            <View style={styles.footerItem}>
              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
              <Text style={[styles.footerText, { color: theme.colors.secondary }]}>{category.name}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    marginRight: 12,
    alignSelf: "center",
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 12,
    marginLeft: 4,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
})

export default TaskItem

