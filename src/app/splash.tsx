import { Colors } from "@/constants/colors";
import { router } from "expo-router";
import { useEffect } from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // TODO:
      // Replace with AuthContext later
      router.replace("/auth/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/adlawatt-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.subtitle}>
        Smart Off-Grid Solar Energy Monitoring System
      </Text>

      <ActivityIndicator
        size="large"
        color={Colors.light.primary}
        style={styles.loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  logo: {
    width: 300,
    height: 200,
    marginBottom: 5,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },

  loading: {
    marginTop: 40,
  },
});