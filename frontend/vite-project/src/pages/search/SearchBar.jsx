import { useState } from "react";
import Select from "../../components/Select";

export default function SearchBar({ onSearch }) {
  const filterTypeOptions = [
    "all",
    "favorites"
  ];
  const [filterType, setFilterType] = useState(filterTypeOptions[0]);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(filterType);
        }}
      >
        <div className="input-group">
          <Select
            label={"Select questions area"}
            options={filterTypeOptions}
            handleChange={(e) => {
              setFilterType(e.target.value);
            }}
            value={filterType}
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
