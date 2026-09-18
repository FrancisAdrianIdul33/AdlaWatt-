import { Redirect } from "expo-router";

import { silenceWebChartWarnings } from "@/utils/silenceWebChartWarnings";

silenceWebChartWarnings();

export default function Index() {
  return <Redirect href="/splash" />;
}