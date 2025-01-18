import Card from "../../../components/Card";

function MetricCard({ title, average, median, sum, unit }) {
  const formatter = new Intl.NumberFormat("en-US");

  return (
    <Card title={title}>
      <p className="card-text">
        Average - {formatter.format(average)} {unit}
      </p>
      <p className="card-text">
        Median - {formatter.format(median)} {unit}
      </p>
    </Card>
  );
}

export default MetricCard;
