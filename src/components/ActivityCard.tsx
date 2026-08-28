import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import React, { useEffect, useState } from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import AppText from "@/components/ui/AppText";

import { Colors } from "@/constants/colors";
import { Routes } from "@/constants/routes";
import { supabase } from "@/lib/supabase";

type ActivityType =
  | "info"
  | "warning"
  | "error"
  | "critical";

type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  details: string;
  date: string;
  time: string;
};

export default function ActivityCard() {
  const [activities, setActivities] =
    useState<Activity[]>([]);

  useEffect(() => {
    const loadRecentActivities = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setActivities([]);
        return;
      }

      const { data, error } = await supabase
        .from("activity_logs")
        .select(
          "act_id, title, description, type, created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(5);

      if (error) {
        console.error(
          "Error loading recent activities:",
          error.message,
        );
        setActivities([]);
        return;
      }

      const mappedActivities: Activity[] = (
        data ?? []
      ).map((activity) => {
        const dateObject = new Date(
          activity.created_at,
        );

        const type: ActivityType =
          activity.type === "warning" ||
          activity.type === "error" ||
          activity.type === "critical"
            ? activity.type
            : "info";

        return {
          id: activity.act_id,
          type,
          title: activity.title,
          details: activity.description,
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
        };
      });

      setActivities(mappedActivities);
    };

    loadRecentActivities();
  }, []);

  const getActivityIcon = (
    type: ActivityType,
  ): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "info":
        return "information-circle-outline";

      case "warning":
        return "warning-outline";

      case "error":
      case "critical":
        return "alert-circle-outline";

      default:
        return "information-circle-outline";
    }
  };

  const getActivityColor = (
    type: ActivityType,
  ) => {
    switch (type) {
      case "info":
        return Colors.light.primary;

      case "warning":
        return Colors.light.secondary;

      case "error":
      case "critical":
        return Colors.light.error;

      default:
        return Colors.light.primary;
    }
  };

  return (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <AppText
          variant="body"
          style={styles.title}
        >
          Recent Activity
        </AppText>

        <Pressable
          onPress={() =>
            router.push(Routes.ACTIVITY_LOGS)
          }
        >
          <AppText
            variant="caption"
            style={styles.viewAll}
          >
            View All
          </AppText>
        </Pressable>
      </View>

      {/* Activity List */}
      <View style={styles.list}>
        {activities.map((activity) => {
          const color = getActivityColor(
            activity.type,
          );

          return (
            <View
              key={activity.id}
              style={styles.item}
            >
              {/* Activity Icon */}
              <Ionicons
                name={getActivityIcon(
                  activity.type,
                )}
                size={24}
                color={color}
              />

              {/* Activity Content */}
              <View style={styles.content}>
                <AppText
                  variant="caption"
                  style={styles.activityTitle}
                >
                  {activity.title}
                </AppText>

                <AppText
                  variant="caption"
                  style={styles.details}
                >
                  {activity.details}
                </AppText>

                <AppText
                  variant="caption"
                  style={styles.timestamp}
                >
                  {activity.date} •{" "}
                  {activity.time}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: "#000000",
    fontWeight: "700",
    marginBottom: 10,
  },

  viewAll: {
    color: "#FFFFFF",
    fontWeight: "700",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 12,
    marginTop: -14,
    marginRight: 2,
  },

  list: {
    width: "100%",
    gap: 5,
  },

  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.glass.white,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 16,
    padding: 12,
  },

  content: {
    flex: 1,
    marginLeft: 10,
  },

  activityTitle: {
    color: "#000000",
    fontWeight: "700",
  },

  details: {
    color: Colors.light.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },

  timestamp: {
    color: Colors.light.textSecondary,
    marginTop: 5,
    fontSize: 11,
  },
});