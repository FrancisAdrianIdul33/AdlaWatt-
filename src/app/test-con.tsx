import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { supabase } from "@/lib/supabase";

export default function Index() {
  const [title, setTitle] = useState("Connecting...");

  useEffect(() => {
    supabase
      .from("todos")
      .select("title")
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          setTitle(`Error: ${error.message}`);
          return;
        }

        setTitle(data?.[0]?.title ?? "No data");
      });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text>{title}</Text>
    </View>
  );
}