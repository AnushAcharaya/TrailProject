// pages/profile-transfer/ReceivedRequests.jsx
import FarmerLayout from '../../../components/farmerDashboard/FarmerLayout';
import ReceivedRequests from '../../../components/profileTransfer/receiverSide/ReceivedRequests';
import '../../../styles/profileTransfer/receiverSide/receivedRequests.css';

export default function ReceivedRequestsPage() {
  return (
    <FarmerLayout pageTitle="Profile Transfer">
      <div className="bg-gray-50">
        <ReceivedRequests />
      </div>
    </FarmerLayout>
  );
}
