import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const LoginScreen = ({ navigation }: any) => {
  const { signIn } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.primary }]}>Login</Text>

      {/* Loading screen */}
      {loading && (
        <View style={styles.container}>
          <Text style={styles.loadingText}>Loading...</Text>
          <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
        </View>
      )}

      <TextInput
        placeholder="Email"
        placeholderTextColor={theme.colors.secondary}
        value={email}
        onChangeText={setEmail}
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor={theme.colors.secondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
      />

      {!loading ? (
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      ) : (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
      )}

      <TouchableOpacity onPress={() => navigation.navigate("SignUp")} style={{ marginTop: 16 }}>
        <Text style={{ color: theme.colors.text }}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={{ color: theme.colors.text }}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
    color: "#888",
  },
  loader: {
    marginTop: 10,
  },
});

export default LoginScreen;
