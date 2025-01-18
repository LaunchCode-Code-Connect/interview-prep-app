import dataFields from "./dataFields";

function SearchResultTableRows({ data }) {
  return data.map((record) => {
    return (
      <tr key={record[dataFields["id"]]}>
        <td>{record[dataFields["id"]]}</td>
        <td>{record[dataFields["model"]]}</td>
        <td>{record[dataFields["opSystem"]]}</td>
        <td>{record[dataFields["appUsageTime"]]}</td>
        <td>{record[dataFields["screenOnTime"]]}</td>
        <td>{record[dataFields["batteryDrain"]]}</td>
        <td>{record[dataFields["numApps"]]}</td>
        <td>{record[dataFields["dataUsage"]]}</td>
        <td>{record[dataFields["age"]]}</td>
        <td>{record[dataFields["gender"]]}</td>
        <td>{record[dataFields["userBehavior"]]}</td>
      </tr>
    );
  });
}

export default SearchResultTableRows;
