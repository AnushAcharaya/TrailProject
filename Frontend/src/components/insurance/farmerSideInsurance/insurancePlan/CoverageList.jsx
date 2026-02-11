import { FaShieldAlt, FaHeartbeat, FaVirus, FaCrown } from 'react-icons/fa';

const CoverageList = ({ coverages }) => {
  const icons = {
    accident: <FaShieldAlt />,
    theft: <FaHeartbeat />,
    disease: <FaVirus />,
    premium: <FaCrown />
  };

  return (
    <div className="coverage-list">
      {coverages.map((item, idx) => (
        <div key={idx} className="coverage-item">
          <span className="coverage-icon">{icons[item.icon]}</span>
          <span className="coverage-text-item">{item.text}</span>
        </div>
      ))}
    </div>
  );
};

export default CoverageList;
