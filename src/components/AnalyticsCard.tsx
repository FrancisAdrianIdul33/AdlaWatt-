import React, {
  useState,
} from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/ui/AppText";
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

/*
 * @react-native-community/datetimepicker is a native-only
 * module. It is loaded lazily and only on Android/iOS so the
 * web bundle never executes the native bridge code.
 */
declare const require: (
  id: string,
) => any;

const NativeDateTimePicker =
  Platform.OS === "web"
    ? null
    : (
        require(
          "@react-native-community/datetimepicker",
        ) as {
          default: any;
        }
      ).default;

/*
 * The project does not include the DOM lib, so React's typed
 * DOM element helpers cannot be used directly on web.
 */
const createElementLoose =
  React.createElement as unknown as (
    type: any,
    props: any,
  ) => any;

function toInputDate(
  date: Date,
): string {
  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1,
    ).padStart(2, "0"),
    String(
      date.getDate(),
    ).padStart(2, "0"),
  ].join("-");
}

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
    pickerVisible,
    setPickerVisible,
  ] = useState(false);

  const [
    calendarVisible,
    setCalendarVisible,
  ] = useState(false);

  const today =
    new Date();

  /* --------------------------------------------------
     WEB FALLBACK
     Uses the browser's native date input.
     -------------------------------------------------- */

  if (
    Platform.OS === "web"
  ) {
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

        <View
          style={
            styles.dateFieldBox
          }
        >
          {createElementLoose(
            "input",
            {
              type: "date",
              value:
                toInputDate(value),
              max:
                toInputDate(today),
              onChange: (
                event: any,
              ) => {
                const picked =
                  new Date(
                    event
                      .target
                      .value +
                      "T00:00:00",
                  );

                if (
                  !Number.isNaN(
                    picked.getTime(),
                  )
                ) {
                  onChange(picked);
                }
              },
            },
          )}
        </View>
      </View>
    );
  }

  /* --------------------------------------------------
     IOS
     Inline calendar inside a modal.
     -------------------------------------------------- */

  if (
    Platform.OS === "ios"
  ) {
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
            setCalendarVisible(
              true,
            )
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
            color={
              Colors.light.primary
            }
          />
        </Pressable>

        <Modal
          visible={calendarVisible}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setCalendarVisible(
              false,
            )
          }
        >
          <Pressable
            style={
              styles.dateModalOverlay
            }
            onPress={() =>
              setCalendarVisible(
                false,
              )
            }
          >
            <Pressable
              style={
                styles.dateModalCard
              }
              onPress={() => {}}
            >
              <View
                style={
                  styles.dateModalHeader
                }
              >
                <AppText
                  variant="body"
                  style={
                    styles.dateModalTitle
                  }
                >
                  {label}
                </AppText>

                <Pressable
                  onPress={() =>
                    setCalendarVisible(
                      false,
                    )
                  }
                >
                  <Ionicons
                    name="close-outline"
                    size={22}
                    color="#000000"
                  />
                </Pressable>
              </View>

              <NativeDateTimePicker
                value={value}
                mode="date"
                display="inline"
                maximumDate={today}
                accentColor={
                  Colors.light.primary
                }
                onChange={(
                  event: any,
                  date:
                    | Date
                    | undefined,
                ) => {
                  if (
                    event.type ===
                      "set" &&
                    date
                  ) {
                    onChange(date);
                  }
                }}
              />

              <Pressable
                style={
                  styles.dateModalDoneButton
                }
                onPress={() =>
                  setCalendarVisible(
                    false,
                  )
                }
              >
                <AppText
                  variant="caption"
                  style={
                    styles.dateModalDoneText
                  }
                >
                  Done
                </AppText>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  }

  /* --------------------------------------------------
     ANDROID
     System date dialog.
     -------------------------------------------------- */

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
          setPickerVisible(true)
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
          color={
            Colors.light.primary
          }
        />
      </Pressable>

      {pickerVisible && (
        <NativeDateTimePicker
          value={value}
          mode="date"
          maximumDate={today}
          accentColor={
            Colors.light.primary
          }
          onChange={(
            event: any,
            date:
              | Date
              | undefined,
          ) => {
            setPickerVisible(
              false,
            );

            if (
              event.type ===
                "set" &&
              date
            ) {
              onChange(date);
            }
          }}
        />
      )}
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
      ====================================================== */}

      <View
        style={
          styles.reportCard
        }
      >
        <View
          style={
            styles.reportIconContainer
          }
        >
          <Ionicons
            name="document-text-outline"
            size={22}
            color={
              Colors.light.primary
            }
          />
        </View>

        <View
          style={
            styles.reportContent
          }
        >
          <AppText
            variant="body"
            style={
              styles.reportTitle
            }
          >
            Generate Report
          </AppText>

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

    reportIconContainer: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(0, 168, 107, 0.10)",
    },

    reportContent: {
      flex: 1,
    },

    reportTitle: {
      color: "#000000",
      fontWeight: "700",
      fontSize: 17,
    },

    reportSubtitle: {
      color:
        Colors.light.textSecondary,
      marginTop: 4,
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

    dateFieldText: {
      color: "#000000",
      fontWeight: "600",
    },

    dateFieldBox: {
      width: "100%",
      minHeight: 42,
      borderWidth: 2,
      borderColor:
        Colors.light.primary,
      borderRadius: 12,
      paddingHorizontal: 10,
      justifyContent: "center",
    },

    dateModalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0, 0, 0, 0.40)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },

    dateModalCard: {
      width: "100%",
      maxWidth: 420,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      padding: 16,
    },

    dateModalHeader: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 10,
    },

    dateModalTitle: {
      color: "#000000",
      fontWeight: "700",
      fontSize: 16,
    },

    dateModalDoneButton: {
      width: "100%",
      minHeight: 44,
      marginTop: 14,
      backgroundColor:
        Colors.light.primary,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },

    dateModalDoneText: {
      color: "#FFFFFF",
      fontWeight: "700",
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