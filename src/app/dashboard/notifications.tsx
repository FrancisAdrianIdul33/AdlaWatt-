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
import NotificationCard, {
  NotificationCardData,
  NotificationType,
} from "@/components/NotificationCard";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";

type TimeFilter =
  | "Last Hour"
  | "Today"
  | "This Week"
  | "This Year";

export default function NotificationsScreen() {
  const [sidebarVisible, setSidebarVisible] =
    useState(false);

  const [timeFilter, setTimeFilter] =
    useState<TimeFilter>("Today");

  const [typeFilter, setTypeFilter] =
    useState<"All" | NotificationType>("All");

  const [timeDropdownVisible, setTimeDropdownVisible] =
    useState(false);

  const [typeDropdownVisible, setTypeDropdownVisible] =
    useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  /*
   * Static notification data for development.
   *
   * The notifications are arranged from newest
   * to oldest.
   *
   * Later, this can be replaced with data
   * fetched from the database.
   */
  const [notifications, setNotifications] =
    useState<NotificationCardData[]>([
      {
        id: "1",
        title: "Battery Level Low",
        message:
          "The battery level has dropped below the recommended operating level.",
        date: "Aug 10, 2026",
        time: "10:42 AM",
        type: "alert",
        isRead: false,
      },
      {
        id: "2",
        title: "Battery Temperature Warning",
        message:
          "The battery temperature is approaching the recommended operating limit.",
        date: "Aug 10, 2026",
        time: "10:35 AM",
        type: "alert",
        isRead: false,
      },
      {
        id: "3",
        title: "Solar Input Detected",
        message:
          "Solar energy is currently being received by the system.",
        date: "Aug 10, 2026",
        time: "10:28 AM",
        type: "normal",
        isRead: false,
      },
      {
        id: "4",
        title: "System Online",
        message:
          "AdlaWatt is connected and monitoring the system.",
        date: "Aug 10, 2026",
        time: "10:15 AM",
        type: "normal",
        isRead: true,
      },
      {
        id: "5",
        title: "High Power Consumption",
        message:
          "The connected appliances are currently consuming more power than usual.",
        date: "Aug 10, 2026",
        time: "9:58 AM",
        type: "alert",
        isRead: true,
      },
      {
        id: "6",
        title: "Appliance Connected",
        message:
          "An appliance has been connected to the AdlaWatt system.",
        date: "Aug 10, 2026",
        time: "9:42 AM",
        type: "normal",
        isRead: true,
      },
      {
        id: "7",
        title: "Solar Charging Started",
        message:
          "The solar panel has started charging the battery.",
        date: "Aug 10, 2026",
        time: "9:12 AM",
        type: "normal",
        isRead: true,
      },
      {
        id: "8",
        title: "System Monitoring Active",
        message:
          "Real-time system monitoring is currently active.",
        date: "Aug 10, 2026",
        time: "8:55 AM",
        type: "normal",
        isRead: true,
      },
      {
        id: "9",
        title: "Inverter Overload Warning",
        message:
          "The inverter detected a load that is approaching its operating limit.",
        date: "Aug 10, 2026",
        time: "8:41 AM",
        type: "alert",
        isRead: true,
      },
      {
        id: "10",
        title: "Battery Fully Charged",
        message:
          "The battery has reached its current charging capacity.",
        date: "Aug 10, 2026",
        time: "8:30 AM",
        type: "normal",
        isRead: true,
      },
      {
        id: "11",
        title: "Energy Monitoring Updated",
        message:
          "The latest energy consumption data has been recorded.",
        date: "Aug 10, 2026",
        time: "8:18 AM",
        type: "normal",
        isRead: true,
      },
      {
        id: "12",
        title: "Sensor Connection Warning",
        message:
          "One of the system sensors may have temporarily lost connection.",
        date: "Aug 10, 2026",
        time: "8:05 AM",
        type: "alert",
        isRead: true,
      },
      {
        id: "13",
        title: "Appliance Recommendation Updated",
        message:
          "The system has updated appliance recommendations based on battery capacity.",
        date: "Aug 10, 2026",
        time: "7:48 AM",
        type: "normal",
        isRead: true,
      },
      {
        id: "14",
        title: "Energy Consumption Recorded",
        message:
          "The system successfully recorded the latest appliance energy consumption.",
        date: "Aug 10, 2026",
        time: "7:32 AM",
        type: "normal",
        isRead: true,
      },
      {
        id: "15",
        title: "Battery Discharging",
        message:
          "The battery is currently supplying power to connected appliances.",
        date: "Aug 9, 2026",
        time: "11:42 PM",
        type: "normal",
        isRead: true,
      },
      {
        id: "16",
        title: "Battery Level Critical",
        message:
          "The battery level is critically low. Consider disconnecting non-essential appliances.",
        date: "Aug 9, 2026",
        time: "11:15 PM",
        type: "alert",
        isRead: true,
      },
      {
        id: "17",
        title: "System Backup Activated",
        message:
          "AdlaWatt has switched to battery backup operation.",
        date: "Aug 9, 2026",
        time: "10:45 PM",
        type: "normal",
        isRead: true,
      },
    ]);

  /*
   * Total notification count.
   *
   * This represents ALL notifications and is
   * independent of the active filters.
   *
   * When connected to the database, this value
   * should come from the database count.
   */
  const totalNotifications = notifications.length;

  const notificationsPerPage = 15;

  /*
   * Apply filters.
   *
   * Filtering does not affect the total
   * notification count above.
   */
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    /*
     * Notification type
     */
    if (typeFilter !== "All") {
      result = result.filter(
        (notification) =>
          notification.type === typeFilter,
      );
    }

    /*
     * Time filter
     *
     * This is temporary development logic.
     * When connected to the database, the
     * actual notification timestamps should
     * be used.
     */
    if (timeFilter === "Last Hour") {
      result = result.slice(0, 4);
    } else if (timeFilter === "Today") {
      result = result.filter(
        (notification) =>
          notification.date === "Aug 10, 2026",
      );
    } else if (timeFilter === "This Week") {
      result = result;
    } else if (timeFilter === "This Year") {
      result = result;
    }

    /*
     * Newest first.
     *
     * The current static data is already ordered
     * this way.
     *
     * Database implementation should eventually
     * sort using the notification timestamp.
     */
    return result;
  }, [
    notifications,
    timeFilter,
    typeFilter,
  ]);

  /*
   * Pagination
   */
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredNotifications.length /
        notificationsPerPage,
    ),
  );

  const pageStart =
    (currentPage - 1) *
    notificationsPerPage;

  const pageEnd =
    currentPage * notificationsPerPage;

  const currentPageNotifications =
    filteredNotifications.slice(
      pageStart,
      pageEnd,
    );

  /*
   * Divide the current page into Recent
   * and Earlier notifications.
   */
  const recentNotifications =
    currentPageNotifications.filter(
      (notification) =>
        !notification.isRead,
    );

  const earlierNotifications =
    currentPageNotifications.filter(
      (notification) =>
        notification.isRead,
    );

  /*
   * Time filter
   */
  const handleTimeFilter = (
    value: TimeFilter,
  ) => {
    setTimeFilter(value);
    setCurrentPage(1);
    setTimeDropdownVisible(false);
  };

  /*
   * Notification type filter
   */
  const handleTypeFilter = (
    value: "All" | NotificationType,
  ) => {
    setTypeFilter(value);
    setCurrentPage(1);
    setTypeDropdownVisible(false);
  };

  /*
   * Mark all notifications as read.
   *
   * Later this should also update the database.
   */
  const handleMarkAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );
  };

  return (
    <ScreenContainer2>
      {/* Fixed Navbar */}
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
            Notifications
          </AppText>

          <AppText
            variant="caption"
            style={styles.subtitle}
          >
            System notifications and important
            alerts will appear here.
          </AppText>
        </View>

        {/* Total Notifications */}
        <View style={styles.totalContainer}>
          <AppText
            variant="caption"
            style={styles.totalText}
          >
            Total Notifications:{" "}
            <AppText style={styles.totalNumber}>
              {totalNotifications}
            </AppText>
          </AppText>
        </View>

        {/* Filters */}
        <View style={styles.controlsContainer}>
          {/* Time Dropdown */}
          <View style={styles.dropdownWrapper}>
            <Pressable
              style={styles.dropdownButton}
              onPress={() => {
                setTimeDropdownVisible(
                  !timeDropdownVisible,
                );
                setTypeDropdownVisible(false);
              }}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={Colors.light.primary}
              />

              <AppText
                variant="caption"
                style={styles.dropdownButtonText}
              >
                {timeFilter}
              </AppText>

              <Ionicons
                name={
                  timeDropdownVisible
                    ? "chevron-up-outline"
                    : "chevron-down-outline"
                }
                size={17}
                color={Colors.light.primary}
              />
            </Pressable>

            {timeDropdownVisible && (
              <View style={styles.dropdown}>
                {[
                  "Last Hour",
                  "Today",
                  "This Week",
                  "This Year",
                ].map((option) => (
                  <Pressable
                    key={option}
                    style={styles.dropdownItem}
                    onPress={() =>
                      handleTimeFilter(
                        option as TimeFilter,
                      )
                    }
                  >
                    <AppText
                      variant="caption"
                      style={[
                        styles.dropdownItemText,
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

          {/* Type Dropdown */}
          <View style={styles.dropdownWrapper}>
            <Pressable
              style={styles.dropdownButton}
              onPress={() => {
                setTypeDropdownVisible(
                  !typeDropdownVisible,
                );
                setTimeDropdownVisible(false);
              }}
            >
              <Ionicons
                name="notifications-outline"
                size={18}
                color={Colors.light.primary}
              />

              <AppText
                variant="caption"
                style={styles.dropdownButtonText}
              >
                {typeFilter === "All"
                  ? "All"
                  : typeFilter === "normal"
                    ? "Normal"
                    : "Alert"}
              </AppText>

              <Ionicons
                name={
                  typeDropdownVisible
                    ? "chevron-up-outline"
                    : "chevron-down-outline"
                }
                size={17}
                color={Colors.light.primary}
              />
            </Pressable>

            {typeDropdownVisible && (
              <View style={styles.dropdown}>
                {/* All */}
                <Pressable
                  style={styles.dropdownItem}
                  onPress={() =>
                    handleTypeFilter("All")
                  }
                >
                  <Ionicons
                    name="list-outline"
                    size={17}
                    color={
                      Colors.light.textSecondary
                    }
                  />

                  <AppText
                    variant="caption"
                    style={[
                      styles.dropdownItemText,
                      typeFilter === "All" &&
                        styles.selectedDropdownText,
                    ]}
                  >
                    All
                  </AppText>
                </Pressable>

                {/* Normal */}
                <Pressable
                  style={styles.dropdownItem}
                  onPress={() =>
                    handleTypeFilter("normal")
                  }
                >
                  <Ionicons
                    name="notifications-outline"
                    size={17}
                    color="#2196F3"
                  />

                  <AppText
                    variant="caption"
                    style={[
                      styles.dropdownItemText,
                      typeFilter === "normal" &&
                        styles.selectedDropdownText,
                    ]}
                  >
                    Normal
                  </AppText>
                </Pressable>

                {/* Alert */}
                <Pressable
                  style={styles.dropdownItem}
                  onPress={() =>
                    handleTypeFilter("alert")
                  }
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={17}
                    color={Colors.light.error}
                  />

                  <AppText
                    variant="caption"
                    style={[
                      styles.dropdownItemText,
                      typeFilter === "alert" &&
                        styles.selectedDropdownText,
                    ]}
                  >
                    Alert
                  </AppText>
                </Pressable>
              </View>
            )}
          </View>

          {/* Mark as Read */}
          <Pressable
            style={styles.markReadButton}
            onPress={handleMarkAsRead}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={17}
              color="#FFFFFF"
            />

            <AppText
              variant="caption"
              style={styles.markReadText}
            >
              Mark as Read
            </AppText>
          </Pressable>
        </View>

        {/* Recent */}
        {recentNotifications.length > 0 && (
          <View style={styles.section}>
            <AppText
              variant="body"
              style={styles.sectionTitle}
            >
              Recent
            </AppText>

            <View style={styles.notificationList}>
              {recentNotifications.map(
                (notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ),
              )}
            </View>
          </View>
        )}

        {/* Earlier */}
        {earlierNotifications.length > 0 && (
          <View
            style={[
              styles.section,
              recentNotifications.length > 0 &&
                styles.earlierSection,
            ]}
          >
            <AppText
              variant="body"
              style={styles.sectionTitle}
            >
              Earlier
            </AppText>

            <View style={styles.notificationList}>
              {earlierNotifications.map(
                (notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ),
              )}
            </View>
          </View>
        )}

        {/* Empty State */}
        {currentPageNotifications.length ===
          0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={34}
              color={
                Colors.light.textSecondary
              }
            />

            <AppText
              variant="caption"
              style={styles.emptyStateText}
            >
              No notifications found for
              the selected filters.
            </AppText>
          </View>
        )}

        {/* Pagination */}
        {filteredNotifications.length >
          notificationsPerPage && (
          <View style={styles.pagination}>
            {/* Previous */}
            <Pressable
              style={[
                styles.pageButton,
                currentPage === 1 &&
                  styles.disabledPageButton,
              ]}
              disabled={currentPage === 1}
              onPress={() =>
                setCurrentPage(
                  currentPage - 1,
                )
              }
            >
              <Ionicons
                name="chevron-back-outline"
                size={18}
                color={
                  currentPage === 1
                    ? Colors.light.textSecondary
                    : Colors.light.primary
                }
              />
            </Pressable>

            {/* Page Numbers */}
            {Array.from(
              { length: totalPages },
              (_, index) => index + 1,
            ).map((page) => (
              <Pressable
                key={page}
                style={[
                  styles.pageNumber,
                  currentPage === page &&
                    styles.activePageNumber,
                ]}
                onPress={() =>
                  setCurrentPage(page)
                }
              >
                <AppText
                  variant="caption"
                  style={[
                    styles.pageNumberText,
                    currentPage === page &&
                      styles.activePageNumberText,
                  ]}
                >
                  {page}
                </AppText>
              </Pressable>
            ))}

            {/* Next */}
            <Pressable
              style={[
                styles.pageButton,
                currentPage === totalPages &&
                  styles.disabledPageButton,
              ]}
              disabled={
                currentPage === totalPages
              }
              onPress={() =>
                setCurrentPage(
                  currentPage + 1,
                )
              }
            >
              <Ionicons
                name="chevron-forward-outline"
                size={18}
                color={
                  currentPage === totalPages
                    ? Colors.light.textSecondary
                    : Colors.light.primary
                }
              />
            </Pressable>
          </View>
        )}

        <Copyright />
      </ScrollView>

      {/* Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        onClose={() =>
          setSidebarVisible(false)
        }
      />
    </ScreenContainer2>
  );
}

const notificationDimensions = {
  borderWidth: 3,
  cardRadius: 16,

  filterHeight: 42,
  filterRadius: 12,

  dropdownRadius: 12,
  dropdownItemHeight: 42,

  buttonRadius: 12,
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  content: {
    padding: 16,
    paddingBottom: 24,
  },

  /* Header */

  headerCard: {
    backgroundColor: Colors.glass.white,

    borderWidth:
      notificationDimensions.borderWidth,

    borderColor: Colors.light.primary,

    borderRadius:
      notificationDimensions.cardRadius,

    padding: 18,

    marginBottom: 10,
  },

  title: {
    color: "#000000",
    fontWeight: "700",
  },

  subtitle: {
    color: Colors.light.textSecondary,

    marginTop: 6,

    fontWeight: "400",

    lineHeight: 19,
  },

  /* Total */

  totalContainer: {
    width: "100%",

    alignItems: "flex-end",

    marginBottom: 10,
  },

  totalText: {
    color: Colors.light.textSecondary,
  },

  totalNumber: {
    color: "#000000",
    fontWeight: "700",
  },

  /* Controls */

  controlsContainer: {
    width: "100%",

    flexDirection: "row",

    alignItems: "center",

    gap: 8,

    marginBottom: 20,

    zIndex: 100,
  },

  dropdownWrapper: {
    position: "relative",

    flex: 1,

    zIndex: 100,
  },

  dropdownButton: {
    minHeight:
      notificationDimensions.filterHeight,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 6,

    paddingHorizontal: 10,

    backgroundColor: Colors.glass.white,

    borderWidth: 2,

    borderColor: Colors.light.primary,

    borderRadius:
      notificationDimensions.filterRadius,
  },

  dropdownButtonText: {
    color: "#000000",

    fontWeight: "600",

    flexShrink: 1,
  },

  dropdown: {
    position: "absolute",

    top:
      notificationDimensions.filterHeight + 6,

    left: 0,

    right: 0,

    backgroundColor: "#FFFFFF",

    borderWidth: 2,

    borderColor: Colors.light.primary,

    borderRadius:
      notificationDimensions.dropdownRadius,

    paddingVertical: 5,

    zIndex: 200,

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
      notificationDimensions.dropdownItemHeight,

    flexDirection: "row",

    alignItems: "center",

    gap: 8,

    paddingHorizontal: 13,
  },

  dropdownItemText: {
    color: "#000000",

    fontWeight: "500",
  },

  selectedDropdownText: {
    color: Colors.light.primary,

    fontWeight: "700",
  },

  /* Mark as Read */

  markReadButton: {
    minHeight:
      notificationDimensions.filterHeight,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 5,

    paddingHorizontal: 12,

    backgroundColor: "#2196F3",

    borderRadius:
      notificationDimensions.buttonRadius,
  },

  markReadText: {
    color: "#FFFFFF",

    fontWeight: "700",
  },

  /* Sections */

  section: {
    width: "100%",
  },

  earlierSection: {
    marginTop: 20,
  },

  sectionTitle: {
    color: "#000000",

    fontWeight: "700",

    marginBottom: 10,
  },

  /* Notification List */

  notificationList: {
    width: "100%",

    gap: 12,
  },

  /* Empty State */

  emptyState: {
    alignItems: "center",

    justifyContent: "center",

    paddingVertical: 40,

    gap: 8,
  },

  emptyStateText: {
    color: Colors.light.textSecondary,

    textAlign: "center",
  },

  /* Pagination */

  pagination: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 6,

    marginTop: 22,

    marginBottom: 8,
  },

  pageButton: {
    width: 36,

    height: 36,

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 2,

    borderColor: Colors.light.primary,

    borderRadius: 10,

    backgroundColor:
      Colors.glass.white,
  },

  disabledPageButton: {
    borderColor:
      Colors.light.textSecondary,

    opacity: 0.45,
  },

  pageNumber: {
    width: 36,

    height: 36,

    alignItems: "center",

    justifyContent: "center",

    borderRadius: 10,
  },

  activePageNumber: {
    backgroundColor: Colors.light.primary,
  },

  pageNumberText: {
    color: Colors.light.primary,

    fontWeight: "600",
  },

  activePageNumberText: {
    color: "#FFFFFF",

    fontWeight: "700",
  },
});