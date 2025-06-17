import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
const templates = [
  { name: "Project Management", description: "Manage your projects efficiently." },
  { name: "Kanban View", description: "Visualize tasks in columns." },
  { name: "Event Planning", description: "Organize events and tasks." },
  { name: "School", description: "Track assignments and deadlines." },
  { name: "Vacation", description: "Plan your trips and activities." },
  { name: "Grocery", description: "Manage your shopping lists." },
];

const TemplatesScreen = () => (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.header}>Templates</Text>
    {templates.map((template) => (
      <View key={template.name} style={styles.templateItem}>
        <Text style={styles.templateName}>{template.name}</Text>
        <Text style={styles.templateDesc}>{template.description}</Text>
        <TouchableOpacity
          style={styles.importButton}
          onPress={() => Alert.alert("Template Imported", `Imported: ${template.name}`)}
        >
          <Text style={styles.importButtonText}>Import</Text>
        </TouchableOpacity>
      </View>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  templateItem: { marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: "#f2f2f2" },
  templateName: { fontWeight: "600", fontSize: 15 },
  templateDesc: { color: "#555", marginBottom: 8 },
  importButton: { backgroundColor: "#007bff", padding: 8, borderRadius: 6, alignSelf: "flex-start" },
  importButtonText: { color: "#fff", fontWeight: "bold" },
});

export default TemplatesScreen;