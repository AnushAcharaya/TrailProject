import { FaShieldAlt } from 'react-icons/fa';

const LivestockDetails = ({ livestock }) => {
  return (
    <div className="details-box">
      <div className="details-title">
        <FaShieldAlt className="w-5 h-5 text-emerald-600" />
        Livestock Details
      </div>

      <div className="details-row">
        <span className="details-label">Name:</span>
        <span className="details-value">{livestock.name}</span>
      </div>

      <div className="details-row">
        <span className="details-label">Type:</span>
        <span className="details-value">{livestock.type}</span>
      </div>

      <div className="details-row">
        <span className="details-label">Breed:</span>
        <span className="details-value">{livestock.breed}</span>
      </div>

      <div className="details-row">
        <span className="details-label">Tag:</span>
        <span className="details-value">{livestock.tag}</span>
      </div>

      <div className="details-row">
        <span className="details-label">Age:</span>
        <span className="details-value">{livestock.age}</span>
      </div>

      <div className="details-row">
        <span className="details-label">Health Status:</span>
        <span className="health-badge">{livestock.healthStatus}</span>
      </div>
    </div>
  );
};

export default LivestockDetails;
