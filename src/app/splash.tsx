import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // TODO:
      // Replace with AuthContext later
      router.replace("/auth/login");
    }, 10000);

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
        color="#2E7D32"
        style={{ marginTop: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  logo: {
    width: 400,
    height: 200,
    marginBottom: 10,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});