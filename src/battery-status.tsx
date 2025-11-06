import { Color, Detail, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import { ConnectedAirpodsData, getAvailableAirpodsData } from "./core/bluetooth";
import { getCachedBatteryData, setCachedBatteryData } from "./core/local-storage";

interface BatteryIconConfig {
  icon: Icon;
  tintColor: Color;
}

function getBatteryIcon(percentage: number | null): BatteryIconConfig {
  if (percentage === null) {
    return { icon: Icon.QuestionMark, tintColor: Color.SecondaryText };
  }

  let icon: Icon;
  let tintColor: Color;

  // Select icon based on battery level
  if (percentage >= 60) {
    icon = Icon.Battery;
    tintColor = Color.Green;
  } else if (percentage >= 40) {
    icon = Icon.Battery;
    tintColor = Color.Yellow;
  } else if (percentage >= 20) {
    icon = Icon.Battery;
    tintColor = Color.Orange;
  } else {
    icon = Icon.Battery;
    tintColor = Color.Red;
  }

  return { icon, tintColor };
}

export default function ShowBattery() {
  const [airpodsData, setAirpodsData] = useState<ConnectedAirpodsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      // Load cached data first to avoid layout shift
      const cached = await getCachedBatteryData();
      if (cached) {
        setAirpodsData(cached);
      }

      // Fetch fresh data
      try {
        const availableAirpodsData = await getAvailableAirpodsData();
        if (!availableAirpodsData.length) {
          setError("No AirPods found");
          setIsLoading(false);
          return;
        }

        const airpods = availableAirpodsData[0];
        setAirpodsData(airpods);
        setError(null);

        // Cache the fresh data
        await setCachedBatteryData(airpods);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (error) {
    return <Detail markdown={`# AirPods Battery\n\n⚠️ ${error}`} isLoading={false} />;
  }

  if (!airpodsData) {
    return <Detail markdown="" isLoading={isLoading} />;
  }

  const leftIcon = getBatteryIcon(airpodsData.batteryLevelLeft);
  const rightIcon = getBatteryIcon(airpodsData.batteryLevelRight);
  const caseIcon = getBatteryIcon(airpodsData.batteryLevelCase);

  const markdown = `# ${airpodsData.name}\n\n✨ Your AirPods battery status`;

  return (
    <Detail
      markdown={markdown}
      isLoading={isLoading}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label
            title="Left AirPod"
            text={`${airpodsData.batteryLevelLeft}%`}
            icon={{
              source: leftIcon.icon,
              tintColor: leftIcon.tintColor,
            }}
          />
          <Detail.Metadata.Label
            title="Right AirPod"
            text={`${airpodsData.batteryLevelRight}%`}
            icon={{
              source: rightIcon.icon,
              tintColor: rightIcon.tintColor,
            }}
          />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label
            title="Charging Case"
            text={airpodsData.batteryLevelCase !== null ? `${airpodsData.batteryLevelCase}%` : "N/A"}
            icon={{
              source: caseIcon.icon,
              tintColor: caseIcon.tintColor,
            }}
          />
        </Detail.Metadata>
      }
    />
  );
}
