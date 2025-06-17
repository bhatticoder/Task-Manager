import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import { templates } from "../data/templates";
import { useTodo } from "../context/TodoContext"; // Adjust path if needed

const TemplatesScreen = () => {
  const { colors } = useTheme();
  const { addTasks } = useTodo();

  // Add this function inside your component
  const handleImport = (template) => {
    const tasksWithId = template.tasks.map(task => ({
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      dueDate: task.dueDate && !isNaN(new Date(task.dueDate).getTime()) ? task.dueDate : undefined,
    }));
    addTasks(tasksWithId);
    Alert.alert("Template Imported", `Added ${tasksWithId.length} tasks from "${template.name}"`);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Templates</Text>
      {templates.map((template) => (
        <View key={template.name} style={[styles.templateItem, { backgroundColor: colors.card }]}>
          <Text style={[styles.templateName, { color: colors.text }]}>{template.name}</Text>
          <Text style={[styles.templateDesc, { color: colors.text }]}>{template.description}</Text>
          <TouchableOpacity
            style={[styles.importButton, { backgroundColor: colors.primary }]}
            onPress={() => handleImport(template)}
          >
            <Text style={styles.importButtonText}>Import</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  templateItem: { marginBottom: 16, padding: 12, borderRadius: 8 },
  templateName: { fontWeight: "600", fontSize: 15 },
  templateDesc: { marginBottom: 8 },
  importButton: { padding: 8, borderRadius: 6, alignSelf: "flex-start" },
  importButtonText: { color: "#fff", fontWeight: "bold" },
});

export default TemplatesScreen;