import { useNavigate } from 'react-router-dom';
import { FiXCircle } from 'react-icons/fi';

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <FiXCircle className="text-red-600" size={64} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        
        <p className="text-gray-600 mb-6">
          Unfortunately, your payment could not be processed. This could be due to:
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Payment was cancelled</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Insufficient balance in your eSewa account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Network or connection issues</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Technical error during payment processing</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/appointments/request')}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            Try Again
          </button>
          
          <button
            onClick={() => navigate('/appointments')}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Go to Appointments
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Need help? Contact support for assistance.
        </p>
      </div>
    </div>
  );
};

export default PaymentFailure;
