import type { StackNavigationProp } from "@react-navigation/stack"
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"
import type { CompositeNavigationProp } from "@react-navigation/native"
import type { Task, Category } from "./index"

// Stack Navigation Types
export type HomeStackParamList = {
  Tasks: undefined
  TaskDetail: { taskId: string }
  AddEditTask: { task?: Partial<Task> }
}

export type CategoriesStackParamList = {
  CategoriesList: undefined
  AddEditCategory: { category?: Category }
}

// Tab Navigation Types
export type RootTabParamList = {
  Home: undefined
  Categories: undefined
  Calendar: undefined
  Settings: undefined
}

// Combined Navigation Types
export type HomeScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, "Tasks">,
  BottomTabNavigationProp<RootTabParamList>
>

export type TaskDetailScreenNavigationProp = StackNavigationProp<HomeStackParamList, "TaskDetail">

export type AddEditTaskScreenNavigationProp = StackNavigationProp<HomeStackParamList, "AddEditTask">

export type CategoriesScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<CategoriesStackParamList, "CategoriesList">,
  BottomTabNavigationProp<RootTabParamList>
>

export type AddEditCategoryScreenNavigationProp = StackNavigationProp<CategoriesStackParamList, "AddEditCategory">

export type CalendarScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, "Calendar">

export type SettingsScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, "Settings">

