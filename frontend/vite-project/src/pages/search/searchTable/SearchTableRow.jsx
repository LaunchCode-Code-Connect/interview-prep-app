import dataFields from "./dataFields";
import { useNavigate } from "react-router-dom";

function SearchResultTableRows({ data }) {
  const navigate = useNavigate();

  // Handler for row click
  const handleRowClick = (id) => {
    navigate(`/question/${id}`);
  };
  return data.map((record) => {
    const { question_id } = record;
    return (
      <tr
        key={question_id}
        id={question_id}
        onClick={() => handleRowClick(question_id)}
        style={{ cursor: "pointer" }}
      >
        <td>{question_id}</td>
        <td>{record[dataFields["question_type"]]}</td>
        <td>{record[dataFields["question_area"]]}</td>
        <td>{record[dataFields["question_text"]]}</td>
        <td>{record[dataFields["example_answer"]]}</td>
      </tr>
    );
  });
}

export default SearchResultTableRows;
