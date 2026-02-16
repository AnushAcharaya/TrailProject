// src/components/LivestockList.jsx
import LivestockCard from "./LivestockCard";

const LivestockList = ({ livestockData, onDelete }) => {
  return (
    <div className="livestock-list">
      {livestockData.map((item) => (
        <LivestockCard key={item.id} livestock={item} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default LivestockList;