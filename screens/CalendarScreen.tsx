"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Calendar as RNCalendar } from "react-native-calendars"
import { format, isSameDay } from "date-fns"
import { useTodo } from "../context/TodoContext"
import { useTheme } from "../context/ThemeContext"
import TaskItem from "../components/TaskItem"
import type { AddEditTaskScreenNavigationProp } from "../types/navigation"
import type { TaskDetailScreenNavigationProp } from "../types/navigation"
import type { Task } from "../types"

const CalendarScreen = () => {
  const add_navigation = useNavigation<AddEditTaskScreenNavigationProp>()
  const task_navigation = useNavigation<TaskDetailScreenNavigationProp>()
  const { theme } = useTheme()
  const { tasks, loading } = useTodo()

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [markedDates, setMarkedDates] = useState({})
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<Task[]>([])

  useEffect(() => {
    if (tasks.length > 0) {
      // Create marked dates object for calendar
      const marked = {}

      tasks.forEach((task) => {
        if (task.dueDate) {
          const dateString = format(task.dueDate, "yyyy-MM-dd")

          // Determine dot color based on priority
          let dotColor
          switch (task.priority) {
            case "high":
              dotColor = theme.colors.highPriority
              break
            case "medium":
              dotColor = theme.colors.mediumPriority
              break
            case "low":
              dotColor = theme.colors.lowPriority
              break
            default:
              dotColor = theme.colors.primary
          }

          if (marked[dateString]) {
            // Add another dot if the date already has tasks
            marked[dateString].dots.push({
              key: task.id,
              color: dotColor,
            })
          } else {
            // Create new marked date
            marked[dateString] = {
              dots: [
                {
                  key: task.id,
                  color: dotColor,
                },
              ],
            }
          }
        }
      })

      // Add selected date styling
      const selectedDateString = format(selectedDate, "yyyy-MM-dd")
      marked[selectedDateString] = {
        ...marked[selectedDateString],
        selected: true,
        selectedColor: theme.colors.primary,
      }

      setMarkedDates(marked)

      // Filter tasks for selected date
      const filteredTasks = tasks.filter((task) => task.dueDate && isSameDay(task.dueDate, selectedDate))

      setTasksForSelectedDate(filteredTasks)
    }
  }, [tasks, selectedDate, theme])

  const handleDateSelect = (day) => {
    const newSelectedDate = new Date(day.dateString)
    setSelectedDate(newSelectedDate)
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <RNCalendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={handleDateSelect}
        theme={{
          calendarBackground: theme.colors.card,
          textSectionTitleColor: theme.colors.secondary,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: "#FFFFFF",
          todayTextColor: theme.colors.primary,
          dayTextColor: theme.colors.text,
          textDisabledColor: theme.colors.secondary,
          dotColor: theme.colors.primary,
          monthTextColor: theme.colors.text,
          arrowColor: theme.colors.primary,
        }}
      />

      <View style={styles.taskSection}>
        <View style={styles.taskHeader}>
          <Text style={[styles.dateTitle, { color: theme.colors.text }]}>{format(selectedDate, "MMMM d, yyyy")}</Text>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              const newTask = { dueDate: selectedDate }
              add_navigation.navigate("AddEditTask", { task: newTask }) // Now properly typed
            }}
          >
            <Text style={styles.addButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={tasksForSelectedDate}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem task={item} onPress={() => task_navigation.navigate("TaskDetail", { taskId: item.id })} />
          )}
          contentContainerStyle={styles.taskList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>No tasks scheduled for this day</Text>
            </View>
          }
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  taskSection: {
    flex: 1,
    padding: 16,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  taskList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
})

export default CalendarScreen

