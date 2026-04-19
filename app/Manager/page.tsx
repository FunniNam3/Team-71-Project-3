import ReportModule from './ReportModule';
export default function ManagerDashboard() {
  return (
    <main className="p-10 bg-black min-h-screen text-white">
      <h1 className="text-4xl font-extrabold mb-10">Manager Dashboard</h1>
      
      {/* This is the "Bottom Object" layout section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20 border-t border-gray-800 pt-10">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Daily Snapshots</h2>
          <ReportModule type="X" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">End of Shift</h2>
          <ReportModule type="Z" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Sales Report</h2>
          <ReportModule type="Sales" />
        </div>
      </section>
    </main>
  );
}
