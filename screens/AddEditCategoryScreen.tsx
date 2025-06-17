"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import { useCategory } from "../context/CategoryContext"
import { useTheme } from "../context/ThemeContext"
import type { CategoriesStackParamList, AddEditCategoryScreenNavigationProp } from "../types/navigation"

const COLORS = [
  "#4A6FA5", // Blue
  "#34C759", // Green
  "#FF9500", // Orange
  "#FF3B30", // Red
  "#5856D6", // Purple
  "#FF2D55", // Pink
  "#007AFF", // Bright Blue
  "#5AC8FA", // Light Blue
  "#FFCC00", // Yellow
  "#4CD964", // Bright Green
  "#FF3B30", // Red
  "#FF9500", // Orange
  "#8E8E93", // Gray
]

type AddEditCategoryScreenRouteProp = RouteProp<CategoriesStackParamList, "AddEditCategory">

const AddEditCategoryScreen = () => {
  const navigation = useNavigation<AddEditCategoryScreenNavigationProp>()
  const route = useRoute<AddEditCategoryScreenRouteProp>()
  const { theme } = useTheme()
  const { addCategory, updateCategory } = useCategory()

  const existingCategory = route.params?.category

  const [name, setName] = useState("")
  const [color, setColor] = useState(COLORS[0])

  useEffect(() => {
    if (existingCategory) {
      setName(existingCategory.name)
      setColor(existingCategory.color)
    }
  }, [existingCategory])

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a category name")
      return
    }

    try {
      if (existingCategory) {
        await updateCategory(existingCategory.id, { name: name.trim(), color })
      } else {
        await addCategory({ name: name.trim(), color })
      }
      navigation.goBack()
    } catch (error) {
      console.error("Error saving category:", error)
      Alert.alert("Error", "Failed to save category")
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Name</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Category name"
            placeholderTextColor={theme.colors.secondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Color</Text>
          <View style={styles.colorGrid}>
            {COLORS.map((colorOption, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorOption,
                  { backgroundColor: colorOption },
                  color === colorOption && styles.selectedColorOption,
                ]}
                onPress={() => setColor(colorOption)}
              >
                {color === colorOption && (
                  <View style={styles.colorCheckmark}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.previewSection}>
          <Text style={[styles.previewLabel, { color: theme.colors.text }]}>Preview</Text>
          <View
            style={[
              styles.previewItem,
              {
                backgroundColor: theme.colors.card,
                borderLeftColor: color,
              },
            ]}
          >
            <View style={styles.previewHeader}>
              <View style={[styles.previewDot, { backgroundColor: color }]} />
              <Text style={[styles.previewName, { color: theme.colors.text }]}>{name || "Category Name"}</Text>
            </View>
          </View>
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
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
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  colorCheckmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: "#000000",
    fontWeight: "bold",
  },
  previewSection: {
    marginBottom: 24,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  previewItem: {
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  previewName: {
    fontSize: 18,
    fontWeight: "600",
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

export default AddEditCategoryScreen

