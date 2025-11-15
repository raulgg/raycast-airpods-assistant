import { Color, Detail, Icon, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { AirpodsData, getAvailableAirpodsData } from "./core/bluetooth-devices";

const getBatteryIcon = (percentage: number | null) => {
  if (percentage === null) {
    return { source: Icon.QuestionMark, tintColor: Color.SecondaryText };
  }

  let icon: Icon;
  let tintColor: Color;
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

  return { source: icon, tintColor };
};

const formatBatteryLevel = (level: number | null | undefined): string => {
  return level !== null && level !== undefined ? `${level}%` : "N/A";
};

const renderBatteryMetadata = (
  airpods: AirpodsData,
  MetadataComponent: typeof Detail.Metadata | typeof List.Item.Detail.Metadata,
) => {
  const batteryLevel = airpods.batteryLevel;
  const isSingleBatteryLevel = typeof batteryLevel === "number";

  let singleBatteryLevel: number | undefined;
  let leftBatteryLevel: number | null | undefined;
  let rightBatteryLevel: number | null | undefined;
  let caseBatteryLevel: number | null | undefined;

  if (isSingleBatteryLevel) {
    singleBatteryLevel = batteryLevel;
  } else if (batteryLevel && typeof batteryLevel === "object") {
    leftBatteryLevel = batteryLevel.left;
    rightBatteryLevel = batteryLevel.right;
    caseBatteryLevel = batteryLevel.case;
  }

  const hasLeftBatteryLevel = leftBatteryLevel !== undefined;
  const hasRightBatteryLevel = rightBatteryLevel !== undefined;
  const hasCaseBatteryLevel = caseBatteryLevel !== undefined;

  return (
    <MetadataComponent>
      {isSingleBatteryLevel && singleBatteryLevel !== undefined ? (
        <MetadataComponent.Label
          title="Battery"
          text={formatBatteryLevel(singleBatteryLevel)}
          icon={getBatteryIcon(singleBatteryLevel)}
        />
      ) : (
        <>
          {hasLeftBatteryLevel && (
            <MetadataComponent.Label
              title="Left AirPod"
              text={formatBatteryLevel(leftBatteryLevel)}
              icon={getBatteryIcon(leftBatteryLevel ?? null)}
            />
          )}
          {hasRightBatteryLevel && (
            <MetadataComponent.Label
              title="Right AirPod"
              text={formatBatteryLevel(rightBatteryLevel)}
              icon={getBatteryIcon(rightBatteryLevel ?? null)}
            />
          )}
        </>
      )}
      {(hasLeftBatteryLevel || hasRightBatteryLevel) && hasCaseBatteryLevel && <MetadataComponent.Separator />}
      {hasCaseBatteryLevel && (
        <MetadataComponent.Label
          title="Case"
          text={formatBatteryLevel(caseBatteryLevel)}
          icon={getBatteryIcon(caseBatteryLevel ?? null)}
        />
      )}
      <MetadataComponent.Separator />
      <MetadataComponent.TagList title="Connection">
        <MetadataComponent.TagList.Item
          text={airpods.isConnected ? "Connected" : "Not Connected"}
          color={airpods.isConnected ? Color.Green : Color.SecondaryText}
        />
      </MetadataComponent.TagList>
    </MetadataComponent>
  );
};

export default function ShowBattery() {
  const [airpodsData, setAirpodsData] = useState<AirpodsData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        // Fetch available AirPods (already includes isConnected property)
        const availableAirpodsData = await getAvailableAirpodsData();
        if (!availableAirpodsData.length) {
          setError("No AirPods found");
          setIsLoading(false);
          return;
        }

        // Sort: connected first (preserving original order), then not-connected
        const sortedAirpods = availableAirpodsData.sort((a, b) => {
          if (a.isConnected === b.isConnected) return 0;
          return a.isConnected ? -1 : 1;
        });

        setAirpodsData(sortedAirpods);
        setError(null);
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

  if (airpodsData.length === 1) {
    const airpods = airpodsData[0];
    const markdown = `# ${airpods.name}\n\n✨ Your AirPods battery status`;

    return (
      <Detail
        markdown={markdown}
        isLoading={isLoading}
        navigationTitle="AirPods Battery Status"
        metadata={renderBatteryMetadata(airpods, Detail.Metadata)}
      />
    );
  }

  return (
    <List isLoading={isLoading} isShowingDetail navigationTitle="AirPods Battery Status">
      {airpodsData.map((airpods) => (
        <List.Item
          key={airpods.address}
          title={airpods.name}
          subtitle={airpods.isConnected ? "Connected" : "Not Connected"}
          icon={{
            source: airpods.type === "over-ear" ? Icon.Headphones : Icon.Airpods,
            tintColor: airpods.isConnected ? Color.Green : Color.SecondaryText,
          }}
          detail={<List.Item.Detail metadata={renderBatteryMetadata(airpods, List.Item.Detail.Metadata)} />}
        />
      ))}
    </List>
  );
}
