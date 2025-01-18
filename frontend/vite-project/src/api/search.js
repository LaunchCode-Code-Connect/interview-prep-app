import baseUrl from "./baseUrl";

let url = baseUrl + "/search";

export async function getSearchResults(filterType, keyword) {
  let queryUrl = url + "?";

  if (filterType) {
    if (keyword) {
      queryUrl += `filterType=${filterType}&keyword=${keyword}`;
    }
  }

  const response = await fetch(queryUrl);
  if (!response.ok) {
    throw new Error("Issue encountered loading back Search Results");
  } else {
    const json = await response.json();
    return json;
  }
}
