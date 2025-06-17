"use client"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import LoginScreen from "../screens/LoginScreen"
import SignUpScreen from "../screens/SignUpScreen"
import { useAuth } from "../context/AuthContext"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
// Screens
import HomeScreen from "../screens/HomeScreen"
import CategoriesScreen from "../screens/CategoriesScreen"
import CalendarScreen from "../screens/CalendarScreen"
import SettingsScreen from "../screens/SettingsScreen"
import TaskDetailScreen from "../screens/TaskDetailScreen"
import AddEditTaskScreen from "../screens/AddEditTaskScreen"
import AddEditCategoryScreen from "../screens/AddEditCategoryScreen"
import TemplatesScreen from "../screens/TemplatesScreen";

// Types
import type { HomeStackParamList, CategoriesStackParamList } from "../types/navigation"
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen"

const Tab = createBottomTabNavigator<RootTabParamList>()
const HomeStack = createStackNavigator<HomeStackParamList>()
const CategoriesStack = createStackNavigator<CategoriesStackParamList>()
const AuthStack = createStackNavigator()
// Removed duplicate AppNavigator definition and merged logic below
import TaskTableScreen from "../screens/TaskTableScreen";
const HomeStackNavigator = () => {
  const { theme } = useTheme()

  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <HomeStack.Screen name="Tasks" component={HomeScreen} />
      <HomeStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: "Task Details" }} />
      <HomeStack.Screen
        name="AddEditTask"
        component={AddEditTaskScreen}
        options={({ route }) => ({
          title: route.params?.task?.id ? "Edit Task" : "Add Task",
        })}
      />
    </HomeStack.Navigator>
  )
}

const CategoriesStackNavigator = () => {
  const { theme } = useTheme()

  return (
    <CategoriesStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <CategoriesStack.Screen name="CategoriesList" component={CategoriesScreen} options={{ title: "Categories" }} />
      <CategoriesStack.Screen
        name="AddEditCategory"
        component={AddEditCategoryScreen}
        options={({ route }) => ({
          title: route.params?.category ? "Edit Category" : "Add Category",
        })}
      />
    </CategoriesStack.Navigator>
  )
}

export const AppNavigator = () => {
  const { user } = useAuth()
  const { theme } = useTheme()

  if (!user) {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="SignUp" component={SignUpScreen} />
        <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </AuthStack.Navigator>
    )
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home"

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if(route.name == "TemplatesScreen"){
            iconName = focused ? "document-text" : "document-text-outline"
          } else if (route.name === "Table") {
            iconName = focused ? "grid" : "grid-outline"
          } else if (route.name === "Categories") {
            iconName = focused ? "list" : "list-outline"
          } else if (route.name === "Calendar") {
            iconName = focused ? "calendar" : "calendar-outline"
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline"
          }

          // Always return a ReactNode
          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="TemplatesScreen" component={TemplatesScreen} />
      <Tab.Screen name="Table"options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
          title: "Table View",
        }}
      >
        {() => <TaskTableScreen section="Table" />}
      </Tab.Screen>
      <Tab.Screen name="Categories" component={CategoriesStackNavigator} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}

// This is the updated type definition for RootTabParamList
export type RootTabParamList = {
  Home: undefined
  Categories: undefined
  Calendar: undefined
  Settings: undefined
  Table: undefined
  TemplatesScreen: undefined
}
