export function sumField(data, fieldName) {
  let initialValue = 0;
  const result = data.reduce((acc, record) => {
    return acc + Number(record[fieldName]);
  }, initialValue);
  return Math.round((result * 100) / 100, 2);
}


