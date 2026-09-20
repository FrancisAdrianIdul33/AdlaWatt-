import {
  StyleSheet,
  type ViewStyle,
} from "react-native";

import { Colors } from "@/constants/colors";
import { Radius } from "@/constants/theme";

/*
 * Compact appliance card shared by:
 * - AppRecCard (dashboard recommendation carousel)
 * - ApplianceStatusBox (appliances screen)
 * - ApplianceBox (ApplianceModal selection)
 *
 * Keeping the sizing in one module stops the three boxes from drifting
 * apart over time.
 */
/*
 * Shared card shell. `box` reserves room for the status badge used by
 * AppRecCard and ApplianceStatusBox; `boxCompact` is the tighter version
 * used inside ApplianceModal where only the image, name and wattage show.
 */
const applianceCardBox: ViewStyle = {
  width: "46%",
  maxWidth: 150,
  backgroundColor: "#FFFFFF",
  borderWidth: 2,
  borderRadius: Radius.md,
  padding: 12,
  alignItems: "center",
  justifyContent: "flex-start",
  overflow: "hidden",
};

export const applianceCardStyles = StyleSheet.create({
  box: {
    ...applianceCardBox,
    height: 240,
  },

  boxCompact: {
    ...applianceCardBox,
    height: 202,
  },

  imageContainer: {
    width: 110,
    height: 110,
    flexShrink: 0,
    backgroundColor: "#dfdfdf",
    borderWidth: 2,
    borderRadius: Radius.md,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  name: {
    width: "100%",
    height: 40,
    flexShrink: 0,
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  watts: {
    width: "100%",
    height: 18,
    flexShrink: 0,
    color: Colors.light.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 2,
  },

  status: {
    maxWidth: "100%",
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: Radius.md,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 10,
    flexShrink: 0,
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    flexShrink: 1,
  },
});

/*
 * Centered wrap grid used by the appliances screen and the modal so the
 * compact cards stay grouped the same way AppRecCard centers its row.
 */
export const applianceCardGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: 12,
};