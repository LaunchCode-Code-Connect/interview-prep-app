export default function Table({ columnNames, children }) {
  return (
    <table className="table table-striped">
      <thead className="thead-dark">
        <tr>
          {columnNames.map((col) => {
            return (
              <th scope="col" key={col}>
                {col}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
