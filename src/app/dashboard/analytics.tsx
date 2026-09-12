import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import Sidebar from "@/components/layout/Sidebar";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

export default function AnalyticsScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <ScreenContainer2>
      {/* Fixed Navbar */}
      <NavBar
        onMenuPress={() => setSidebarVisible(true)}
      />

      {/* Scrollable Analytics Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Analytics Header */}
        <View style={styles.headerCard}>
          <AppText
            variant="heading"
            style={styles.headerTitle}
          >
            Analytics
          </AppText>

          <AppText
            variant="caption"
            style={styles.headerSubtitle}
          >
            View Intuitive Analytics and Generate report and export into PDF or CSV
          </AppText>
        </View>

        {/* Future Analytics Content Goes Here */}

        {/* Copyright */}
        <Copyright />
      </ScrollView>

      {/* Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />
    </ScreenContainer2>
  );
}

/* =========================================================
   Dimensions
   ========================================================= */

const analyticsDimensions = {
  horizontalPadding: 14,
  sectionSpacing: 18,
  headerRadius: 16,
  headerBorderWidth: 3,
  contentBottomPadding: 24,
};

/* =========================================================
   Styles
   ========================================================= */

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  content: {
    paddingHorizontal:
      analyticsDimensions.horizontalPadding,
    paddingTop:
      analyticsDimensions.sectionSpacing,
    paddingBottom:
      analyticsDimensions.contentBottomPadding,
  },

  /* -------------------------------------------------------
     Analytics Header
     ------------------------------------------------------- */

  headerCard: {
    backgroundColor: Colors.glass.white,
    borderWidth:
      analyticsDimensions.headerBorderWidth,
    borderColor: Colors.light.secondary,
    borderRadius:
      analyticsDimensions.headerRadius,
    padding: 18,
    marginBottom: 20,
  },

  headerTitle: {
    color: "#000000",
    fontWeight: "700",
  },

  headerSubtitle: {
    color: Colors.light.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
});