import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTodo } from "../context/TodoContext";
import { useTheme } from "../context/ThemeContext"; // <-- Use your ThemeContext

const priorities = ["All", "High", "Medium", "Low"];
const statuses = ["All", "Pending", "Completed"];

export type Task = {
  id: number;
  title: string;
  dueDate: Date | string;
  priority: string;
  status: string;
};

const TaskTableScreen = ({ section = "Home", navigation }: any) => {
  const { tasks, deleteTask, toggleTaskCompletion, updateTask: contextUpdateTask } = useTodo();
  const { theme, isDark } = useTheme();

  // State for filters and search
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Automatically mark overdue tasks as completed
  useEffect(() => {
    const now = new Date();
    tasks.forEach(task => {
        const due = typeof task.dueDate === "string" ? new Date(task.dueDate) : task.dueDate;
        if (
        task.status !== "Completed" &&
        due instanceof Date &&
        !isNaN(due.getTime()) &&
        due < now
        ) {
        contextUpdateTask(task.id, { ...task, status: "Completed" });
        }
    });
    }, [tasks, contextUpdateTask]);
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const normalizedStatus = task.status && task.status.toLowerCase() === "completed" ? "Completed" : "Pending";
    const matchesPriority =
      priorityFilter === "All" ||
      (task.priority && task.priority.toLowerCase() === priorityFilter.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      normalizedStatus.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const updateTask = (updatedTask) => {
    contextUpdateTask(updatedTask.id, updatedTask);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.text }]}>{section} Tasks</Text>
      <View style={styles.filterRow}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          placeholder="Search tasks..."
          placeholderTextColor={theme.colors.secondary}
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.filterGroup}>
          {priorities.map(p => (
            <TouchableOpacity
              key={p}
              style={[
                styles.filterButton,
                priorityFilter === p && styles.filterButtonActive,
                { backgroundColor: priorityFilter === p ? theme.colors.primary : theme.colors.card }
              ]}
              onPress={() => setPriorityFilter(p)}
            >
              <Text style={priorityFilter === p ? styles.filterTextActive : styles.filterText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filterGroup}>
          {statuses.map(s => (
            <TouchableOpacity
              key={s}
              style={[
                styles.filterButton,
                statusFilter === s && styles.filterButtonActive,
                { backgroundColor: statusFilter === s ? theme.colors.primary : theme.colors.card }
              ]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={statusFilter === s ? styles.filterTextActive : styles.filterText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={[styles.tableHeader, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cell, styles.headerCell, { color: theme.colors.text }]}>Task/Title</Text>
        <Text style={[styles.cell, styles.headerCell, { color: theme.colors.text }]}>Date</Text>
        <Text style={[styles.cell, styles.headerCell, { color: theme.colors.text }]}>Status</Text>
        <Text style={[styles.cell, styles.headerCell, { color: theme.colors.text }]}>Priority</Text>
        <Text style={[styles.cell, styles.headerCell, { color: theme.colors.text }]}>Actions</Text>
      </View>
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[
            styles.tableRow,
            { backgroundColor: isDark ? theme.colors.card : "#fff" }
          ]}>
            <Text style={[styles.cell, { color: theme.colors.text }]}>{item.title}</Text>
            <Text style={[styles.cell, { color: theme.colors.text }]}>
        {item.dueDate
            ? (typeof item.dueDate === "string"
                ? item.dueDate
                : item.dueDate instanceof Date && !isNaN(item.dueDate.getTime())
                ? item.dueDate.toLocaleDateString()
                : "")
            : ""}
        </Text>
            <Text style={[styles.cell, { color: theme.colors.text }]}>
              {item.status && item.status.toLowerCase() === "completed" ? "Completed" : "Pending"}
            </Text>
            <Text style={[styles.cell, { color: theme.colors.text }]}>{item.priority}</Text>
            <View style={[styles.cell, styles.actionCell]}>
              <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
                <Ionicons
                  name={item.status === "Completed" ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={item.status === "Completed" ? theme.colors.primary : theme.colors.secondary}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(item.id)} style={{ marginLeft: 10 }}>
                <Ionicons name="trash-outline" size={22} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20, color: theme.colors.text }}>No tasks found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  filterRow: { marginBottom: 8 },
  searchInput: {
    borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 8
  },
  filterGroup: { flexDirection: "row", marginBottom: 8 },
  filterButton: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#ccc", marginRight: 6
  },
  filterButtonActive: { backgroundColor: "#007bff", borderColor: "#007bff" },
  filterText: { color: "#333" },
  filterTextActive: { color: "#fff" },
  tableHeader: {
    flexDirection: "row",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 6,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
  },
  headerCell: {
    fontWeight: "bold",
  },
  actionCell: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TaskTableScreen;