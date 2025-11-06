import { Detail } from "@raycast/api";
import { useEffect, useState } from "react";
import { ConnectedAirpodsData, getAvailableAirpodsData } from "./core/bluetooth";
import { getCachedBatteryData, setCachedBatteryData } from "./core/local-storage";

function formatBatteryMarkdown(airpods: ConnectedAirpodsData): string {
  const lines = [
    `# ${airpods.name}`.trim(),
    "",
    `- Left: ${airpods.batteryLevelLeft}%`,
    `- Right: ${airpods.batteryLevelRight}%`,
    `- Case: ${airpods.batteryLevelCase !== null ? `${airpods.batteryLevelCase}%` : "N/A"}`,
  ];
  return lines.join("\n");
}

export default function ShowBattery() {
  const [markdown, setMarkdown] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      // Load cached data first to avoid layout shift
      const cached = await getCachedBatteryData();
      if (cached) {
        setMarkdown(formatBatteryMarkdown(cached));
      }

      // Fetch fresh data
      try {
        const availableAirpodsData = await getAvailableAirpodsData();
        if (!availableAirpodsData.length) {
          setMarkdown(`# AirPods Battery\n\nNo AirPods found.`);
          setIsLoading(false);
          return;
        }

        const airpods = availableAirpodsData[0];
        setMarkdown(formatBatteryMarkdown(airpods));

        // Cache the fresh data
        await setCachedBatteryData(airpods);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setMarkdown(`# AirPods Battery\n\nError: ${msg}`);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return <Detail markdown={markdown} isLoading={isLoading} />;
}
