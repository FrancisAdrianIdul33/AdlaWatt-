import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import Sidebar from "@/components/layout/Sidebar";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

export default function ComponentsScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <ScreenContainer2>
      <NavBar onMenuPress={() => setSidebarVisible(true)} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          <AppText variant="heading" style={styles.title}>
            Components
          </AppText>

          <AppText variant="caption" style={styles.subtitle}>
            Monitor AdlaWatt system components.
          </AppText>
        </View>

        <Copyright />
      </ScrollView>

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />
    </ScreenContainer2>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  content: {
    padding: 16,
  },

  card: {
    backgroundColor: Colors.glass.white,
    borderWidth: 3,
    borderColor: Colors.light.secondary,
    borderRadius: 16,
    padding: 18,
  },

  title: {
    color: "#000000",
    fontWeight: "700",
  },

  subtitle: {
    color: Colors.light.textSecondary,
    marginTop: 6,
  },
});