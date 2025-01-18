import React from "react";
import Table from "../../../components/Table";
import dataFields from "./dataFields";
import SearchResultTableRows from "./SearchTableRow";

function SearchResultsTable({ data }) {
  return (
    <Table columnNames={Object.values(dataFields)}>
      <SearchResultTableRows data={data} />
    </Table>
  );
}

export default SearchResultsTable;
