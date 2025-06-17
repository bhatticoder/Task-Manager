"use client"

import { useState } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { format } from "date-fns"
import { useCategory } from "../context/CategoryContext"
import { useTodo } from "../context/TodoContext"
import { useTheme } from "../context/ThemeContext"
import type { CategoriesScreenNavigationProp } from "../types/navigation"

const CategoriesScreen = () => {
  const navigation = useNavigation<CategoriesScreenNavigationProp>()
  const { theme } = useTheme()
  const { categories, deleteCategory, loading } = useCategory()
  const { tasks, updateTask } = useTodo()

  const [refreshing, setRefreshing] = useState(false)

  const handleDeleteCategory = (categoryId: string) => {
    // Check if there are tasks with this category
    const tasksWithCategory = tasks.filter((task) => task.categoryId === categoryId)

    if (tasksWithCategory.length > 0) {
      Alert.alert(
        "Category In Use",
        `This category is used by ${tasksWithCategory.length} task(s). What would you like to do?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove Category from Tasks",
            onPress: async () => {
              // Update all tasks to remove this category
              for (const task of tasksWithCategory) {
                await updateTask(task.id, { categoryId: null })
              }
              await deleteCategory(categoryId)
            },
          },
          {
            text: "Delete Anyway",
            style: "destructive",
            onPress: async () => {
              await deleteCategory(categoryId)
            },
          },
        ],
      )
    } else {
      Alert.alert("Delete Category", "Are you sure you want to delete this category?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteCategory(categoryId)
          },
        },
      ])
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    // Just simulate a refresh
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  const getTaskCountForCategory = (categoryId: string) => {
    return tasks.filter((task) => task.categoryId === categoryId).length
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
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryItem,
              {
                backgroundColor: theme.colors.card,
                borderLeftColor: item.color,
              },
            ]}
            onPress={() => navigation.navigate("AddEditCategory", { category: item })}
          >
            <View style={styles.categoryContent}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                <Text style={[styles.categoryName, { color: theme.colors.text }]}>{item.name}</Text>
              </View>

              <Text style={[styles.taskCount, { color: theme.colors.secondary }]}>
                {getTaskCountForCategory(item.id)} tasks
              </Text>

              <Text style={[styles.dateText, { color: theme.colors.secondary }]}>
                Created {format(item.createdAt, "MMM d, yyyy")}
              </Text>
            </View>

            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteCategory(item.id)}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color={theme.colors.secondary} />
            <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>
              No categories yet. Add your first category!
            </Text>
          </View>
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("AddEditCategory", {})}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
  listContent: {
    padding: 16,
  },
  categoryItem: {
    flexDirection: "row",
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryContent: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "600",
  },
  taskCount: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
  },
  deleteButton: {
    justifyContent: "center",
    padding: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
})

export default CategoriesScreen

