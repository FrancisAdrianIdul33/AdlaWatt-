import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";

import {
  BarChart,
  LineChart,
} from "react-native-gifted-charts";

import { Ionicons } from "@expo/vector-icons";

import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import Sidebar from "@/components/layout/Sidebar";
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
  clamp,
  createAnalyticsReportContent,
  createPresetRange,
  formatDuration,
  formatNumber,
  getApplianceChartData,
  getBatteryChartData,
  getBatteryTemperatureData,
  getChartLimits,
  getEnergyInputChartData,
  getEnergyOutputChartData,
  getSolarChartData,
  getSolarTemperatureData,
  getDefaultRange,
  groupMonitoringHistory,
  loadAnalyticsData,
  formatReportDate,
} from "@/services/analyticsService";

/* ============================================================
   CHART DIMENSIONS
   ============================================================ */

const SCREEN_WIDTH =
  Dimensions.get("window").width;

const CHART_WIDTH =
  Math.max(250, SCREEN_WIDTH - 70);

const CHART_HEIGHT = 220;

/* ============================================================
   SCREEN
   ============================================================ */

export default function AnalyticsScreen() {
  const [
    sidebarVisible,
    setSidebarVisible,
  ] = useState(false);

  const [
    monitoringHistory,
    setMonitoringHistory,
  ] = useState<
    MonitoringHistoryRow[]
  >([]);

  const [
    applianceUsageHistory,
    setApplianceUsageHistory,
  ] = useState<
    ApplianceUsageHistoryRow[]
  >([]);

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
        } =
          await loadAnalyticsData(
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
          message:
            [
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
        range.start,
        range.end,
      ],
    );

  /* ==========================================================
     DATE RANGE
     ========================================================== */

  const applyPresetRange =
    useCallback(
      (
        days: number,
      ) => {
        setRange(
          createPresetRange(
            days,
          ),
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
  } =
    useMemo(
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
      <NavBar
        onMenuPress={() =>
          setSidebarVisible(
            true,
          )
        }
      />

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
            GLOBAL CHART FREQUENCY
        ====================================================== */}

        <View
          style={
            styles.frequencySection
          }
        >
          <View
            style={
              styles.frequencyHeader
            }
          >
            <View
              style={
                styles.frequencyHeaderText
              }
            >
              <AppText
                variant="body"
                style={
                  styles.sectionTitle
                }
              >
                Historical Trends
              </AppText>

              <AppText
                variant="caption"
                style={
                  styles.sectionSubtitle
                }
              >
                Select how historical
                monitoring data is grouped.
              </AppText>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.frequencyButton,
                pressed &&
                styles.buttonPressed,
              ]}
              onPress={() =>
                setFrequencyModalVisible(
                  true,
                )
              }
            >
              <Ionicons
                name="calendar-outline"
                size={17}
                color={
                  Colors.light.primary
                }
              />

              <AppText
                variant="caption"
                style={
                  styles.frequencyButtonText
                }
              >
                {chartFrequency}
              </AppText>

              <Ionicons
                name="chevron-down-outline"
                size={16}
                color={
                  Colors.light.primary
                }
              />
            </Pressable>
          </View>
        </View>

        {/* ======================================================
            BATTERY PERFORMANCE
        ====================================================== */}

        <AnalyticsCard
          title="Battery Performance"
          subtitle="Historical battery level percentage."
          icon="battery-half-outline"
        >
          {batteryChartData.length >
            0 ? (
            <LineChart
              data={
                batteryChartData
              }
              width={
                CHART_WIDTH
              }
              height={
                CHART_HEIGHT
              }
              maxValue={100}
              noOfSections={5}
              initialSpacing={8}
              spacing={38}
              thickness={3}
              hideRules
              yAxisThickness={0}
              xAxisThickness={1}
              yAxisTextStyle={
                styles.chartAxisText
              }
              xAxisLabelTextStyle={
                styles.chartAxisText
              }
              dataPointsColor={
                Colors.light.primary
              }
              color={
                Colors.light.primary
              }
            />
          ) : (
            <EmptyChartState
              message="No battery history is available for this period."
            />
          )}
        </AnalyticsCard>

        {/* ======================================================
            SOLAR PERFORMANCE
        ====================================================== */}

        <AnalyticsCard
          title="Solar Performance"
          subtitle="Historical solar input in watts."
          icon="sunny-outline"
        >
          {solarChartData.length >
            0 ? (
            <LineChart
              data={
                solarChartData
              }
              width={
                CHART_WIDTH
              }
              height={
                CHART_HEIGHT
              }
              maxValue={
                solarMax
              }
              noOfSections={5}
              initialSpacing={8}
              spacing={38}
              thickness={3}
              hideRules
              yAxisThickness={0}
              xAxisThickness={1}
              yAxisTextStyle={
                styles.chartAxisText
              }
              xAxisLabelTextStyle={
                styles.chartAxisText
              }
              dataPointsColor={
                Colors.light.secondary
              }
              color={
                Colors.light.secondary
              }
            />
          ) : (
            <EmptyChartState
              message="No solar history is available for this period."
            />
          )}
        </AnalyticsCard>

        {/* ======================================================
            ENERGY USAGE
            IMPORTANT:
            This version intentionally does NOT use data2.
            The installed Gifted Charts API rejected data2.
            Two BarCharts are used inside one section instead.
        ====================================================== */}

        <AnalyticsCard
          title="Energy Usage"
          subtitle="Historical energy input and output."
          icon="flash-outline"
        >
          {energyInputChartData.length >
            0 ||
            energyOutputChartData.length >
            0 ? (
            <View
              style={
                styles.energyChartsContainer
              }
            >
              <View
                style={
                  styles.energyChartBlock
                }
              >
                <View
                  style={
                    styles.energyChartTitleRow
                  }
                >
                  <View
                    style={[
                      styles.energyLegendDot,
                      {
                        backgroundColor:
                          Colors.light.primary,
                      },
                    ]}
                  />

                  <AppText
                    variant="caption"
                    style={
                      styles.energyChartTitle
                    }
                  >
                    Energy Input
                  </AppText>
                </View>

                <BarChart
                  data={
                    energyInputChartData
                  }
                  width={
                    CHART_WIDTH
                  }
                  height={
                    180
                  }
                  maxValue={
                    energyInputMax
                  }
                  noOfSections={4}
                  barWidth={20}
                  spacing={22}
                  initialSpacing={8}
                  yAxisThickness={0}
                  xAxisThickness={1}
                  yAxisTextStyle={
                    styles.chartAxisText
                  }
                  xAxisLabelTextStyle={
                    styles.chartAxisText
                  }
                  frontColor={
                    Colors.light.primary
                  }
                />
              </View>

              <View
                style={
                  styles.energyChartBlock
                }
              >
                <View
                  style={
                    styles.energyChartTitleRow
                  }
                >
                  <View
                    style={[
                      styles.energyLegendDot,
                      {
                        backgroundColor:
                          Colors.light.secondary,
                      },
                    ]}
                  />

                  <AppText
                    variant="caption"
                    style={
                      styles.energyChartTitle
                    }
                  >
                    Energy Output
                  </AppText>
                </View>

                <BarChart
                  data={
                    energyOutputChartData
                  }
                  width={
                    CHART_WIDTH
                  }
                  height={
                    180
                  }
                  maxValue={
                    energyInputMax
                  }
                  noOfSections={4}
                  barWidth={20}
                  spacing={22}
                  initialSpacing={8}
                  yAxisThickness={0}
                  xAxisThickness={1}
                  yAxisTextStyle={
                    styles.chartAxisText
                  }
                  xAxisLabelTextStyle={
                    styles.chartAxisText
                  }
                  frontColor={
                    Colors.light.secondary
                  }
                />
              </View>
            </View>
          ) : (
            <EmptyChartState
              message="No energy history is available for this period."
            />
          )}
        </AnalyticsCard>

        {/* ======================================================
            TEMPERATURE MONITORING
        ====================================================== */}

        <AnalyticsCard
          title="Temperature Monitoring"
          subtitle="Battery and solar panel temperatures over time."
          icon="thermometer-outline"
        >
          {batteryTemperatureData.length >
            0 ||
            solarTemperatureData.length >
            0 ? (
            <View
              style={
                styles.temperatureChartsContainer
              }
            >
              <View
                style={
                  styles.temperatureLegend
                }
              >
                <View
                  style={
                    styles.legendItem
                  }
                >
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor:
                          Colors.light.primary,
                      },
                    ]}
                  />

                  <AppText
                    variant="caption"
                    style={
                      styles.legendText
                    }
                  >
                    Battery Temp
                  </AppText>
                </View>

                <View
                  style={
                    styles.legendItem
                  }
                >
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor:
                          Colors.light.secondary,
                      },
                    ]}
                  />

                  <AppText
                    variant="caption"
                    style={
                      styles.legendText
                    }
                  >
                    Solar Panel Temp
                  </AppText>
                </View>
              </View>

              <LineChart
                data={
                  batteryTemperatureData
                }
                width={
                  CHART_WIDTH
                }
                height={
                  CHART_HEIGHT
                }
                maxValue={
                  temperatureMax
                }
                noOfSections={4}
                initialSpacing={8}
                spacing={38}
                thickness={3}
                hideRules
                yAxisThickness={0}
                xAxisThickness={1}
                yAxisTextStyle={
                  styles.chartAxisText
                }
                xAxisLabelTextStyle={
                  styles.chartAxisText
                }
                dataPointsColor={
                  Colors.light.primary
                }
                color={
                  Colors.light.primary
                }
              />

              <View
                style={
                  styles.temperatureSecondaryChart
                }
              >
                <LineChart
                  data={
                    solarTemperatureData
                  }
                  width={
                    CHART_WIDTH
                  }
                  height={
                    CHART_HEIGHT
                  }
                  maxValue={
                    temperatureMax
                  }
                  noOfSections={4}
                  initialSpacing={8}
                  spacing={38}
                  thickness={3}
                  hideRules
                  yAxisThickness={0}
                  xAxisThickness={1}
                  yAxisTextStyle={
                    styles.chartAxisText
                  }
                  xAxisLabelTextStyle={
                    styles.chartAxisText
                  }
                  dataPointsColor={
                    Colors.light.secondary
                  }
                  color={
                    Colors.light.secondary
                  }
                />
              </View>
            </View>
          ) : (
            <EmptyChartState
              message="No temperature history is available for this period."
            />
          )}
        </AnalyticsCard>

        {/* ======================================================
            APPLIANCE USAGE
        ====================================================== */}

        <AnalyticsCard
          title="Appliance Usage"
          subtitle="Historical energy consumed by recorded appliances."
          icon="home-outline"
        >
          {applianceChartData.length >
            0 ? (
            <View
              style={
                styles.applianceList
              }
            >
              {applianceChartData.map(
                (
                  item,
                  index,
                ) => {
                  const maximumEnergy =
                    Math.max(
                      1,
                      ...applianceChartData.map(
                        (
                          chartItem,
                        ) =>
                          chartItem.energyWh,
                      ),
                    );

                  const width =
                    clamp(
                      (item.energyWh /
                        maximumEnergy) *
                      100,
                      4,
                      100,
                    );

                  return (
                    <View
                      key={`${item.name}-${index}`}
                      style={
                        styles.applianceUsageItem
                      }
                    >
                      <View
                        style={
                          styles.applianceUsageHeader
                        }
                      >
                        <AppText
                          variant="caption"
                          style={
                            styles.applianceName
                          }
                        >
                          {item.name}
                        </AppText>

                        <AppText
                          variant="caption"
                          style={
                            styles.applianceEnergy
                          }
                        >
                          {formatNumber(
                            item.energyWh,
                            2,
                          )}{" "}
                          Wh
                        </AppText>
                      </View>

                      <View
                        style={
                          styles.applianceTrack
                        }
                      >
                        <View
                          style={[
                            styles.applianceFill,
                            {
                              width: `${width}%`,
                            },
                          ]}
                        />
                      </View>

                      <AppText
                        variant="caption"
                        style={
                          styles.applianceDuration
                        }
                      >
                        Usage duration:{" "}
                        {formatDuration(
                          item.durationSeconds,
                        )}
                      </AppText>
                    </View>
                  );
                },
              )}
            </View>
          ) : (
            <EmptyChartState
              message="No appliance usage history is available for this period."
            />
          )}

          <Pressable
            style={({ pressed }) => [
              styles.viewAllButton,
              pressed &&
              styles.buttonPressed,
            ]}
            onPress={() =>
              Alert.alert(
                "Appliance Usage",
                "All recorded appliance usage is included in the selected analytics date range.",
              )
            }
          >
            <AppText
              variant="caption"
              style={
                styles.viewAllButtonText
              }
            >
              View All Appliances
            </AppText>

            <Ionicons
              name="arrow-forward-outline"
              size={16}
              color={
                Colors.light.primary
              }
            />
          </Pressable>
        </AnalyticsCard>

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
              Export historical analytics using the selected frequency and date range.
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
                  style={
                    styles.reportSelect
                  }
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
                  Date Range
                </AppText>

                <View
                  style={
                    styles.dateRangeBox
                  }
                >
                  <AppText
                    variant="caption"
                    style={
                      styles.dateRangeText
                    }
                  >
                    {formatReportDate(
                      range.start,
                    )}
                  </AppText>

                  <Ionicons
                    name="arrow-forward-outline"
                    size={13}
                    color={
                      Colors.light.textSecondary
                    }
                  />

                  <AppText
                    variant="caption"
                    style={
                      styles.dateRangeText
                    }
                  >
                    {formatReportDate(
                      range.end,
                    )}
                  </AppText>
                </View>
              </View>
            </View>

            <View
              style={
                styles.presetRow
              }
            >
              <Pressable
                style={
                  styles.presetButton
                }
                onPress={() =>
                  applyPresetRange(
                    7,
                  )
                }
              >
                <AppText
                  variant="caption"
                  style={
                    styles.presetButtonText
                  }
                >
                  7 Days
                </AppText>
              </Pressable>

              <Pressable
                style={
                  styles.presetButton
                }
                onPress={() =>
                  applyPresetRange(
                    30,
                  )
                }
              >
                <AppText
                  variant="caption"
                  style={
                    styles.presetButtonText
                  }
                >
                  30 Days
                </AppText>
              </Pressable>

              <Pressable
                style={
                  styles.presetButton
                }
                onPress={() =>
                  applyPresetRange(
                    90,
                  )
                }
              >
                <AppText
                  variant="caption"
                  style={
                    styles.presetButtonText
                  }
                >
                  90 Days
                </AppText>
              </Pressable>

              <Pressable
                style={
                  styles.presetButton
                }
                onPress={() =>
                  applyPresetRange(
                    366,
                  )
                }
              >
                <AppText
                  variant="caption"
                  style={
                    styles.presetButtonText
                  }
                >
                  1 Year
                </AppText>
              </Pressable>
            </View>

            <View
              style={
                styles.exportRow
              }
            >
              <Pressable
                style={
                  styles.exportPrimaryButton
                }
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
                style={
                  styles.exportSecondaryButton
                }
                onPress={() =>
                  generateReport(
                    "PDF",
                  )
                }
              >
                <Ionicons
                  name="document-outline"
                  size={17}
                  color={
                    Colors.light.primary
                  }
                />

                <AppText
                  variant="caption"
                  style={
                    styles.exportSecondaryText
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
              (
                option,
              ) => (
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
              (
                option,
              ) => (
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

      {/* Sidebar */}
      <Sidebar
        visible={
          sidebarVisible
        }
        onClose={() =>
          setSidebarVisible(
            false,
          )
        }
      />
    </ScreenContainer2>
  );
}

/* ============================================================
   ANALYTICS CARD
   ============================================================ */

interface AnalyticsCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}

function AnalyticsCard({
  title,
  subtitle,
  icon,
  children,
}: AnalyticsCardProps) {
  return (
    <View
      style={
        styles.analyticsCard
      }
    >
      <View
        style={
          styles.analyticsCardHeader
        }
      >
        <View
          style={
            styles.analyticsCardIcon
          }
        >
          <Ionicons
            name={icon}
            size={19}
            color={
              Colors.light.primary
            }
          />
        </View>

        <View
          style={
            styles.analyticsCardHeaderText
          }
        >
          <AppText
            variant="body"
            style={
              styles.analyticsCardTitle
            }
          >
            {title}
          </AppText>

          <AppText
            variant="caption"
            style={
              styles.analyticsCardSubtitle
            }
          >
            {subtitle}
          </AppText>
        </View>
      </View>

      <View
        style={
          styles.analyticsChartContainer
        }
      >
        {children}
      </View>
    </View>
  );
}

/* ============================================================
   EMPTY CHART
   ============================================================ */

interface EmptyChartStateProps {
  message: string;
}

function EmptyChartState({
  message,
}: EmptyChartStateProps) {
  return (
    <View
      style={
        styles.emptyChart
      }
    >
      <Ionicons
        name="bar-chart-outline"
        size={28}
        color={
          Colors.light.textSecondary
        }
      />

      <AppText
        variant="caption"
        style={
          styles.emptyChartText
        }
      >
        {message}
      </AppText>
    </View>
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

  cardRadius: 16,
  cardBorderWidth: 2,
  cardPadding: 16,

  iconSize: 40,
  iconRadius: 12,

  selectorHeight: 42,
  selectorRadius: 12,

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
       FREQUENCY SECTION
    ======================================================== */

    frequencySection: {
      width: "100%",
      marginBottom:
        analyticsDimensions.sectionSpacing,
    },

    frequencyHeader: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: 12,
    },

    frequencyHeaderText: {
      flex: 1,
    },

    sectionTitle: {
      color: "#000000",
      fontWeight: "700",
      fontSize: 19,
    },

    sectionSubtitle: {
      color:
        Colors.light.textSecondary,
      marginTop: 4,
      lineHeight: 19,
    },

    frequencyButton: {
      minHeight:
        analyticsDimensions.selectorHeight,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      backgroundColor:
        Colors.glass.white,
      borderWidth: 2,
      borderColor:
        Colors.light.primary,
      borderRadius:
        analyticsDimensions.selectorRadius,
    },

    frequencyButtonText: {
      color: "#000000",
      fontWeight: "600",
    },

    buttonPressed: {
      opacity: 0.72,
    },

    /* ========================================================
       ANALYTICS CARDS
    ======================================================== */

    analyticsCard: {
      width: "100%",
      backgroundColor:
        Colors.glass.white,
      borderWidth:
        analyticsDimensions.cardBorderWidth,
      borderColor:
        Colors.light.primary,
      borderRadius:
        analyticsDimensions.cardRadius,
      padding:
        analyticsDimensions.cardPadding,
      marginBottom:
        analyticsDimensions.sectionSpacing,
    },

    analyticsCardHeader: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      marginBottom: 14,
    },

    analyticsCardIcon: {
      width:
        analyticsDimensions.iconSize,
      height:
        analyticsDimensions.iconSize,
      borderRadius:
        analyticsDimensions.iconRadius,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(0, 168, 107, 0.10)",
      borderWidth: 1,
      borderColor:
        "rgba(0, 168, 107, 0.20)",
    },

    analyticsCardHeaderText: {
      flex: 1,
    },

    analyticsCardTitle: {
      color: "#000000",
      fontWeight: "700",
      fontSize: 17,
    },

    analyticsCardSubtitle: {
      color:
        Colors.light.textSecondary,
      marginTop: 3,
      lineHeight: 18,
    },

    analyticsChartContainer: {
      width: "100%",
      alignItems: "center",
      overflow: "hidden",
    },

    chartAxisText: {
      color:
        Colors.light.textSecondary,
      fontSize: 9,
    },

    /* ========================================================
       ENERGY CHARTS
    ======================================================== */

    energyChartsContainer: {
      width: "100%",
    },

    energyChartBlock: {
      width: "100%",
      marginBottom: 12,
      alignItems: "center",
    },

    energyChartTitleRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
      gap: 7,
    },

    energyLegendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },

    energyChartTitle: {
      color: "#000000",
      fontWeight: "600",
      fontSize: 11,
    },

    /* ========================================================
       TEMPERATURE
    ======================================================== */

    temperatureChartsContainer: {
      width: "100%",
      alignItems: "center",
    },

    temperatureLegend: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 8,
      flexWrap: "wrap",
    },

    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },

    legendText: {
      color:
        Colors.light.textSecondary,
      fontSize: 10,
    },

    temperatureSecondaryChart: {
      marginTop: -18,
    },

    /* ========================================================
       APPLIANCE USAGE
    ======================================================== */

    applianceList: {
      width: "100%",
      gap: 15,
    },

    applianceUsageItem: {
      width: "100%",
    },

    applianceUsageHeader: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 7,
      gap: 10,
    },

    applianceName: {
      flex: 1,
      color: "#000000",
      fontWeight: "600",
    },

    applianceEnergy: {
      color:
        Colors.light.primary,
      fontWeight: "700",
    },

    applianceTrack: {
      width: "100%",
      height: 10,
      borderRadius: 5,
      backgroundColor:
        "rgba(0, 0, 0, 0.08)",
      overflow: "hidden",
    },

    applianceFill: {
      height: "100%",
      borderRadius: 5,
      backgroundColor:
        Colors.light.primary,
    },

    applianceDuration: {
      color:
        Colors.light.textSecondary,
      marginTop: 5,
      fontSize: 10,
    },

    viewAllButton: {
      minHeight: 42,
      marginTop: 17,
      borderWidth: 2,
      borderColor:
        Colors.light.primary,
      borderRadius: 12,
      paddingHorizontal: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },

    viewAllButtonText: {
      color:
        Colors.light.primary,
      fontWeight: "700",
    },

    /* ========================================================
       EMPTY CHART
    ======================================================== */

    emptyChart: {
      width: "100%",
      minHeight: 190,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 25,
      gap: 10,
    },

    emptyChartText: {
      color:
        Colors.light.textSecondary,
      textAlign: "center",
      lineHeight: 19,
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
      borderWidth: 2,
      borderColor:
        Colors.light.secondary,
      borderRadius:
        analyticsDimensions.cardRadius,
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

    dateRangeBox: {
      width: "100%",
      minHeight: 42,
      borderWidth: 1,
      borderColor:
        "rgba(0, 0, 0, 0.14)",
      borderRadius: 12,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: 7,
    },

    dateRangeText: {
      color: "#000000",
      flexShrink: 1,
      fontSize: 10,
    },

    presetRow: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
      marginTop: 10,
    },

    presetButton: {
      minHeight: 34,
      paddingHorizontal: 11,
      borderWidth: 1,
      borderColor:
        "rgba(0, 168, 107, 0.35)",
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(0, 168, 107, 0.06)",
    },

    presetButtonText: {
      color:
        Colors.light.primary,
      fontWeight: "600",
      fontSize: 10,
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

    exportSecondaryButton: {
      flex: 1,
      minHeight: 44,
      backgroundColor:
        Colors.glass.white,
      borderWidth: 2,
      borderColor:
        Colors.light.secondary,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 7,
      paddingHorizontal: 10,
    },

    exportSecondaryText: {
      color:
        Colors.light.primary,
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
