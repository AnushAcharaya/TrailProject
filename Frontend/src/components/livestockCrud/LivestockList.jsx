// src/components/LivestockList.jsx
import LivestockCard from "./LivestockCard";

const LivestockList = ({ livestockData, onDelete }) => {
  return (
    <div className="livestock-list">
      {livestockData.map((item, index) => (
        <LivestockCard key={index} livestock={item} index={index} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default LivestockList;