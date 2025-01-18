import { useState } from "react";
import Select from "../../components/Select";

export default function SearchBar({ onSearch }) {
  const filterTypeOptions = [
    "model",
    "gender",
    "operatingSystem",
    "behaviorClass",
  ];
  const [keyword, setKeyword] = useState("");
  const [filterType, setFilterType] = useState(filterTypeOptions[0]);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(filterType, keyword);
        }}
      >
        <div className="input-group">
          <Select
            label={"Select data point to filter search by"}
            options={filterTypeOptions}
            handleChange={(e) => {
              setFilterType(e.target.value);
            }}
            value={filterType}
          />
        </div>
        <div className="input-group mb-3 mt-3">
          <input
            className="form-control"
            type="search"
            placeholder="Search by Keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="input-group mb-3 mt-3">
          <button className="form-control" type="submit">
            Search
          </button>
        </div>
      </form>
    </>
  );
}
