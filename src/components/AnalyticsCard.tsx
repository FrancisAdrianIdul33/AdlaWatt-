import React, {
  useState,
} from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  BarChart,
  LineChart,
} from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/ui/AppText";
import { Colors } from "@/constants/colors";
import {
  AnalyticsRange,
  ChartFrequency,
  ChartPoint,
  ReportFrequency,
  ReportType,
  clamp,
  formatDuration,
  formatNumber,
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

/*
 * Spreads points comfortably across the chart so long ranges
 * stay readable instead of overlapping.
 */
function getChartSpacing(
  pointCount: number,
): number {
  if (pointCount <= 0) {
    return 38;
  }

  const usableWidth =
    CHART_WIDTH - 50;

  const perPoint = Math.floor(
    usableWidth / pointCount,
  );

  return Math.max(
    20,
    Math.min(60, perPoint),
  );
}

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
  chartFrequency: ChartFrequency;
  setChartFrequency: React.Dispatch<
    React.SetStateAction<ChartFrequency>
  >;
  reportFrequency: ReportFrequency;
  setReportFrequency: React.Dispatch<
    React.SetStateAction<ReportFrequency>
  >;
  setReportModalVisible: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  setFrequencyModalVisible: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  range: AnalyticsRange;
  onFromDateChange: (date: Date) => void;
  onToDateChange: (date: Date) => void;
  generateReport: (
    reportType: ReportType,
  ) => Promise<void>;
  loading: boolean;
  batteryChartData: ChartPoint[];
  solarChartData: ChartPoint[];
  energyInputChartData: ChartPoint[];
  energyOutputChartData: ChartPoint[];
  batteryTemperatureData: ChartPoint[];
  solarTemperatureData: ChartPoint[];
  applianceChartData: {
    name: string;
    energyWh: number;
    durationSeconds: number;
  }[];
  solarMax: number;
  energyInputMax: number;
  temperatureMax: number;
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
        <Ionicons
          name={icon}
          size={30}
          color="#FACC15"
        />

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
   ANALYTICS CARDS
   ============================================================ */

export default function AnalyticsCards({
  chartFrequency,
  setChartFrequency,
  reportFrequency,
  setReportFrequency,
  setReportModalVisible,
  setFrequencyModalVisible,
  range,
  onFromDateChange,
  onToDateChange,
  generateReport,
  loading,
  batteryChartData,
  solarChartData,
  energyInputChartData,
  energyOutputChartData,
  batteryTemperatureData,
  solarTemperatureData,
  applianceChartData,
  solarMax,
  energyInputMax,
  temperatureMax,
}: AnalyticsCardsProps) {
  return (
    <>
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
            initialSpacing={12}
            spacing={getChartSpacing(
              batteryChartData
                .length,
            )}
            thickness={3}
            rulesType="solid"
            rulesColor="rgba(0, 0, 0, 0.07)"
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
            isAnimated={Platform.OS !== "web"}
            animateOnDataChange={Platform.OS !== "web"}
            showDataPointOnFocus
            focusedDataPointColor={
              Colors.light.secondary
            }
            focusedDataPointRadius={6}
            showStripOnFocus
            stripStrokeDashArray={[7, 4]}
            stripColor="rgba(0, 0, 0, 0.18)"
            showTextOnFocus
            textColor="#000000"
            textFontSize={10}
            endSpacing={12}
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
            initialSpacing={12}
            spacing={getChartSpacing(
              solarChartData.length,
            )}
            thickness={3}
            rulesType="solid"
            rulesColor="rgba(0, 0, 0, 0.07)"
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
            isAnimated={Platform.OS !== "web"}
            animateOnDataChange={Platform.OS !== "web"}
            showDataPointOnFocus
            focusedDataPointColor={
              Colors.light.primary
            }
            focusedDataPointRadius={6}
            showStripOnFocus
            stripStrokeDashArray={[7, 4]}
            stripColor="rgba(0, 0, 0, 0.18)"
            showTextOnFocus
            textColor="#000000"
            textFontSize={10}
            endSpacing={12}
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
                spacing={26}
                initialSpacing={12}
                rulesType="solid"
                rulesColor="rgba(0, 0, 0, 0.07)"
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
                isAnimated={Platform.OS !== "web"}
                endSpacing={12}
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
                spacing={26}
                initialSpacing={12}
                rulesType="solid"
                rulesColor="rgba(0, 0, 0, 0.07)"
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
                isAnimated={Platform.OS !== "web"}
                endSpacing={12}
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
              initialSpacing={12}
              spacing={getChartSpacing(
                batteryTemperatureData
                  .length,
              )}
              thickness={3}
              rulesType="solid"
              rulesColor="rgba(0, 0, 0, 0.07)"
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
              isAnimated={Platform.OS !== "web"}
              animateOnDataChange={Platform.OS !== "web"}
              showDataPointOnFocus
              focusedDataPointColor={
                Colors.light.secondary
              }
              focusedDataPointRadius={6}
              showStripOnFocus
              stripStrokeDashArray={[7, 4]}
              stripColor="rgba(0, 0, 0, 0.18)"
              showTextOnFocus
              textColor="#000000"
              textFontSize={10}
              endSpacing={12}
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
                initialSpacing={12}
                spacing={getChartSpacing(
                  solarTemperatureData
                    .length,
                )}
                thickness={3}
                rulesType="solid"
                rulesColor="rgba(0, 0, 0, 0.07)"
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
                isAnimated={Platform.OS !== "web"}
                animateOnDataChange={Platform.OS !== "web"}
                showDataPointOnFocus
                focusedDataPointColor={
                  Colors.light.primary
                }
                focusedDataPointRadius={6}
                showStripOnFocus
                stripStrokeDashArray={[7, 4]}
                stripColor="rgba(0, 0, 0, 0.18)"
                showTextOnFocus
                textColor="#000000"
                textFontSize={10}
                endSpacing={12}
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
  horizontalPadding: 14,
  sectionSpacing: 18,

  /*
   * These values are intentionally preserved
   * from the previous Analytics header.
   */

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

export const styles =
  StyleSheet.create({
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
       ChartCard-style shell: green header panel with a yellow
       icon and white title, followed by the chart body.
    ======================================================== */

    analyticsCard: {
      width: "100%",
      backgroundColor:
        Colors.glass.white,
      borderWidth: 3,
      borderColor:
        Colors.light.primary,
      borderRadius: 15,
      overflow: "hidden",
      marginBottom:
        analyticsDimensions.sectionSpacing,
    },

    analyticsCardHeader: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor:
        Colors.light.primary,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },

    analyticsCardHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    analyticsCardTitle: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },

    analyticsCardSubtitle: {
      color: "rgba(255, 255, 255, 0.88)",
      fontSize: 11,
      marginTop: 2,
      lineHeight: 15,
    },

    analyticsChartContainer: {
      width: "100%",
      alignItems: "center",
      paddingHorizontal: 6,
      paddingVertical: 12,
      overflow: "hidden",
    },

    chartAxisText: {
      color:
        Colors.light.textSecondary,
      fontSize: 10,
      fontWeight: "600",
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