import Card from "../../../components/Card";
import dataFields from "./dataFields";
import { sumField, averageField, medianField } from "./dataFunctions";
import MetricCard from "./MetricCard";

function MetricsTable({ data }) {
  const dataFields = {
    appUsageTime: "App Usage Time (min/day)",
    screenOnTime: "Screen On Time (hours/day)",
    numApps: "Number of Apps Installed",
    dataUsage: "Data Usage (MB/day)",
    age: "Age",
  };

  // App Usage
  // Screen On Time
  // Number of Apps Installed
  // Data usage

  const appUsageKey = dataFields["appUsageTime"];
  const screenTimeKey = dataFields["screenOnTime"];
  const numAppsKey = dataFields["numApps"];
  const ageKey = dataFields["age"];
  const dataPresent = data.length > 0;

  return (
    <div className="d-flex justify-content-between mt-4 mb-4">
      <MetricCard
        title={appUsageKey}
        unit={"Minutes"}
        average={dataPresent && averageField(data, appUsageKey)}
        median={dataPresent && medianField(data, appUsageKey)}
      />
      <MetricCard
        title={screenTimeKey}
        unit={"Hours"}
        average={dataPresent && averageField(data, screenTimeKey)}
        median={dataPresent && medianField(data, screenTimeKey)}
      />
      <MetricCard
        title={numAppsKey}
        unit={"Apps"}
        average={dataPresent && averageField(data, numAppsKey)}
        median={dataPresent && medianField(data, numAppsKey)}
      />
      <MetricCard
        title={ageKey}
        unit={"Years Old"}
        average={dataPresent && averageField(data, ageKey)}
        median={dataPresent && medianField(data, ageKey)}
      />
    </div>
  );
}

export default MetricsTable;
