import React from "react";
import SearchResultsTable from "./searchTable/SearchTable";
import SearchBar from "./SearchBar";
import MetricsBar from "./metrics/MetricsBar";

function SearchPage({ data, handleSearch, errorMsg, loading }) {
  return (
    <div className="container text-left">
      <div className="row align-items-left">
        <div className="col-4">
          <SearchBar onSearch={handleSearch} />
        </div>
        <div className="col-8"></div>
      </div>
      <div className="row align-items-center">
        {data.length > 0 ? (
          <p>Displaying {data.length} Records</p>
        ) : loading ? (
          <p>Loading...</p>
        ) : (
          <p>No Records To Display</p>
        )}
      </div>
      <div className="row align-items-center">
        <MetricsBar data={data} />
      </div>
      <div className="row align-items-center">
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        {loading ? (
          <p>Loading Records ... </p>
        ) : (
          <SearchResultsTable data={data} />
        )}
      </div>
    </div>
  );
}

export default SearchPage;
