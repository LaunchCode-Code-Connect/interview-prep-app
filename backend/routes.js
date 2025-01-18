const express = require("express");
const _ = require("lodash");
const router = express.Router();
const json = require("./files/user-behavior-data.json");

router.get("/data/search", (req, res, next) => {
  /*
    Valid Query String Parameters
    - operatingSystem
    - deviceModel
    - gender
    - behaviorClass
  */

  const filterType = req.query.filterType || null;
  const keyword = req.query.keyword || null;

  let searchType;
  if (filterType) {
    const lower_case = filterType.toLowerCase();
    searchType =
      lower_case === "model"
        ? "m"
        : lower_case === "gender"
        ? "g"
        : lower_case === "operatingsystem"
        ? "op"
        : lower_case === "behaviorclass"
        ? "bc"
        : "unfiltered";
  }

  if (
    searchType === "unfiltered" ||
    (searchType !== "unfiltered" && !keyword)
  ) {
    return res.send(json);
  } else {
    const filteredData = _.filter(json, (record) => {
      let include = false;
      let lower_keyword = keyword.toLowerCase();
      switch (searchType) {
        case "m":
          include =
            record["Device Model"].toLowerCase().indexOf(lower_keyword) >= 0;
          break;
        case "g":
          include = record["Gender"].toLowerCase() === lower_keyword;
          break;
        case "op":
          include =
            record["Operating System"].toLowerCase().indexOf(lower_keyword) >=
            0;
          break;
        case "bc":
          include = record["User Behavior Class"] === lower_keyword;
          break;
        default:
          return false;
      }

      return include;
    });
    return res.send(filteredData);
  }
});

module.exports = router;
