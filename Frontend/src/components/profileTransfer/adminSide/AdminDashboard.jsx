import AdminLayout from './AdminLayout';
import StatsCard from './StatsCard';
import TransferTable from './TransferTable';

const stats = [
  { value: 3, label: 'Pending Transfers', color: 'yellow' },
  { value: 1, label: 'Approved Transfer', color: 'blue' },
  { value: 1, label: 'Rejected Transfer', color: 'red' },
  { value: 5, label: 'Total Transfers', color: 'green' }
];

const tableData = [
  {
    animalTag: 'TD-901',
    from: 'John Muangi',
    to: 'Grace Njuguna',
    status: 'Pending',
    date: '2025-02-18',
    action: 'Review'
  },
  {
    animalTag: 'TD-902',
    from: 'John Muangi',
    to: 'Peter Ochieng',
    status: 'Receiver Approved',
    date: '2025-02-05',
    action: 'Review'
  },
  {
    animalTag: 'TD-903',
    from: 'John Muangi',
    to: 'Mary Akinyi',
    status: 'Admin Approved',
    date: '2025-02-05',
    action: 'Review'
  },
  {
    animalTag: 'TD-904',
    from: 'John Muangi',
    to: 'David Kamau',
    status: 'Rejected',
    date: '2025-02-03',
    action: 'Review'
  },
  {
    animalTag: 'TD-905',
    from: 'Peter Ochieng',
    to: 'John Mwangi',
    status: 'Pending',
    date: '2025-02-12',
    action: 'Review'
  }
];

function AdminDashboard() {
  return (
    <AdminLayout>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of all ownership transfer requests</p>
      </div>

      {/* Content */}
      <div className="p-8 bg-emerald-50">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} value={stat.value} label={stat.label} color={stat.color} />
          ))}
        </div>

        {/* Transfers Table */}
        <TransferTable data={tableData} />
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
