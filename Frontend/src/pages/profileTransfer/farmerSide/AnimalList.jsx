// pages/profileTransfer/farmerSide/AnimalList.jsx
import FarmerLayout from '../../../components/farmerDashboard/FarmerLayout';
import AnimalList from '../../../components/profileTransfer/farmerSide/animalList/AnimalList';
import '../../../styles/profileTransfer/farmerSide/animalList.css';

export default function AnimalListPage() {
  return (
    <FarmerLayout pageTitle="Profile Transfer">
      <div className="bg-gray-50">
        <AnimalList />
      </div>
    </FarmerLayout>
  );
}
