"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { format } from "date-fns"
import { useTodo } from "../context/TodoContext"
import { useCategory } from "../context/CategoryContext"
import { useTheme } from "../context/ThemeContext"
import { useNotification } from "../context/NotificationContext"
import type { Task } from "../types"
import type { HomeStackParamList, AddEditTaskScreenNavigationProp } from "../types/navigation"

type AddEditTaskScreenRouteProp = RouteProp<HomeStackParamList, "AddEditTask">

const AddEditTaskScreen = () => {
  const navigation = useNavigation<AddEditTaskScreenNavigationProp>()
  const route = useRoute<AddEditTaskScreenRouteProp>()
  const { theme } = useTheme()
  const { addTask, updateTask } = useTodo()
  const { categories } = useCategory()
  const { scheduleNotification, cancelNotification } = useNotification()

  const existingTask = route.params?.task as Task | undefined

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [reminderDate, setReminderDate] = useState<Date | null>(null)

  const [showDueDatePicker, setShowDueDatePicker] = useState(false)
  const [showReminderDatePicker, setShowReminderDatePicker] = useState(false)
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false)

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title)
      setDescription(existingTask.description)
      setPriority(existingTask.priority)
      setCategoryId(existingTask.categoryId)
      setDueDate(existingTask.dueDate)
      setReminderDate(existingTask.reminderDate)
    } else if (route.params?.task?.dueDate) {
      // If coming from calendar with a pre-selected date
      setDueDate(route.params.task.dueDate as Date)
    }
  }, [existingTask, route.params])

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a task title")
      return
    }

    try {
      const taskData: Omit<Task, "id" | "createdAt" | "updatedAt"> = {
        title: title.trim(),
        description: description.trim(),
        completed: existingTask ? existingTask.completed : false,
        priority,
        dueDate,
        reminderDate,
        categoryId,
      }

      let savedTask

      if (existingTask) {
        // If there was a previous reminder, cancel it
        if (existingTask.reminderDate) {
          await cancelNotification(existingTask.id)
        }

        savedTask = await updateTask(existingTask.id, taskData)
      } else {
        savedTask = await addTask(taskData)
      }

      // Schedule notification if reminder is set
      if (savedTask && reminderDate) {
        await scheduleNotification(savedTask)
      }

      navigation.goBack()
    } catch (error) {
      console.error("Error saving task:", error)
      Alert.alert("Error", "Failed to save task")
    }
  }

  const handleDueDateChange = (event: any, selectedDate?: Date) => {
    setShowDueDatePicker(false)
    if (selectedDate) {
      setDueDate(selectedDate)
    }
  }

  const handleReminderDateChange = (event: any, selectedDate?: Date) => {
    setShowReminderDatePicker(false)
    if (selectedDate) {
      // Keep the time from the existing reminder or set to current time
      const newReminderDate = new Date(selectedDate)
      if (reminderDate) {
        newReminderDate.setHours(reminderDate.getHours())
        newReminderDate.setMinutes(reminderDate.getMinutes())
      } else {
        const now = new Date()
        newReminderDate.setHours(now.getHours())
        newReminderDate.setMinutes(now.getMinutes())
      }
      setReminderDate(newReminderDate)
      setShowReminderTimePicker(true)
    }
  }

  const handleReminderTimeChange = (event: any, selectedTime?: Date) => {
    setShowReminderTimePicker(false)
    if (selectedTime && reminderDate) {
      const newReminderDate = new Date(reminderDate)
      newReminderDate.setHours(selectedTime.getHours())
      newReminderDate.setMinutes(selectedTime.getMinutes())
      setReminderDate(newReminderDate)
    }
  }

  const renderPriorityButton = (value: "low" | "medium" | "high", label: string) => {
    const isSelected = priority === value

    let backgroundColor
    let textColor

    if (isSelected) {
      switch (value) {
        case "high":
          backgroundColor = theme.colors.highPriority
          break
        case "medium":
          backgroundColor = theme.colors.mediumPriority
          break
        case "low":
          backgroundColor = theme.colors.lowPriority
          break
      }
      textColor = "#FFFFFF"
    } else {
      backgroundColor = theme.colors.card
      textColor = theme.colors.text
    }

    return (
      <TouchableOpacity
        style={[styles.priorityButton, { backgroundColor, borderColor: theme.colors.border }]}
        onPress={() => setPriority(value)}
      >
        <Text style={[styles.priorityButtonText, { color: textColor }]}>{label}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Title</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Task title"
            placeholderTextColor={theme.colors.secondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Task description (optional)"
            placeholderTextColor={theme.colors.secondary}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Priority</Text>
          <View style={styles.priorityContainer}>
            {renderPriorityButton("low", "Low")}
            {renderPriorityButton("medium", "Medium")}
            {renderPriorityButton("high", "High")}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                {
                  backgroundColor: categoryId === null ? theme.colors.primary : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setCategoryId(null)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  {
                    color: categoryId === null ? "#FFFFFF" : theme.colors.text,
                  },
                ]}
              >
                None
              </Text>
            </TouchableOpacity>

            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: categoryId === category.id ? category.color : theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setCategoryId(category.id)}
              >
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color: categoryId === category.id ? "#FFFFFF" : theme.colors.text,
                    },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Due Date</Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setShowDueDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.colors.secondary} />
            <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
              {dueDate ? format(dueDate, "MMMM d, yyyy") : "Set due date"}
            </Text>
            {dueDate && (
              <TouchableOpacity style={styles.clearButton} onPress={() => setDueDate(null)}>
                <Ionicons name="close-circle" size={20} color={theme.colors.secondary} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {showDueDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDueDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Reminder</Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setShowReminderDatePicker(true)}
          >
            <Ionicons name="alarm-outline" size={20} color={theme.colors.secondary} />
            <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
              {reminderDate ? format(reminderDate, "MMMM d, yyyy h:mm a") : "Set reminder"}
            </Text>
            {reminderDate && (
              <TouchableOpacity style={styles.clearButton} onPress={() => setReminderDate(null)}>
                <Ionicons name="close-circle" size={20} color={theme.colors.secondary} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {showReminderDatePicker && (
            <DateTimePicker
              value={reminderDate || new Date()}
              mode="date"
              display="default"
              onChange={handleReminderDateChange}
              minimumDate={new Date()}
            />
          )}

          {showReminderTimePicker && (
            <DateTimePicker
              value={reminderDate || new Date()}
              mode="time"
              display="default"
              onChange={handleReminderTimeChange}
            />
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.colors.border }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.primary }]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
  },
  priorityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priorityButton: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  priorityButtonText: {
    fontWeight: "600",
  },
  categoryScrollView: {
    flexGrow: 0,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  dateButtonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginLeft: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default AddEditTaskScreen

