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

import ActivityCard, {
  ActivityCardData,
  ActivityType,
} from "@/components/ActivityCard";

import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import Sidebar from "@/components/layout/Sidebar";
import AppText from "@/components/ui/AppText";

import { Colors } from "@/constants/colors";
import { supabase } from "@/lib/supabase";

type TimeFilter =
  | "Last Hour"
  | "Today"
  | "This Week"
  | "This Year";

type ActivityLog = ActivityCardData & {
  timestamp: number;
};

export default function ActivityLogsScreen() {
  const [sidebarVisible, setSidebarVisible] =
    useState(false);

  const [activityLogs, setActivityLogs] =
    useState<ActivityLog[]>([]);

  const [timeFilter, setTimeFilter] =
    useState<TimeFilter>("Last Hour");

  const [typeFilter, setTypeFilter] =
    useState<"all" | ActivityType>("all");

  const [timeDropdownVisible, setTimeDropdownVisible] =
    useState(false);

  const [typeDropdownVisible, setTypeDropdownVisible] =
    useState(false);

  /*
   * Load activity logs from Supabase
   */
 useEffect(() => {
  const loadActivityLogs = async () => {
    const { data, error } = await supabase
      .from("activity_logs")
      .select(
        "act_log_id, user_id, title, description, type, timestamp",
      )
      .order("timestamp", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Error loading activity logs:",
        error,
      );
      return;
    }

    const logs: ActivityLog[] = (data ?? []).map(
      (log) => {
        const dateObject = new Date(
          log.timestamp,
        );

        return {
          id: log.act_log_id,
          title: log.title,
          details: log.description,
          type: log.type as ActivityType,
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
  };

  loadActivityLogs();
}, []);

  /*
   * Filter activity logs
   */
  const filteredLogs = useMemo(() => {
    let filtered = [...activityLogs];

    /*
     * Activity type filter
     */
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (activity) =>
          activity.type === typeFilter,
      );
    }

    /*
     * Time filter
     */
    const now = Date.now();

    const filterDuration: Record<
      TimeFilter,
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
        activity.timestamp >= minimumTimestamp &&
        activity.timestamp <= now,
    );

    return filtered;
  }, [
    activityLogs,
    timeFilter,
    typeFilter,
  ]);

  /*
   * Handle time filter
   */
  const handleTimeFilter = (
    filter: TimeFilter,
  ) => {
    setTimeFilter(filter);
    setTimeDropdownVisible(false);
  };

  /*
   * Handle activity type filter
   */
  const handleTypeFilter = (
    filter: "all" | ActivityType,
  ) => {
    setTypeFilter(filter);
    setTypeDropdownVisible(false);
  };

  /*
   * Activity type label
   */
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

  /*
   * Activity type icon
   */
  const getTypeIcon =
    (): keyof typeof Ionicons.glyphMap => {
      switch (typeFilter) {
        case "info":
          return "information-circle-outline";

        case "warning":
          return "warning-outline";

        case "error":
          return "alert-circle-outline";

        case "critical":
          return "alert-circle-outline";

        default:
          return "list-outline";
      }
    };

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
              {filteredLogs.length}
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
                        option === "Last Hour"
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
                {/* All */}
                <Pressable
                  onPress={() =>
                    handleTypeFilter("all")
                  }
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    typeFilter === "all" &&
                      styles.selectedDropdownItem,
                    pressed &&
                      styles.dropdownItemPressed,
                  ]}
                >
                  <Ionicons
                    name="list-outline"
                    size={18}
                    color={
                      typeFilter === "all"
                        ? Colors.light.primary
                        : Colors.light.textSecondary
                    }
                  />

                  <AppText
                    variant="caption"
                    style={[
                      styles.dropdownText,
                      typeFilter === "all" &&
                        styles.selectedDropdownText,
                    ]}
                  >
                    All
                  </AppText>
                </Pressable>

                {/* Info */}
                <Pressable
                  onPress={() =>
                    handleTypeFilter("info")
                  }
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    typeFilter === "info" &&
                      styles.selectedDropdownItem,
                    pressed &&
                      styles.dropdownItemPressed,
                  ]}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color={Colors.light.primary}
                  />

                  <AppText
                    variant="caption"
                    style={[
                      styles.dropdownText,
                      typeFilter === "info" &&
                        styles.selectedDropdownText,
                    ]}
                  >
                    Info
                  </AppText>
                </Pressable>

                {/* Warning */}
                <Pressable
                  onPress={() =>
                    handleTypeFilter("warning")
                  }
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    typeFilter === "warning" &&
                      styles.selectedDropdownItem,
                    pressed &&
                      styles.dropdownItemPressed,
                  ]}
                >
                  <Ionicons
                    name="warning-outline"
                    size={18}
                    color={Colors.light.secondary}
                  />

                  <AppText
                    variant="caption"
                    style={[
                      styles.dropdownText,
                      typeFilter === "warning" &&
                        styles.selectedDropdownText,
                    ]}
                  >
                    Warning
                  </AppText>
                </Pressable>

                {/* Error */}
                <Pressable
                  onPress={() =>
                    handleTypeFilter("error")
                  }
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    typeFilter === "error" &&
                      styles.selectedDropdownItem,
                    pressed &&
                      styles.dropdownItemPressed,
                  ]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color={Colors.light.error}
                  />

                  <AppText
                    variant="caption"
                    style={[
                      styles.dropdownText,
                      typeFilter === "error" &&
                        styles.selectedDropdownText,
                    ]}
                  >
                    Error
                  </AppText>
                </Pressable>

                {/* Critical */}
                <Pressable
                  onPress={() =>
                    handleTypeFilter("critical")
                  }
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    typeFilter === "critical" &&
                      styles.selectedDropdownItem,
                    pressed &&
                      styles.dropdownItemPressed,
                  ]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color={Colors.light.error}
                  />

                  <AppText
                    variant="caption"
                    style={[
                      styles.dropdownText,
                      typeFilter === "critical" &&
                        styles.selectedDropdownText,
                    ]}
                  >
                    Critical
                  </AppText>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Activity Cards */}
        <View style={styles.activityList}>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={42}
                color={Colors.light.textSecondary}
              />

              <AppText
                variant="body"
                style={styles.emptyTitle}
              >
                No Activity Logs
              </AppText>

              <AppText
                variant="caption"
                style={styles.emptyDescription}
              >
                No activities match the selected
                filters.
              </AppText>
            </View>
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

  emptyState: {
    width: "100%",

    alignItems: "center",

    justifyContent: "center",

    backgroundColor:
      Colors.glass.white,

    borderWidth: 3,

    borderColor: Colors.light.border,

    borderRadius:
      dashboardDimensions.cardRadius,

    paddingVertical: 35,

    paddingHorizontal: 20,
  },

  emptyTitle: {
    color: "#000000",

    fontWeight: "700",

    marginTop: 10,
  },

  emptyDescription: {
    color: Colors.light.textSecondary,

    textAlign: "center",

    marginTop: 5,
  },
});