import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import SearchPage from "./pages/search/SearchPage";
import AboutPage from "./pages/about/AboutPage";
import NotFound from "./pages/404/NotFound";
import { getSearchResults } from "./api/search";

function App() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState([]);
  const handleSearch = async (filterType, keyword) => {
    setLoading(true);
    setData([]);
    setErrorMsg("");

    try {
      const data = await getSearchResults(filterType, keyword);
      setData(data);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
        <Link className="navbar-brand ms-4 nav-link" to="/">
          User Behavior Data
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/search">
                Search Through Dataset
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <hr />
      <Routes>
        <Route path="/" element={<AboutPage />} />
        <Route
          path="/search"
          element={
            <SearchPage
              loading={loading}
              data={data}
              errorMsg={errorMsg}
              handleSearch={handleSearch}
            />
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
