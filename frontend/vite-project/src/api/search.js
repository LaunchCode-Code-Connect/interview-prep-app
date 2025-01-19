import baseUrl from "./baseUrl";

let url = baseUrl + "/search";

export async function getSearchResults(questionType) {
  let queryUrl = url + "?";

  if (questionType) {
      queryUrl += `type=${questionType}`;
  }

  const response = await fetch(queryUrl);
  if (!response.ok) {
    throw new Error("Issue encountered loading back Search Results");
  } else {
    const json = await response.json();
    return json;
  }
}

