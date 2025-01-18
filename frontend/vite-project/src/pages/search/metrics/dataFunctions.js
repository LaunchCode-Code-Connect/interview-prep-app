export function sumField(data, fieldName) {
  let initialValue = 0;
  const result = data.reduce((acc, record) => {
    return acc + Number(record[fieldName]);
  }, initialValue);
  return Math.round((result * 100) / 100, 2);
}

export function averageField(data, fieldName) {
  const sum = sumField(data, fieldName);
  return Math.round(sum / data.length, 2);
}

export function medianField(data, fieldName) {
  const compareField = (a, b) => {
    const aField = Number(a[fieldName]);
    const bField = Number(b[fieldName]);
    if (aField < bField) {
      return -1;
    }
    if (aField > bField) {
      return 1;
    }
    return 0;
  };
  const values = [...data].sort(compareField).map((o) => Number(o[fieldName]));

  const half = Math.floor(values.length / 2);

  return values.length % 2
    ? values[half]
    : (values[half - 1] + values[half]) / 2;
}
