export default function Dashboard() {
  return (
    <div className="space-y-6 bg-gray-50 h-[100vh]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
        <p className="text-gray-600">Welcome to your dashboard. Select a report from the sidebar to view data.</p>
      </div>
    </div>
  );
} 