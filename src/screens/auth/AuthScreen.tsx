import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../services/firebase";
import { AuthScreenProps } from "../../types";
import { SvgUri } from "react-native-svg";

const AuthScreen: React.FC<AuthScreenProps> = () => {
  const [email, setEmail] = useState<string>("juanfrank.dev@gmail.com");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("J72016HGp?");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;

  const screenWidth = Dimensions.get("window").width;
  const tabWidth = (screenWidth - 60) / 2;

  const handleAuth = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (activeTab === "signup") {
      if (!confirmPassword) {
        Alert.alert("Error", "Please confirm your password");
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }

      if (password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters long");
        return;
      }
    }

    try {
      if (activeTab === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert("Success", "Logged in successfully!");
      } else {
        if (!username.trim()) {
          Alert.alert("Error", "Please enter a username");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(userCredential.user, {
          displayName: username.trim(),
        });

        Alert.alert("Success", "Account created successfully!");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const switchTab = (tab: "signin" | "signup"): void => {
    if (tab === activeTab) return;

    setActiveTab(tab);

    if (tab === "signin") {
      setConfirmPassword("");
      setUsername("");
    }

    Animated.timing(tabIndicatorPosition, {
      toValue: tab === "signin" ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    tabIndicatorPosition.setValue(activeTab === "signin" ? 0 : 1);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Animated.View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <SvgUri uri={Image.resolveAssetSource(require("../../../assets/icon.svg")).uri} />
          <Text style={styles.logoText}>KAIROS</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                transform: [
                  {
                    translateX: tabIndicatorPosition.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, tabWidth],
                    }),
                  },
                ],
              },
            ]}
          />
          <TouchableOpacity style={styles.tab} onPress={() => switchTab("signin")}>
            <Animated.Text
              style={[
                styles.tabText,
                {
                  color: tabIndicatorPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["#fff", "#7f8c8d"],
                  }),
                },
              ]}
            >
              Sign In
            </Animated.Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => switchTab("signup")}>
            <Animated.Text
              style={[
                styles.tabText,
                {
                  color: tabIndicatorPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["#7f8c8d", "#fff"],
                  }),
                },
              ]}
            >
              Sign Up
            </Animated.Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formWrapper}>
          <View style={styles.formContainer}>
            {activeTab === "signup" && (
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {activeTab === "signup" && (
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            )}
            <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
              <Text style={styles.authButtonText}>
                {activeTab === "signin" ? "Login" : "Register"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1a233a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#34495e",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  logoCenter: {
    width: 20,
    height: 20,
    backgroundColor: "#ecf0f1",
    transform: [{ rotate: "45deg" }],
  },
  logoText: {
    fontSize: 32,
    fontWeight: "300",
    color: "#7f8c8d",
    letterSpacing: 8,
  },
  tabContainer: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 40,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    borderWidth: 1,
    borderColor: "#1a233a",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  tabIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "50%",
    backgroundColor: "#1a233a",
    borderRadius: 16,
    zIndex: 1,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 16,
    minWidth: 100,
    width: "50%",
    alignItems: "center",
    zIndex: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  formWrapper: {
    width: "100%",
    maxWidth: 300,
  },
  formContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    backfaceVisibility: "hidden",
  },
  authButton: {
    backgroundColor: "#1a233a",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    backfaceVisibility: "hidden",
  },
  authButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default AuthScreen;
