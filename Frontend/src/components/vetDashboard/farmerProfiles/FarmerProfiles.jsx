import { FaBell, FaUsers } from 'react-icons/fa';
import VetLayout from '../VetLayout';
import ProfileCard from './ProfileCard';
import SearchBar from './SearchBar';

const farmers = [
  { id: 1, name: 'Rajesh Kumar', location: 'Jaipur, Rajasthan', phone: '+91 98765 48210', animals: 8, avatar: '/api/placeholder/64/64' },
  { id: 2, name: 'Sunita Devi', location: 'Patna, Bihar', phone: '+91 87654 32100', animals: 5, avatar: '/api/placeholder/64/64' },
  { id: 3, name: 'Mohan Singh', location: 'Lucknow, UP', phone: '+91 76543 21098', animals: 12, avatar: '/api/placeholder/64/64' },
  { id: 4, name: 'Lakshmi Bai', location: 'Indore, MP', phone: '+91 65432 10987', animals: 3, avatar: '/api/placeholder/64/64' },
  { id: 5, name: 'Arjun Patel', location: 'Ahmedabad, Gujarat', phone: '+91 54321 09876', animals: 7, avatar: '/api/placeholder/64/64' },
  { id: 6, name: 'Kamla Sharma', location: 'Jaipur, Rajasthan', phone: '+91 43210 98765', animals: 4, avatar: '/api/placeholder/64/64' }
];

export default function FarmerProfiles() {
  return (
    <VetLayout pageTitle="Farmer Profiles">
      {/* Main Content */}
      <div className="p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header with title and count */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Farmer Profiles</h2>
            <p className="text-gray-600">{farmers.length} Registered farmers</p>
          </div>
          
          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar />
          </div>
          
          {/* Farmer Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmers.map(farmer => (
              <ProfileCard key={farmer.id} farmer={farmer} />
            ))}
          </div>
        </div>
      </div>
    </VetLayout>
  );
}
