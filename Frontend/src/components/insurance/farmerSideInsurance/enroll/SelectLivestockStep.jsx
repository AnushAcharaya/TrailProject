import { FaChevronDown } from 'react-icons/fa';
import LivestockDetails from './LivestockDetails';

const SelectLivestockStep = ({ livestock, onLivestockSelect, onNext, onBack }) => {
  const livestockOptions = [
    {
      id: 1,
      name: 'Dolly',
      type: 'Sheep',
      breed: 'Merino',
      tag: 'SH-002',
      age: '2 years',
      healthStatus: 'healthy'
    },
    {
      id: 2,
      name: 'Bessie',
      type: 'Cow',
      breed: 'Holstein',
      tag: 'CT-001',
      age: '3 years',
      healthStatus: 'healthy'
    },
    {
      id: 3,
      name: 'Billy',
      type: 'Goat',
      breed: 'Saanen',
      tag: 'GT-003',
      age: '1 year',
      healthStatus: 'healthy'
    }
  ];

  return (
    <div className="form-card">
      <h2 className="form-title">Select Livestock</h2>
      <p className="form-subtitle">Choose the livestock you want to insure from your registered animals.</p>

      <div className="relative">
        <select
          className="dropdown-select"
          value={livestock?.id || ''}
          onChange={(e) => {
            const selected = livestockOptions.find(
              (l) => l.id === parseInt(e.target.value)
            );
            onLivestockSelect(selected);
          }}
        >
          <option value="">Select livestock...</option>
          {livestockOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.type}) - {item.tag}
            </option>
          ))}
        </select>
        <FaChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
      </div>

      {livestock && <LivestockDetails livestock={livestock} />}

      <div className="btn-container">
        <button
          className="btn-next"
          onClick={onNext}
          disabled={!livestock}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default SelectLivestockStep;
