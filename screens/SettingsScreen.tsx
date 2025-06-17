import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Linking,
  Image,
  Modal,
  TextInput,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTheme } from "../context/ThemeContext"
import { useTodo } from "../context/TodoContext"
import { useCategory } from "../context/CategoryContext"
import { useNotification } from "../context/NotificationContext"
import TemplatesScreen from "../screens/TemplatesScreen"
// Import Firebase Auth from modular SDK
import { getAuth, signOut, updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider, sendEmailVerification } from "firebase/auth"
import * as ImagePicker from "expo-image-picker"

const PROFILE_IMAGE_KEY = "PROFILE_IMAGE_URI";

const SettingsScreen = ({ navigation }: any) => {
  const { theme, isDark, toggleTheme } = useTheme()
  const todoContext = useTodo()
  const { categories } = useCategory()
  const notificationContext = useNotification()
  
  // State
  const [image, setImage] = useState<string | null>(null) // Profile image
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");

  useEffect(() => {
    const loadProfileImage = async () => {
      const savedImageUri = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      if (savedImageUri) {
        setImage(savedImageUri);
      }
    };

    loadProfileImage();
  }, []);

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to clear all tasks, categories, and settings? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All Data",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear()
              Alert.alert("Data Cleared", "All data has been cleared. Please restart the app.", [{ text: "OK" }])
            } catch (error) {
              console.error("Error clearing data:", error)
              Alert.alert("Error", "Failed to clear data")
            }
          },
        },
      ]
    )
  }

  const handleExportData = () => {
    const exportData = {
      // tasks removed as it's not available in todoContext
      categories,
      // notifications removed as it's not available in notificationContext
    }

    Alert.alert(
      "Export Data",
      "In a production app, this would save your data to a file. For this demo, data is logged to console.",
      [{ text: "OK" }]
    )

    console.log("Exported Data:", exportData)
  }

  const handleImportData = () => {
    Alert.alert("Import Data", "In a production app, this would allow you to import data from a file.", [
      { text: "OK" },
    ])
  }

  const handleLogout = async () => {
    try {
      const auth = getAuth()
      await signOut(auth)
      Alert.alert("Success", "You have logged out successfully!")
    } catch (error) {
      Alert.alert("Logout Failed", error.message || "An error occurred during logout.")
    }
  }

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
      await AsyncStorage.setItem(PROFILE_IMAGE_KEY, result.assets[0].uri)
    }
  }

  const handleRemoveImage = async () => {
    setImage(null)
    await AsyncStorage.removeItem(PROFILE_IMAGE_KEY)
  }

  // Handler for changing password
  const handleChangePassword = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user found");
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      Alert.alert("Success", "Password updated successfully!");
      setPasswordModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update password.");
    }
  };

  // Handler for updating email
    const handleUpdateEmail = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No user found");
      const credential = EmailAuthProvider.credential(user.email, emailCurrentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update email
      await updateEmail(user, newEmail);

      // Send verification email to the new address
      await sendEmailVerification(user);

      Alert.alert(
        "Success",
        "Email updated! Please check your new email and verify it before logging in again."
      );
      setEmailModalVisible(false);
      setNewEmail("");
      setEmailCurrentPassword("");
    } catch (error: any) {
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        Alert.alert("Error", "The current password you entered is incorrect.");
      } else if (error.code === "auth/operation-not-allowed") {
        Alert.alert("Error", "Email update is not allowed. Please contact support or check your Firebase Auth settings.");
      } else if (error.code === "auth/email-already-in-use") {
        Alert.alert("Error", "This email is already in use by another account.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Error", "The new email address is not valid.");
      } else {
        Alert.alert("Error", error.message || "Failed to update email.");
      }
    }
  };

  const renderSettingItem = (icon, title, description, rightElement) => (
    <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
        {description && (
          <Text style={[styles.settingDescription, { color: theme.colors.secondary }]}>{description}</Text>
        )}
      </View>
      {rightElement}
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={100} color={theme.colors.primary} />
          )}
          <Text style={[styles.sectionTitle, { color: theme.colors.secondary, marginTop: 8 }]}>Profile Picture</Text>
        </View>

        {/* Profile Option in Settings List */}
        <View style={styles.section}>
          {renderSettingItem(
            "person-circle-outline",
            "Profile",
            "Edit your profile picture",
            <TouchableOpacity style={styles.touchable} onPress={() => setProfileModalVisible(true)}>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondary }]}>Appearance</Text>

          {renderSettingItem(
            "moon-outline",
            "Dark Mode",
            "Switch between light and dark theme",
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          )}
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.secondary }]}>Data Management</Text>

          {renderSettingItem(
            "download-outline",
            "Export Data",
            "Export your tasks and categories",
            <TouchableOpacity style={styles.touchable} onPress={handleExportData}>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.secondary} />
            </TouchableOpacity>
          )}

          {renderSettingItem(
            "cloud-upload-outline",
            "Import Data",
            "Import tasks and categories from a file",
            <TouchableOpacity style={styles.touchable} onPress={handleImportData}>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.secondary} />
            </TouchableOpacity>
          )}

          {renderSettingItem(
            "trash-outline",
            "Clear All Data",
            "Delete all tasks, categories, and settings",
            <TouchableOpacity style={styles.touchable} onPress={handleClearAllData}>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.secondary} />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* ...Profile and Appearance sections... */}

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.secondary }]}>Account</Text>

            {renderSettingItem(
              "key-outline",
              "Change Password",
              "Update your password",
              <TouchableOpacity style={styles.touchable} onPress={() => setPasswordModalVisible(true)}>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.secondary} />
              </TouchableOpacity>
            )}

            {renderSettingItem(
              "mail-outline",
              "Update Email",
              "Change your account email",
              <TouchableOpacity style={styles.touchable} onPress={() => setEmailModalVisible(true)}>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.secondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* ...Data Management, About, Logout sections... */}
        </ScrollView>

        {/* Logout Section */}
        <View style={styles.section}>
          {renderSettingItem(
            "log-out-outline",
            "Logout",
            "Sign out of your account",
            <TouchableOpacity style={styles.touchable} onPress={handleLogout}>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.sectionTitle, { color: theme.colors.secondary }]}>Edit Profile Picture</Text>
            {image ? (
              <Image source={{ uri: image }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person-circle-outline" size={100} color={theme.colors.primary} />
            )}
            <TouchableOpacity style={styles.button} onPress={handlePickImage}>
              <Text style={styles.buttonText}>Choose New Picture</Text>
            </TouchableOpacity>
            {image && (
              <TouchableOpacity style={styles.button} onPress={handleRemoveImage}>
                <Text style={styles.buttonText}>Remove Picture</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.button, { backgroundColor: "#888" }]} onPress={() => setProfileModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.sectionTitle, { color: theme.colors.secondary }]}>Change Password</Text>
            <TextInput
              placeholder="Current Password"
              secureTextEntry
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              placeholder="New Password"
              secureTextEntry
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
              <Text style={styles.buttonText}>Update Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: "#888" }]} onPress={() => setPasswordModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Update Email Modal */}
      <Modal
        visible={emailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEmailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.sectionTitle, { color: theme.colors.secondary }]}>Update Email</Text>
            <TextInput
              placeholder="New Email"
              style={styles.input}
              value={newEmail}
              onChangeText={setNewEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Current Password"
              secureTextEntry
              style={styles.input}
              value={emailCurrentPassword}
              onChangeText={setEmailCurrentPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleUpdateEmail}>
              <Text style={styles.buttonText}>Update Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: "#888" }]} onPress={() => setEmailModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Navigate to Templates Screen Button (for testing) */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("TemplatesScreen")}
      >
        <Text style={styles.buttonText}>Show Templates</Text>
      </TouchableOpacity>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 40,
    alignItems: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  touchable: {
    paddingVertical: 12,
    paddingRight: 12,
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    width: "100%",
  },
})

export default SettingsScreen
