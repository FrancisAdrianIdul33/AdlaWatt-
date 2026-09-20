import AnalyticsCards from "@/components/AnalyticsCard";
import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";
import {
  AnalyticsRange,
  ApplianceUsageHistoryRow,
  ChartFrequency,
  ChartPoint,
  FREQUENCIES,
  MonitoringHistoryRow,
  REPORT_FREQUENCIES,
  ReportFrequency,
  ReportType,
  createAnalyticsReportContent,
  getApplianceChartData,
  getBatteryChartData,
  getBatteryTemperatureData,
  getChartLimits,
  getDefaultRange,
  getEnergyInputChartData,
  getEnergyOutputChartData,
  getSolarChartData,
  getSolarTemperatureData,
  groupMonitoringHistory,
  loadAnalyticsData,
  downloadCsvOnWeb,
  downloadPdfOnWeb,
  generateAdlaWattCsv,
  generateAdlaWattPdf,
  prepareReportData,
} from "@/services/analyticsService";
import { Ionicons } from "@expo/vector-icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";

/* ============================================================
   SCREEN
   ============================================================ */

export default function AnalyticsScreen() {
  const [
    monitoringHistory,
    setMonitoringHistory,
  ] = useState<MonitoringHistoryRow[]>([]);

  const [
    applianceUsageHistory,
    setApplianceUsageHistory,
  ] = useState<ApplianceUsageHistoryRow[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    chartFrequency,
    setChartFrequency,
  ] = useState<ChartFrequency>(
    "Daily",
  );

  const [
    reportFrequency,
    setReportFrequency,
  ] = useState<ReportFrequency>(
    "Daily",
  );

  const [
    reportModalVisible,
    setReportModalVisible,
  ] = useState(false);

  const [
    frequencyModalVisible,
    setFrequencyModalVisible,
  ] = useState(false);

  const [
    range,
    setRange,
  ] = useState<AnalyticsRange>(
    getDefaultRange(),
  );

  const loadAnalytics =
    useCallback(
      async () => {
        setLoading(true);

        const {
          monitoringHistory:
          monitoringRows,
          applianceUsageHistory:
          applianceRows,
        } = await loadAnalyticsData(
          range,
        );

        setMonitoringHistory(
          monitoringRows,
        );

        setApplianceUsageHistory(
          applianceRows,
        );

        setLoading(false);
      },
      [
        range.start,
        range.end,
      ],
    );

  useEffect(() => {
    loadAnalytics();
  }, [
    loadAnalytics,
  ]);

  /* ==========================================================
     GROUP MONITORING HISTORY
     ========================================================== */

  const groupedMonitoring =
    useMemo(
      () =>
        groupMonitoringHistory(
          monitoringHistory,
          chartFrequency,
        ),
      [
        monitoringHistory,
        chartFrequency,
      ],
    );

  /* ==========================================================
     BATTERY CHART
     ========================================================== */

  const batteryChartData =
    useMemo(
      (): ChartPoint[] =>
        getBatteryChartData(
          groupedMonitoring,
          chartFrequency,
        ),
      [
        groupedMonitoring,
        chartFrequency,
      ],
    );

  /* ==========================================================
     SOLAR CHART
     ========================================================== */

  const solarChartData =
    useMemo(
      (): ChartPoint[] =>
        getSolarChartData(
          groupedMonitoring,
          chartFrequency,
        ),
      [
        groupedMonitoring,
        chartFrequency,
      ],
    );

  /* ==========================================================
     ENERGY CHARTS
     ========================================================== */

  const energyInputChartData =
    useMemo(
      (): ChartPoint[] =>
        getEnergyInputChartData(
          groupedMonitoring,
          chartFrequency,
        ),
      [
        groupedMonitoring,
        chartFrequency,
      ],
    );

  const energyOutputChartData =
    useMemo(
      (): ChartPoint[] =>
        getEnergyOutputChartData(
          groupedMonitoring,
          chartFrequency,
        ),
      [
        groupedMonitoring,
        chartFrequency,
      ],
    );

  /* ==========================================================
     TEMPERATURE CHARTS
     ========================================================== */

  const batteryTemperatureData =
    useMemo(
      (): ChartPoint[] =>
        getBatteryTemperatureData(
          groupedMonitoring,
          chartFrequency,
        ),
      [
        groupedMonitoring,
        chartFrequency,
      ],
    );

  const solarTemperatureData =
    useMemo(
      (): ChartPoint[] =>
        getSolarTemperatureData(
          groupedMonitoring,
          chartFrequency,
        ),
      [
        groupedMonitoring,
        chartFrequency,
      ],
    );

  /* ==========================================================
     APPLIANCE DATA
     ========================================================== */

  const applianceChartData =
    useMemo(
      () =>
        getApplianceChartData(
          applianceUsageHistory,
        ),
      [
        applianceUsageHistory,
      ],
    );

  /* ==========================================================
   REPORT
   ========================================================== */

  const generateReport =
    useCallback(
      async (
        reportType: ReportType,
      ) => {
        if (
          monitoringHistory.length ===
          0 &&
          applianceUsageHistory.length ===
          0
        ) {
          Alert.alert(
            "No Data",
            "There is no historical analytics data available for the selected date range.",
          );

          return;
        }

        /* ======================================================
           WEB EXPORT
           ====================================================== */

        if (
          Platform.OS === "web"
        ) {
          try {
            const reportData =
              prepareReportData(
                monitoringHistory,
                applianceUsageHistory,
                reportFrequency,
                range,
              );

            if (
              reportType === "CSV"
            ) {
              const csv =
                generateAdlaWattCsv(
                  reportData,
                );

              const filename =
                `adlawatt_${reportFrequency.toLowerCase()}_report_${new Date()
                  .toISOString()
                  .slice(0, 10)}.csv`;

              downloadCsvOnWeb(
                csv,
                filename,
              );

              return;
            }

            const pdf =
              await generateAdlaWattPdf(
                reportData,
              );

            const filename =
              `adlawatt_${reportFrequency.toLowerCase()}_report_${new Date()
                .toISOString()
                .slice(0, 10)}.pdf`;

            downloadPdfOnWeb(
              pdf,
              filename,
            );

            return;
          } catch (error) {
            console.error(
              "Web report export error:",
              error,
            );

            Alert.alert(
              "Export Error",
              "The report could not be generated.",
            );

            return;
          }
        }

        /* ======================================================
           NATIVE ANDROID / IOS EXPORT
           ====================================================== */

        const {
          reportHeader,
          reportContent,
        } =
          createAnalyticsReportContent(
            monitoringHistory,
            applianceUsageHistory,
            reportFrequency,
            range,
          );

        if (
          reportType === "CSV"
        ) {
          await Share.share({
            message:
              reportContent,

            title:
              "AdlaWatt Analytics CSV Report",
          });

          return;
        }

        await Share.share({
          message: [
            reportHeader,
            "",
            "PDF export preparation",
            "",
            `Monitoring records: ${monitoringHistory.length}`,
            `Appliance usage records: ${applianceUsageHistory.length}`,
            "",
            "This report contains the selected historical analytics data.",
          ].join("\n"),

          title:
            "AdlaWatt Analytics Report",
        });
      },
      [
        monitoringHistory,
        applianceUsageHistory,
        reportFrequency,
        range,
      ],
    );

  /* ==========================================================
     DATE RANGE
     ========================================================== */

  /*
   * Custom date selection.
   *
   * The To date can never go beyond today, and From is always
   * kept on or before To so the range stays valid.
   */

  const setFromDate =
    useCallback(
      (
        date: Date,
      ) => {
        setRange(
          (currentRange) => {
            const today =
              new Date();

            const from =
              new Date(
                Math.min(
                  date.getTime(),
                  today.getTime(),
                ),
              );

            const end =
              from.getTime() >
              currentRange.end.getTime()
                ? from
                : currentRange.end;

            return {
              start: from,
              end,
            };
          },
        );
      },
      [],
    );

  const setToDate =
    useCallback(
      (
        date: Date,
      ) => {
        setRange(
          (currentRange) => {
            const today =
              new Date();

            const to =
              new Date(
                Math.min(
                  date.getTime(),
                  today.getTime(),
                ),
              );

            const end =
              to.getTime() <
              currentRange.start.getTime()
                ? currentRange.start
                : to;

            return {
              start:
                currentRange.start,
              end,
            };
          },
        );
      },
      [],
    );

  /* ==========================================================
     CHART LIMITS
     ========================================================== */

  const {
    solarMax,
    energyInputMax,
    temperatureMax,
  } = useMemo(
    () =>
      getChartLimits(
        solarChartData,
        energyInputChartData,
        energyOutputChartData,
        batteryTemperatureData,
        solarTemperatureData,
      ),
    [
      solarChartData,
      energyInputChartData,
      energyOutputChartData,
      batteryTemperatureData,
      solarTemperatureData,
    ],
  );

  return (
    <ScreenContainer2>
      {/* Fixed Navbar */}
      <NavBar />

      <ScrollView
        style={
          styles.scrollView
        }
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ======================================================
            ANALYTICS HEADER
            Kept unchanged from the previous Analytics header.
        ====================================================== */}
        <View
          style={
            styles.headerCard
          }
        >
          <AppText
            variant="heading"
            style={
              styles.headerTitle
            }
          >
            Analytics
          </AppText>

          <AppText
            variant="caption"
            style={
              styles.headerSubtitle
            }
          >
            Analyze system performance,
            energy usage, temperature,
            and appliance data over time.
          </AppText>
        </View>

        {/* ======================================================
            ANALYTICS CARDS
            Card layouts and card-related styles are handled by
            AnalyticsCard.tsx.
        ====================================================== */}
        <AnalyticsCards
          chartFrequency={
            chartFrequency
          }
          setChartFrequency={
            setChartFrequency
          }
          reportFrequency={
            reportFrequency
          }
          setReportFrequency={
            setReportFrequency
          }
          setReportModalVisible={
            setReportModalVisible
          }
          setFrequencyModalVisible={
            setFrequencyModalVisible
          }
          range={range}
          onFromDateChange={
            setFromDate
          }
          onToDateChange={
            setToDate
          }
          generateReport={
            generateReport
          }
          loading={loading}
          batteryChartData={
            batteryChartData
          }
          solarChartData={
            solarChartData
          }
          energyInputChartData={
            energyInputChartData
          }
          energyOutputChartData={
            energyOutputChartData
          }
          batteryTemperatureData={
            batteryTemperatureData
          }
          solarTemperatureData={
            solarTemperatureData
          }
          applianceChartData={
            applianceChartData
          }
          solarMax={
            solarMax
          }
          energyInputMax={
            energyInputMax
          }
          temperatureMax={
            temperatureMax
          }
        />

        {/* Copyright */}
        <Copyright />
      </ScrollView>

      {/* ========================================================
          FREQUENCY MODAL
      ======================================================== */}
      <Modal
        visible={
          frequencyModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setFrequencyModalVisible(
            false,
          )
        }
      >
        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setFrequencyModalVisible(
              false,
            )
          }
        >
          <Pressable
            style={
              styles.modalCard
            }
            onPress={() => { }}
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <AppText
                variant="body"
                style={
                  styles.modalTitle
                }
              >
                Chart Frequency
              </AppText>

              <Pressable
                onPress={() =>
                  setFrequencyModalVisible(
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

            {FREQUENCIES.map(
              (option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.modalOption,
                    chartFrequency ===
                    option &&
                    styles.selectedModalOption,
                  ]}
                  onPress={() => {
                    setChartFrequency(
                      option,
                    );
                    setFrequencyModalVisible(
                      false,
                    );
                  }}
                >
                  <Ionicons
                    name={
                      chartFrequency ===
                        option
                        ? "radio-button-on-outline"
                        : "radio-button-off-outline"
                    }
                    size={18}
                    color={
                      Colors.light.primary
                    }
                  />

                  <AppText
                    variant="caption"
                    style={[
                      styles.modalOptionText,
                      chartFrequency ===
                      option &&
                      styles.selectedModalOptionText,
                    ]}
                  >
                    {option}
                  </AppText>
                </Pressable>
              ),
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ========================================================
          REPORT FREQUENCY MODAL
      ======================================================== */}
      <Modal
        visible={
          reportModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setReportModalVisible(
            false,
          )
        }
      >
        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setReportModalVisible(
              false,
            )
          }
        >
          <Pressable
            style={
              styles.modalCard
            }
            onPress={() => { }}
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <AppText
                variant="body"
                style={
                  styles.modalTitle
                }
              >
                Report Frequency
              </AppText>

              <Pressable
                onPress={() =>
                  setReportModalVisible(
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

            {REPORT_FREQUENCIES.map(
              (option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.modalOption,
                    reportFrequency ===
                    option &&
                    styles.selectedModalOption,
                  ]}
                  onPress={() => {
                    setReportFrequency(
                      option,
                    );
                    setReportModalVisible(
                      false,
                    );
                  }}
                >
                  <Ionicons
                    name={
                      reportFrequency ===
                        option
                        ? "radio-button-on-outline"
                        : "radio-button-off-outline"
                    }
                    size={18}
                    color={
                      Colors.light.primary
                    }
                    
                  />

                  <AppText
                    variant="caption"
                    style={[
                      styles.modalOptionText,
                      reportFrequency ===
                      option &&
                      styles.selectedModalOptionText,
                    ]}
                  >
                    {option}
                  </AppText>
                </Pressable>
              ),
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer2>
  );
}

/* ============================================================
   DIMENSIONS
   ============================================================ */

const analyticsDimensions = {
  horizontalPadding: 14,
  sectionSpacing: 18,

  /*
   * These values are intentionally preserved
   * from the previous Analytics header.
   */

  headerRadius: 16,
  headerBorderWidth: 3,
  contentBottomPadding: 24,
  modalRadius: 18,
};

/* ============================================================
   STYLES
   ============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       MAIN SCREEN
    ======================================================== */

    scrollView: {
      flex: 1,
      backgroundColor:
        Colors.light.background,
    },

    content: {
      paddingHorizontal:
        analyticsDimensions.horizontalPadding,
      paddingTop:
        analyticsDimensions.sectionSpacing,
      paddingBottom:
        analyticsDimensions.contentBottomPadding,
    },

    /* ========================================================
       ANALYTICS HEADER
       EXACT PREVIOUS HEADER STYLE
    ======================================================== */

    headerCard: {
      backgroundColor:
        Colors.glass.white,
      borderWidth:
        analyticsDimensions.headerBorderWidth,
      borderColor:
        Colors.light.secondary,
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
      color:
        Colors.light.textSecondary,
      marginTop: 6,
      lineHeight: 20,
    },

    /* ========================================================
       MODALS
    ======================================================== */

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0, 0, 0, 0.40)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },

    modalCard: {
      width: "100%",
      maxWidth: 420,
      backgroundColor:
        "#FFFFFF",
      borderRadius:
        analyticsDimensions.modalRadius,
      padding: 17,
    },

    modalHeader: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 8,
    },

    modalTitle: {
      color: "#000000",
      fontWeight: "700",
      fontSize: 17,
    },

    modalOption: {
      width: "100%",
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 10,
      borderRadius: 10,
    },

    selectedModalOption: {
      backgroundColor:
        "rgba(0, 168, 107, 0.08)",
    },

    modalOptionText: {
      color: "#000000",
    },

    selectedModalOptionText: {
      fontWeight: "700",
      color:
        Colors.light.primary,
    },
  });