import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: PaginationProps) {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <View style={styles.container}>
      {/* Previous */}
      <Pressable
        style={[
          styles.navigationBox,
          isFirstPage && styles.disabledBox,
        ]}
        onPress={onPrevious}
        disabled={isFirstPage}
      >
        <Ionicons
          name="chevron-back-outline"
          size={22}
          color={
            isFirstPage
              ? Colors.light.textSecondary
              : Colors.light.primary
          }
        />

        <AppText
          variant="caption"
          style={[
            styles.navigationText,
            isFirstPage && styles.disabledText,
          ]}
        >
          Prev
        </AppText>
      </Pressable>

      {/* Page Information */}
      <View style={styles.pageBox}>
        <AppText
          variant="caption"
          style={styles.pageText}
        >
          Page {currentPage} of {totalPages}
        </AppText>
      </View>

      {/* Next */}
      <Pressable
        style={[
          styles.navigationBox,
          isLastPage && styles.disabledBox,
        ]}
        onPress={onNext}
        disabled={isLastPage}
      >
        <Ionicons
          name="chevron-forward-outline"
          size={22}
          color={
            isLastPage
              ? Colors.light.textSecondary
              : Colors.light.primary
          }
        />

        <AppText
          variant="caption"
          style={[
            styles.navigationText,
            isLastPage && styles.disabledText,
          ]}
        >
          Next
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    marginTop: 22,
    marginBottom: 8,
  },

  navigationBox: {
    flex: 1,
    minHeight: 72,
    backgroundColor: Colors.glass.white,
    borderWidth: 3,
    borderColor: Colors.light.primary,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  pageBox: {
    flex: 2,
    minHeight: 72,
    backgroundColor: Colors.glass.white,
    borderWidth: 3,
    borderColor: Colors.light.primary,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  navigationText: {
    color: "#000000",
    fontWeight: "600",
  },

  pageText: {
    color: "#000000",
    fontWeight: "700",
    textAlign: "center",
  },

  disabledBox: {
    borderColor: Colors.light.textSecondary,
    opacity: 0.5,
  },

  disabledText: {
    color: Colors.light.textSecondary,
  },
});