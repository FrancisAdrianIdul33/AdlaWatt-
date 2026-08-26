import { Ionicons } from "@expo/vector-icons";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import Sidebar from "@/components/layout/Sidebar";
import AppText from "@/components/ui/AppText";
import EmptyState from "@/components/ui/EmptyState";

import { Colors } from "@/constants/colors";
import { supabase } from "@/lib/supabase";

type TimeFilter =
  | "All"
  | "Last Hour"
  | "Today"
  | "This Week"
  | "This Year";

type ActivityType =
  | "info"
  | "warning"
  | "error"
  | "critical";

type ActivityLog = {
  id: string;
  title: string;
  details: string;
  type: ActivityType;
  date: string;
  time: string;
  timestamp: number;
};

export default function ActivityLogsScreen() {
  const [sidebarVisible, setSidebarVisible] =
    useState(false);

  const [activityLogs, setActivityLogs] =
    useState<ActivityLog[]>([]);

  const [timeFilter, setTimeFilter] =
    useState<TimeFilter>("All");

  const [typeFilter, setTypeFilter] =
    useState<"all" | ActivityType>("all");

  const [timeDropdownVisible, setTimeDropdownVisible] =
    useState(false);

  const [typeDropdownVisible, setTypeDropdownVisible] =
    useState(false);

  const [totalActivityLogs, setTotalActivityLogs] =
    useState(0);

  // ============================================
  // LOAD CURRENT USER'S ACTIVITY LOGS
  // ============================================

  useEffect(() => {
    const loadActivityLogs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setActivityLogs([]);
        setTotalActivityLogs(0);
        return;
      }

      const {
        data,
        error,
        count,
      } = await supabase
        .from("activity_logs")
        .select(
          "act_id, title, description, type, created_at",
          { count: "exact" },
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Error loading activity logs:",
          error.message,
        );

        setActivityLogs([]);
        setTotalActivityLogs(0);
        return;
      }

      const logs: ActivityLog[] = (data ?? []).map(
        (log) => {
          const dateObject = new Date(
            log.created_at,
          );

          const type: ActivityType =
            log.type === "warning" ||
            log.type === "error" ||
            log.type === "critical"
              ? log.type
              : "info";

          return {
            id: log.act_id,
            title: log.title,
            details: log.description,
            type,
            date: dateObject.toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "2-digit",
                year: "numeric",
              },
            ),
            time: dateObject.toLocaleTimeString(
              "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            ),
            timestamp: dateObject.getTime(),
          };
        },
      );

      setActivityLogs(logs);
      setTotalActivityLogs(
        count ?? logs.length,
      );
    };

    loadActivityLogs();
  }, []);

  // ============================================
  // FILTER ACTIVITY LOGS
  // ============================================

  const filteredLogs = useMemo<ActivityLog[]>(
    () => {
      let filtered = [...activityLogs];

      if (typeFilter !== "all") {
        filtered = filtered.filter(
          (activity) =>
            activity.type === typeFilter,
        );
      }

      const now = Date.now();

      if (timeFilter !== "All") {
        const filterDuration: Record<
          Exclude<TimeFilter, "All">,
          number
        > = {
          "Last Hour": 60 * 60 * 1000,
          Today: 24 * 60 * 60 * 1000,
          "This Week": 7 * 24 * 60 * 60 * 1000,
          "This Year": 365 * 24 * 60 * 60 * 1000,
        };

        const minimumTimestamp =
          now - filterDuration[timeFilter];

        filtered = filtered.filter(
          (activity) =>
            activity.timestamp >=
              minimumTimestamp &&
            activity.timestamp <= now,
        );
      }

      return filtered;
    },
    [
      activityLogs,
      timeFilter,
      typeFilter,
    ],
  );

  // ============================================
  // FILTER HANDLERS
  // ============================================

  const handleTimeFilter = (
    filter: TimeFilter,
  ) => {
    setTimeFilter(filter);
    setTimeDropdownVisible(false);
  };

  const handleTypeFilter = (
    filter: "all" | ActivityType,
  ) => {
    setTypeFilter(filter);
    setTypeDropdownVisible(false);
  };

  // ============================================
  // ACTIVITY TYPE LABEL
  // ============================================

  const getTypeLabel = () => {
    switch (typeFilter) {
      case "info":
        return "Info";

      case "warning":
        return "Warning";

      case "error":
        return "Error";

      case "critical":
        return "Critical";

      default:
        return "All";
    }
  };

  // ============================================
  // ACTIVITY TYPE ICON
  // ============================================

  const getTypeIcon =
    (): keyof typeof Ionicons.glyphMap => {
      switch (typeFilter) {
        case "info":
          return "information-circle-outline";

        case "warning":
          return "warning-outline";

        case "error":
        case "critical":
          return "alert-circle-outline";

        default:
          return "list-outline";
      }
    };

  // ============================================
  // RENDER
  // ============================================

  return (
    <ScreenContainer2>
      <NavBar
        onMenuPress={() =>
          setSidebarVisible(true)
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerCard}>
          <AppText
            variant="heading"
            style={styles.title}
          >
            Activity Logs
          </AppText>

          <AppText
            variant="caption"
            style={styles.subtitle}
          >
            System activity and appliance events will
            appear here.
          </AppText>
        </View>

        {/* Total Activity Logs */}
        <View style={styles.totalContainer}>
          <AppText
            variant="caption"
            style={styles.totalLabel}
          >
            Total Activity Logs:{" "}
            <AppText style={styles.totalValue}>
              {totalActivityLogs}
            </AppText>
          </AppText>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {/* Time Filter */}
          <View style={styles.filterWrapper}>
            <Pressable
              onPress={() => {
                setTimeDropdownVisible(
                  !timeDropdownVisible,
                );
                setTypeDropdownVisible(false);
              }}
              style={({ pressed }) => [
                styles.filterButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons
                name="time-outline"
                size={19}
                color={Colors.light.primary}
              />

              <AppText
                variant="caption"
                style={styles.filterText}
              >
                {timeFilter}
              </AppText>

              <Ionicons
                name={
                  timeDropdownVisible
                    ? "chevron-up-outline"
                    : "chevron-down-outline"
                }
                size={18}
                color={Colors.light.text}
              />
            </Pressable>

            {timeDropdownVisible && (
              <View style={styles.dropdown}>
                {(
                  [
                    "All",
                    "Last Hour",
                    "Today",
                    "This Week",
                    "This Year",
                  ] as TimeFilter[]
                ).map((option) => (
                  <Pressable
                    key={option}
                    onPress={() =>
                      handleTimeFilter(option)
                    }
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      timeFilter === option &&
                        styles.selectedDropdownItem,
                      pressed &&
                        styles.dropdownItemPressed,
                    ]}
                  >
                    <Ionicons
                      name={
                        option === "All"
                          ? "time-outline"
                          : "calendar-outline"
                      }
                      size={18}
                      color={
                        timeFilter === option
                          ? Colors.light.primary
                          : Colors.light.textSecondary
                      }
                    />

                    <AppText
                      variant="caption"
                      style={[
                        styles.dropdownText,
                        timeFilter === option &&
                          styles.selectedDropdownText,
                      ]}
                    >
                      {option}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Activity Type Filter */}
          <View style={styles.filterWrapper}>
            <Pressable
              onPress={() => {
                setTypeDropdownVisible(
                  !typeDropdownVisible,
                );
                setTimeDropdownVisible(false);
              }}
              style={({ pressed }) => [
                styles.filterButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons
                name={getTypeIcon()}
                size={19}
                color={
                  typeFilter === "error" ||
                  typeFilter === "critical"
                    ? Colors.light.error
                    : typeFilter === "warning"
                      ? Colors.light.secondary
                      : Colors.light.primary
                }
              />

              <AppText
                variant="caption"
                style={styles.filterText}
              >
                {getTypeLabel()}
              </AppText>

              <Ionicons
                name={
                  typeDropdownVisible
                    ? "chevron-up-outline"
                    : "chevron-down-outline"
                }
                size={18}
                color={Colors.light.text}
              />
            </Pressable>

            {typeDropdownVisible && (
              <View style={styles.dropdown}>
                {[
                  {
                    value: "all",
                    label: "All",
                    icon: "list-outline",
                    color: Colors.light.primary,
                  },
                  {
                    value: "info",
                    label: "Info",
                    icon:
                      "information-circle-outline",
                    color: Colors.light.primary,
                  },
                  {
                    value: "warning",
                    label: "Warning",
                    icon: "warning-outline",
                    color: Colors.light.secondary,
                  },
                  {
                    value: "error",
                    label: "Error",
                    icon: "alert-circle-outline",
                    color: Colors.light.error,
                  },
                  {
                    value: "critical",
                    label: "Critical",
                    icon: "alert-circle-outline",
                    color: Colors.light.error,
                  },
                ].map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() =>
                      handleTypeFilter(
                        option.value as
                          | "all"
                          | ActivityType,
                      )
                    }
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      typeFilter === option.value &&
                        styles.selectedDropdownItem,
                      pressed &&
                        styles.dropdownItemPressed,
                    ]}
                  >
                    <Ionicons
                      name={
                        option.icon as keyof typeof Ionicons.glyphMap
                      }
                      size={18}
                      color={option.color}
                    />

                    <AppText
                      variant="caption"
                      style={[
                        styles.dropdownText,
                        typeFilter === option.value &&
                          styles.selectedDropdownText,
                      ]}
                    >
                      {option.label}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

       {/* Activity Cards */}
<View style={styles.activityList}>
  {filteredLogs.length === 0 ? (
    <EmptyState
      icon="document-text-outline"
      title="No Activity Logs"
      description="No activities match the selected filters."
    />
  ) : (
    filteredLogs.map((activity) => {
      const icon =
        activity.type === "info"
          ? "information-circle-outline"
          : activity.type === "warning"
            ? "warning-outline"
            : "alert-circle-outline";

      const color =
        activity.type === "info"
          ? Colors.light.primary
          : activity.type === "warning"
            ? Colors.light.secondary
            : Colors.light.error;

      return (
        <View
          key={activity.id}
          style={styles.activityCard}
        >
          <View style={styles.activityWrapper}>
            <Ionicons
              name={icon}
              size={24}
              color={color}
            />

            <View style={styles.activityContent}>
              <AppText
                variant="body"
                style={styles.activityTitle}
              >
                {activity.title}
              </AppText>

              <AppText
                variant="caption"
                style={styles.activityDescription}
              >
                {activity.details}
              </AppText>

              <AppText
                variant="caption"
                style={styles.activityTimestamp}
              >
                {activity.date} • {activity.time}
              </AppText>
            </View>
          </View>
        </View>
      );
    })
  )}
</View>

        <Copyright />
      </ScrollView>

      <Sidebar
        visible={sidebarVisible}
        onClose={() =>
          setSidebarVisible(false)
        }
      />
    </ScreenContainer2>
  );
}

const dashboardDimensions = {
    horizontalPadding: 16,
    sectionSpacing: 14,
    cardRadius: 16,
    cardPadding: 18,

    filterGap: 10,
    filterHeight: 48,
    filterRadius: 14,

    dropdownRadius: 14,
    dropdownItemHeight: 44,

    activityGap: 12,
  };

  const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: Colors.light.background,
    },

    content: {
      paddingHorizontal:
        dashboardDimensions.horizontalPadding,

      paddingTop:
        dashboardDimensions.sectionSpacing,

      paddingBottom: 20,
    },

    /* Header */

    headerCard: {
      backgroundColor: Colors.glass.white,

      borderWidth: 3,
      borderColor: Colors.light.primary,

      borderRadius:
        dashboardDimensions.cardRadius,

      padding:
        dashboardDimensions.cardPadding,

      marginBottom: 12,
    },

    title: {
      color: "#000000",
      fontWeight: "700",
    },

    subtitle: {
      color: Colors.light.textSecondary,
      marginTop: 6,
      lineHeight: 20,
    },

    /* Total */

    totalContainer: {
      width: "100%",
      alignItems: "flex-end",
      marginBottom: 10,
    },

    totalLabel: {
      color: Colors.light.textSecondary,
      textAlign: "right",
    },

    totalValue: {
      color: "#000000",
      fontWeight: "700",
    },

    /* Filters */

    filterRow: {
      width: "100%",

      flexDirection: "row",

      gap: dashboardDimensions.filterGap,

      marginBottom: 14,

      zIndex: 10,
    },

    filterWrapper: {
      flex: 1,
      position: "relative",
    },

    filterButton: {
      height:
        dashboardDimensions.filterHeight,

      width: "100%",

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 13,

      gap: 8,

      backgroundColor: Colors.glass.white,

      borderWidth: 3,

      borderColor: Colors.light.primary,

      borderRadius:
        dashboardDimensions.filterRadius,
    },

    filterText: {
      flex: 1,

      color: "#000000",

      fontWeight: "600",
    },

    buttonPressed: {
      opacity: 0.75,
    },

    /* Dropdown */

    dropdown: {
      position: "absolute",

      top:
        dashboardDimensions.filterHeight + 6,

      left: 0,
      right: 0,

      backgroundColor: "#FFFFFF",

      borderWidth: 2,

      borderColor: Colors.light.primary,

      borderRadius:
        dashboardDimensions.dropdownRadius,

      paddingVertical: 5,

      zIndex: 100,

      elevation: 10,

      shadowColor: "#000",

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity: 0.12,

      shadowRadius: 8,
    },

    dropdownItem: {
      minHeight:
        dashboardDimensions.dropdownItemHeight,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 13,

      gap: 10,
    },

    selectedDropdownItem: {
      backgroundColor:
        "rgba(0, 168, 107, 0.10)",
    },

    dropdownItemPressed: {
      opacity: 0.7,
    },

    dropdownText: {
      color: "#000000",
    },

    selectedDropdownText: {
      fontWeight: "700",
    },

    /* Activity List */

    activityList: {
      width: "100%",

      gap: dashboardDimensions.activityGap,

      zIndex: 1,
    },

    activityCard: {
  width: "100%",
  backgroundColor: Colors.glass.white,
  borderWidth: 2,
  borderColor: Colors.light.border,
  borderRadius: 16,
  padding: 12,
},

activityWrapper: {
  width: "100%",
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 10,
},

activityContent: {
  flex: 1,
},

activityTitle: {
  color: "#000000",
  fontWeight: "700",
},

activityDescription: {
  color: Colors.light.textSecondary,
  marginTop: 3,
  lineHeight: 18,
},

activityTimestamp: {
  color: Colors.light.textSecondary,
  marginTop: 5,
  fontSize: 11,
},
  });