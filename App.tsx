import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { ThemeProvider } from "./src/context/ThemeContext";
import { TodoProvider } from "./src/context/TodoContext";
import { CategoryProvider } from "./src/context/CategoryContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { LogBox, Text } from "react-native"; // Import Text component from react-native
import { AuthProvider, useAuth } from "./src/context/AuthContext"; // Import Auth context
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import React, { useState, useContext } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView

// Ignore specific warnings that might come from third-party libraries
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
  "Sending `onAnimatedValueUpdate` with no listeners registered",
]);

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyDFoQXUgvrVVGmXYQVZ5JEhN6wkb_DmMJ4',  // Your Firebase API key
  authDomain: 'todoapp4567.firebaseapp.com',  // Your Firebase Auth Domain
  projectId: 'todoapp4567',  // Your Firebase Project ID
  storageBucket: 'todoapp4567.appspot.com',  // Your Firebase Storage Bucket
  messagingSenderId: '477768925442',  // Your Firebase Messaging Sender ID
  appId: '1:477768925442:android:889f5129be8774116f821b',  // Your Firebase App ID
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export default function App() {
  const [isDark, setIsDark] = useState(false); // State to toggle between light and dark themes

  // Function to toggle theme
  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <TodoProvider>
              <CategoryProvider>
                <NotificationProvider>
                  <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
                    <AppWithAuthRedirect />
                    <StatusBar />
                  </NavigationContainer>
                </NotificationProvider>
              </CategoryProvider>
            </TodoProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppWithAuthRedirect() {
  const { user, loading } = useAuth(); // Access authentication state

  if (loading) {
    // Show loading screen while checking auth state
    return <LoadingScreen />;
  }

  return user ? <AppNavigator /> : <AppNavigator />; // Redirect to Auth or AppNavigator based on auth state
}

function LoadingScreen() {
  return (
      <Text>Loading...</Text> 
  );
}
