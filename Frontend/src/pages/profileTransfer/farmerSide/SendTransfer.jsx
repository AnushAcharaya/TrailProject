// pages/profile-transfer/SendTransfers.jsx
import FarmerLayout from '../../../components/farmerDashboard/FarmerLayout';
import SendTransfers from '../../../components/profileTransfer/farmerSide/sendTransfer/SendTransfer';
import '../../../styles/profileTransfer/farmerSide/sendTransfer.css';

export default function SendTransfersPage() {
  return (
    <FarmerLayout pageTitle="Profile Transfer">
      <div className="bg-gray-50">
        <SendTransfers />
      </div>
    </FarmerLayout>
  );
}
