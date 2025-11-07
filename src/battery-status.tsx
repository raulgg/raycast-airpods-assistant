import { Color, Detail, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import { ConnectedAirpodsData, getAvailableAirpodsData, getConnectedAirpodsData } from "./core/bluetooth";
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
  const [isConnected, setIsConnected] = useState<boolean>(false);
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

        // Check if AirPods are currently connected
        const connectedAirpods = await getConnectedAirpodsData();
        const connected = connectedAirpods.some((connectedAirpod) => connectedAirpod.address === airpods.address);
        setIsConnected(connected);

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
      navigationTitle="AirPods Battery Status"
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label
            title="Left AirPod"
            text={airpodsData.batteryLevelLeft !== null ? `${airpodsData.batteryLevelLeft}%` : "N/A"}
            icon={{
              source: leftIcon.icon,
              tintColor: leftIcon.tintColor,
            }}
          />
          <Detail.Metadata.Label
            title="Right AirPod"
            text={airpodsData.batteryLevelRight !== null ? `${airpodsData.batteryLevelRight}%` : "N/A"}
            icon={{
              source: rightIcon.icon,
              tintColor: rightIcon.tintColor,
            }}
          />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label
            title="Case"
            text={airpodsData.batteryLevelCase !== null ? `${airpodsData.batteryLevelCase}%` : "N/A"}
            icon={{
              source: caseIcon.icon,
              tintColor: caseIcon.tintColor,
            }}
          />
          <Detail.Metadata.Separator />
          <Detail.Metadata.TagList title="Connection">
            <Detail.Metadata.TagList.Item
              text={isConnected ? "Connected" : "Not Connected"}
              color={isConnected ? Color.Green : Color.SecondaryText}
            />
          </Detail.Metadata.TagList>
        </Detail.Metadata>
      }
    />
  );
}
