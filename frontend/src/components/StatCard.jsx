import React from "react";
import "./StatCard.css";

// A single number tile on the dashboard, e.g. "Opening Balance: 55".
// accent picks which color stripe shows on the left edge: blue, emerald, amber, or slate.
const StatCard = ({ label, value, accent = "blue", onClick }) => {
  const cardClass = `stat-card stat-card--${accent}${onClick ? " clickable" : ""}`;

  return (
    <div onClick={onClick} className={cardClass}>
      <h3 className="stat-card-label">{label}</h3>
      <p className="stat-card-value">{value}</p>
    </div>
  );
};

export default StatCard;
