function Card({ title, children }) {
  return (
    <div className="card text-center" style={{ width: "18rem" }}>
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        {children}
      </div>
    </div>
  );
}

export default Card;
