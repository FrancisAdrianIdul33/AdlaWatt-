import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
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
import ActivityCard from "@/components/ActivityCard";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

type ActivityType = "info" | "warning" | "error";

type TimeFilter =
  | "Last Hour"
  | "Today"
  | "This Week"
  | "This Year";

interface ActivityLog {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  date: string;
  time: string;
  timestamp: number;
}

const activityLogs: ActivityLog[] = [
  {
    id: "1",
    type: "info",
    title: "Solar Charging Started",
    description:
      "The solar panel is currently charging the battery using available sunlight.",
    date: "Aug 10, 2026",
    time: "08:42 AM",
    timestamp: new Date("2026-08-10T08:42:00").getTime(),
  },
  {
    id: "2",
    type: "info",
    title: "Appliance Connected",
    description:
      "An electric fan was detected and added to the current power load.",
    date: "Aug 10, 2026",
    time: "08:35 AM",
    timestamp: new Date("2026-08-10T08:35:00").getTime(),
  },
  {
    id: "3",
    type: "warning",
    title: "Battery Level Low",
    description:
      "The battery level has dropped below the recommended operating level.",
    date: "Aug 10, 2026",
    time: "07:58 AM",
    timestamp: new Date("2026-08-10T07:58:00").getTime(),
  },
  {
    id: "4",
    type: "info",
    title: "Battery Level Updated",
    description:
      "The battery level changed from 52% to 50%.",
    date: "Aug 10, 2026",
    time: "07:44 AM",
    timestamp: new Date("2026-08-10T07:44:00").getTime(),
  },
  {
    id: "5",
    type: "warning",
    title: "High Power Consumption",
    description:
      "The current appliance load is higher than the recommended level.",
    date: "Aug 10, 2026",
    time: "07:20 AM",
    timestamp: new Date("2026-08-10T07:20:00").getTime(),
  },
  {
    id: "6",
    type: "error",
    title: "Sensor Connection Lost",
    description:
      "The battery temperature sensor is no longer responding.",
    date: "Aug 10, 2026",
    time: "06:52 AM",
    timestamp: new Date("2026-08-10T06:52:00").getTime(),
  },
  {
    id: "7",
    type: "info",
    title: "System Online",
    description:
      "AdlaWatt successfully connected to the monitoring system.",
    date: "Aug 10, 2026",
    time: "06:30 AM",
    timestamp: new Date("2026-08-10T06:30:00").getTime(),
  },
  {
    id: "8",
    type: "error",
    title: "Inverter Overload Detected",
    description:
      "The inverter detected a load that exceeded the recommended operating level.",
    date: "Aug 09, 2026",
    time: "09:15 PM",
    timestamp: new Date("2026-08-09T21:15:00").getTime(),
  },
];

export default function ActivityLogsScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const [timeFilter, setTimeFilter] =
    useState<TimeFilter>("Last Hour");

  const [typeFilter, setTypeFilter] =
    useState<"all" | ActivityType>("all");

  const [timeDropdownVisible, setTimeDropdownVisible] =
    useState(false);

  const [typeDropdownVisible, setTypeDropdownVisible] =
    useState(false);

  const filteredLogs = useMemo(() => {
    let filtered = [...activityLogs];

    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (activity) => activity.type === typeFilter,
      );
    }

    const now = new Date("2026-08-10T09:00:00").getTime();

    const filterDuration: Record<TimeFilter, number> = {
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
  }, [timeFilter, typeFilter]);

  const handleTimeFilter = (filter: TimeFilter) => {
    setTimeFilter(filter);
    setTimeDropdownVisible(false);
  };

  const handleTypeFilter = (
    filter: "all" | ActivityType,
  ) => {
    setTypeFilter(filter);
    setTypeDropdownVisible(false);
  };

  const getTypeLabel = () => {
    switch (typeFilter) {
      case "info":
        return "Info";
      case "warning":
        return "Warning";
      case "error":
        return "Critical / Error";
      default:
        return "All";
    }
  };

  const getTypeIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (typeFilter) {
      case "info":
        return "information-circle-outline";
      case "warning":
        return "warning-outline";
      case "error":
        return "alert-circle-outline";
      default:
        return "list-outline";
    }
  };

  return (
    <ScreenContainer2>
      <NavBar
        onMenuPress={() => setSidebarVisible(true)}
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
                  typeFilter === "error"
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
                    Critical / Error
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
                type={activity.type}
                title={activity.title}
                description={activity.description}
                date={activity.date}
                time={activity.time}
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
                No activities match the selected filters.
              </AppText>
            </View>
          )}
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
    paddingTop: dashboardDimensions.sectionSpacing,
    paddingBottom: 20,
  },

  /* Header */
  headerCard: {
    backgroundColor: Colors.glass.white,
    borderWidth: 3,
    borderColor: Colors.light.primary,
    borderRadius: dashboardDimensions.cardRadius,
    padding: dashboardDimensions.cardPadding,
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
    height: dashboardDimensions.filterHeight,
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 13,

    gap: 8,

    backgroundColor: Colors.glass.white,

    borderWidth: 3,
    borderColor: Colors.light.primary,

    borderRadius: dashboardDimensions.filterRadius,
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

    top: dashboardDimensions.filterHeight + 6,
    left: 0,
    right: 0,

    backgroundColor: Colors.glass.white,

    borderWidth: 2,
    borderColor: Colors.light.primary,

    borderRadius: dashboardDimensions.dropdownRadius,

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
    backgroundColor: "rgba(0, 168, 107, 0.10)",
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

  /* Activity list */
  activityList: {
    width: "100%",
    gap: dashboardDimensions.activityGap,
    zIndex: 1,
  },

  emptyState: {
    width: "100%",

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.glass.white,

    borderWidth: 3,
    borderColor: Colors.light.border,

    borderRadius: dashboardDimensions.cardRadius,

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