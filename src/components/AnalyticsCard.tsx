import React, {
  useState,
} from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/ui/AppText";
import {
  CalendarModal,
} from "@/components/ui/CalendarModal";
import { Colors } from "@/constants/colors";
import {
  AnalyticsRange,
  ReportFrequency,
  ReportType,
  formatReportDate,
} from "@/services/analyticsService";

/* ============================================================
   DATE PICKER
   ============================================================ */

interface DatePickerFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

function DatePickerField({
  label,
  value,
  onChange,
}: DatePickerFieldProps) {
  const [
    calendarVisible,
    setCalendarVisible,
  ] = useState(false);

  return (
    <View
      style={
        styles.reportControl
      }
    >
      <AppText
        variant="caption"
        style={
          styles.reportControlLabel
        }
      >
        {label}
      </AppText>

      <Pressable
        style={({ pressed }) => [
          styles.dateFieldButton,
          pressed &&
            styles.buttonPressed,
        ]}
        onPress={() =>
          setCalendarVisible(true)
        }
      >
        <AppText
          variant="caption"
          style={
            styles.dateFieldText
          }
        >
          {formatReportDate(value)}
        </AppText>

        <Ionicons
          name="calendar-outline"
          size={16}
          color={Colors.light.primary}
        />
      </Pressable>

      <CalendarModal
        visible={calendarVisible}
        title={label}
        value={value}
        maximumDate={new Date()}
        onChange={onChange}
        onClose={() =>
          setCalendarVisible(false)
        }
      />
    </View>
  );
}

/* ============================================================
   PROPS
   ============================================================ */

export interface AnalyticsCardsProps {
  reportFrequency: ReportFrequency;
  setReportModalVisible: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  range: AnalyticsRange;
  onFromDateChange: (date: Date) => void;
  onToDateChange: (date: Date) => void;
  generateReport: (
    reportType: ReportType,
  ) => Promise<void>;
  loading: boolean;
}

/* ============================================================
   ANALYTICS PANEL
   ============================================================ */

export default function AnalyticsCards({
  reportFrequency,
  setReportModalVisible,
  range,
  onFromDateChange,
  onToDateChange,
  generateReport,
  loading,
}: AnalyticsCardsProps) {
  return (
    <>
      {/* ======================================================
          PLACEHOLDER
          Chart visuals are temporarily removed. The database
          connection still loads the history used by reports.
      ====================================================== */}

      <View
        style={
          styles.placeholderCard
        }
      >
        <Ionicons
          name="bar-chart-outline"
          size={34}
          color="#FACC15"
        />

        <View
          style={
            styles.placeholderContent
          }
        >
          <AppText
            variant="body"
            style={
              styles.placeholderTitle
            }
          >
            Analytics Coming Soon
          </AppText>

          <AppText
            variant="caption"
            style={
              styles.placeholderMessage
            }
          >
            Graphs and charts are temporarily disabled while
            the app is being optimized. Historical data is
            still being loaded so report exports keep working.
          </AppText>
        </View>
      </View>

      {/* ======================================================
          GENERATE REPORT
          Follows the ChartCard grouped-card layout: a solid
          primary header accent panel over the body content.
      ====================================================== */}

      <View
        style={
          styles.reportCard
        }
      >
        {/* Header / Accent Panel */}
        <View
          style={
            styles.reportHeaderPanel
          }
        >
          <Ionicons
            name="document-text-outline"
            size={30}
            color="#FACC15"
          />

          <AppText
            variant="heading"
            style={
              styles.reportHeaderTitle
            }
          >
            Generate Report
          </AppText>
        </View>

        {/* Body */}
        <View
          style={
            styles.reportBody
          }
        >
          <AppText
            variant="caption"
            style={
              styles.reportSubtitle
            }
          >
            Choose a frequency and pick a custom from/to date range
            for the report export.
          </AppText>

          <View
            style={
              styles.reportControls
            }
          >
            <View
              style={
                styles.reportControl
              }
            >
              <AppText
                variant="caption"
                style={
                  styles.reportControlLabel
                }
              >
                Frequency
              </AppText>

              <Pressable
                style={({ pressed }) => [
                  styles.reportSelect,
                  pressed &&
                    styles.buttonPressed,
                ]}
                onPress={() =>
                  setReportModalVisible(
                    true,
                  )
                }
              >
                <AppText
                  variant="caption"
                  style={
                    styles.reportSelectText
                  }
                >
                  {reportFrequency}
                </AppText>

                <Ionicons
                  name="chevron-down-outline"
                  size={15}
                  color={
                    Colors.light.primary
                  }
                />
              </Pressable>
            </View>

            <DatePickerField
              label="From Date"
              value={range.start}
              onChange={
                onFromDateChange
              }
            />

            <DatePickerField
              label="To Date"
              value={range.end}
              onChange={
                onToDateChange
              }
            />
          </View>

          <View
            style={
              styles.exportRow
            }
          >
            <Pressable
              style={({ pressed }) => [
                styles.exportPrimaryButton,
                pressed &&
                  styles.buttonPressed,
              ]}
              onPress={() =>
                generateReport(
                  "CSV",
                )
              }
            >
              <Ionicons
                name="download-outline"
                size={17}
                color="#FFFFFF"
              />

              <AppText
                variant="caption"
                style={
                  styles.exportPrimaryText
                }
              >
                Export CSV
              </AppText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.exportPrimaryButton,
                pressed &&
                  styles.buttonPressed,
              ]}
              onPress={() =>
                generateReport(
                  "PDF",
                )
              }
            >
              <Ionicons
                name="document-outline"
                size={17}
                color="#FFFFFF"
              />

              <AppText
                variant="caption"
                style={
                  styles.exportPrimaryText
                }
              >
                Export PDF
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ======================================================
          LOADING STATE
      ====================================================== */}

      {loading && (
        <View
          style={
            styles.loadingContainer
          }
        >
          <Ionicons
            name="sync-outline"
            size={18}
            color={
              Colors.light.primary
            }
          />

          <AppText
            variant="caption"
            style={
              styles.loadingText
            }
          >
            Loading analytics...
          </AppText>
        </View>
      )}
    </>
  );
}

/* ============================================================
   DIMENSIONS
   ============================================================ */

export const analyticsDimensions = {
  sectionSpacing: 18,
  cardRadius: 16,
  cardBorderWidth: 2,
};

/* ============================================================
   STYLES
   ============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       PLACEHOLDER
    ======================================================== */

    placeholderCard: {
      width: "100%",
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor:
        Colors.glass.white,
      borderWidth: 3,
      borderColor:
        Colors.light.primary,
      borderRadius: 15,
      padding: 16,
      marginBottom:
        analyticsDimensions.sectionSpacing,
      gap: 12,
    },

    placeholderContent: {
      flex: 1,
    },

    placeholderTitle: {
      color: "#000000",
      fontWeight: "700",
      fontSize: 17,
    },

    placeholderMessage: {
      color:
        Colors.light.textSecondary,
      marginTop: 4,
      lineHeight: 19,
    },

    buttonPressed: {
      opacity: 0.72,
    },

    /* ========================================================
       REPORT CARD
    ======================================================== */

    reportCard: {
      width: "100%",
      backgroundColor:
        Colors.glass.white,
      borderWidth: 3,
      borderColor:
        Colors.light.primary,
      borderRadius: 15,
      flexDirection: "column",
      alignItems: "stretch",
      overflow: "hidden",
      marginBottom:
        analyticsDimensions.sectionSpacing,
    },

    reportHeaderPanel: {
      width: "100%",
      backgroundColor:
        Colors.light.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "flex-start",
      paddingHorizontal: 14,
      paddingVertical: 9,
    },

    reportHeaderTitle: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
      flexShrink: 1,
    },

    reportBody: {
      padding: 16,
    },

    reportSubtitle: {
      color:
        Colors.light.textSecondary,
      lineHeight: 19,
    },

    reportControls: {
      width: "100%",
      marginTop: 14,
      gap: 10,
    },

    reportControl: {
      width: "100%",
    },

    reportControlLabel: {
      color:
        Colors.light.textSecondary,
      fontWeight: "600",
      marginBottom: 5,
    },

    reportSelect: {
      width: "100%",
      minHeight: 42,
      borderWidth: 2,
      borderColor:
        Colors.light.primary,
      borderRadius: 12,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    reportSelectText: {
      color: "#000000",
      fontWeight: "600",
    },

    dateFieldButton: {
      width: "100%",
      minHeight: 42,
      backgroundColor:
        "rgba(0, 168, 107, 0.06)",
      borderWidth: 1,
      borderColor:
        Colors.light.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    dateFieldText: {
      color: "#000000",
      fontWeight: "600",
    },

    exportRow: {
      width: "100%",
      flexDirection: "row",
      gap: 9,
      marginTop: 13,
    },

    exportPrimaryButton: {
      flex: 1,
      minHeight: 44,
      backgroundColor:
        Colors.light.primary,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 7,
      paddingHorizontal: 10,
    },

    exportPrimaryText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      width: "100%",
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      marginBottom: 10,
    },

    loadingText: {
      color:
        Colors.light.textSecondary,
    },
  });