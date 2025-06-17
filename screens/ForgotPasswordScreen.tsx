import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { sendPasswordResetEmail, getAuth } from "firebase/auth";
import { useTheme } from "../context/ThemeContext";

const ForgotPasswordScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Check your email",
        "A password reset link has been sent to your email address."
      );
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.primary }]}>Forgot Password</Text>
      <TextInput
        placeholder="Enter your email"
        placeholderTextColor={theme.colors.secondary}
        value={email}
        onChangeText={setEmail}
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Sending..." : "Send Reset Link"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  header: { fontSize: 24, fontWeight: "600", marginBottom: 24, textAlign: "center" },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: "#007BFF", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#FFF", fontWeight: "600", fontSize: 16 },
});

export default ForgotPasswordScreen;