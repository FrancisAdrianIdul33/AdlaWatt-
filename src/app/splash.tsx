import { Colors } from "@/constants/colors";
import { useAppFonts } from "@/hooks/useAppFonts";
import { router } from "expo-router";
import { useEffect } from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    View
} from "react-native";

export default function SplashScreen() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }

    const timer = setTimeout(() => {
      // TODO:
      // Replace with AuthContext later
      router.replace("/auth/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/adlawatt-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

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

  loading: {
    marginTop: 40,
  },
});