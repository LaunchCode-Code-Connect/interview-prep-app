import baseUrl from "./baseUrl";

export async function getQuestionsLeft(){
    const response = await fetch(baseUrl + "/completed");
    if (!response.ok) {
      throw new Error("Issue encountered loading back Search Results");
    } else {
      const json = await response.json();
      return json;
    }
  }