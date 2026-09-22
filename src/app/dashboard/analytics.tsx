import AnalyticsCards from "@/components/AnalyticsCard";
import Copyright from "@/components/forms/Copyright";
import NavBar from "@/components/layout/Navbar";
import ScreenContainer2 from "@/components/layout/ScreenContainer2";
import AppText from "@/components/ui/AppText";
import AnalyticsChartCard from "@/components/AnalyticsChartCard";
import { ChartEmpty } from "@/components/charts/ChartBits";
import type {
  AnalyticsChartsProps,
} from "@/components/AnalyticsCharts";
import {
  DropdownModal,
  RadioOptionRow,
} from "@/components/ui/DropdownModal";
import { Colors } from "@/constants/colors";
import {
  AnalyticsRange,
  ApplianceUsageHistoryRow,
  MonitoringHistoryRow,
  REPORT_FREQUENCIES,
  ReportFrequency,
  ReportType,
  createAnalyticsReportContent,
  downloadCsvOnWeb,
  downloadPdfOnWeb,
  generateAdlaWattCsv,
  generateAdlaWattPdf,
  getDefaultRange,
  loadAnalyticsData,
  prepareReportData,
} from "@/services/analyticsService";
import React, {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";

/* ============================================================
   SKIA CHARTS (LAZY)
   On web the CanvasKit engine must be loaded before any module
   that imports @shopify/react-native-skia is evaluated, otherwise
   Skia.web.js captures an undefined CanvasKit at module load.

   The charts subtree only mounts in the browser (see
   SkiaChartsSection). During SSR/static rendering the Suspense
   fallback is rendered instead, so the Skia module is never
   evaluated server-side and hydration always matches.
   ============================================================ */

const loadChartsModule = () =>
  import("@/components/AnalyticsCharts");

const loadChartsModuleWeb = () =>
  import("@shopify/react-native-skia/lib/module/web")
    .then((module) =>
      module.LoadSkiaWeb({
        locateFile: (file: string) =>
          `/${file}`,
      }),
    )
    .then(loadChartsModule);

type ChartsModule = {
  default: React.ComponentType<AnalyticsChartsProps>;
};

const SkiaAnalyticsCharts = lazy((): Promise<ChartsModule> => {
  if (Platform.OS !== "web") {
    return loadChartsModule();
  }

  return loadChartsModuleWeb();
});

class ChartsErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <AnalyticsChartCard
          title="Charts Unavailable"
          subtitle="The chart rendering engine failed to load."
          icon="alert-circle-outline"
          frequency="Daily"
          onFrequencyChange={() => {}}
        >
          <ChartEmpty message="Refresh the page to try loading the charts again." />
        </AnalyticsChartCard>
      );
    }

    return this.props.children;
  }
}

function ChartsLoadingFallback() {
  return (
    <AnalyticsChartCard
      title="Preparing Charts"
      subtitle="Loading the chart rendering engine..."
      icon="hourglass-outline"
      frequency="Daily"
      onFrequencyChange={() => {}}
    >
      <ChartEmpty message="CanvasKit is starting up. This usually takes a few seconds." />
    </AnalyticsChartCard>
  );
}

function SkiaChartsSection({
  monitoringHistory,
  loading,
}: {
  monitoringHistory: MonitoringHistoryRow[];
  loading: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ChartsLoadingFallback />;
  }

  return (
    <ChartsErrorBoundary>
      <Suspense fallback={<ChartsLoadingFallback />}>
        <SkiaAnalyticsCharts
          monitoringHistory={monitoringHistory}
          loading={loading}
        />
      </Suspense>
    </ChartsErrorBoundary>
  );
}

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
      [range],
    );

  useEffect(() => {
    loadAnalytics();
  }, [
    loadAnalytics,
  ]);

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
            ANALYTICS CHARTS
            Skia charts rebuild from the single history fetch.
            The chart container is lazy-loaded after the web
            CanvasKit engine is ready (see SKIA CHARTS above).
        ====================================================== */}
        <SkiaChartsSection
          monitoringHistory={monitoringHistory}
          loading={loading}
        />

        {/* ======================================================
            ANALYTICS PANEL
            Report export + date-range controls.
        ====================================================== */}
        <AnalyticsCards
          reportFrequency={
            reportFrequency
          }
          setReportModalVisible={
            setReportModalVisible
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
        />

        {/* Copyright */}
        <Copyright />
      </ScrollView>

      {/* ========================================================
          REPORT FREQUENCY MODAL
      ======================================================== */}
      <DropdownModal
        visible={reportModalVisible}
        title="Report Frequency"
        onClose={() =>
          setReportModalVisible(false)
        }
      >
        {REPORT_FREQUENCIES.map(
          (option) => (
            <RadioOptionRow
              key={option}
              label={option}
              selected={
                reportFrequency ===
                option
              }
              onPress={() => {
                setReportFrequency(
                  option,
                );

                setReportModalVisible(
                  false,
                );
              }}
            />
          ),
        )}
      </DropdownModal>
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
  });