// app/Manager/page.tsx
import ReportModule from './ReportModule';

export default function ManagerDashboard() {
  return (
    <main className="min-h-screen bg-[#C4AF9A] font-sans pb-20">
      {/* Manual Header to replace missing Navbar */}
      <nav className="w-full py-6 px-8 flex justify-between items-center bg-transparent">
         <div className="text-white text-2xl font-bold">B</div>
         <div className="flex gap-4">
            <button className="bg-[#1fa57e] text-white px-6 py-2 rounded-full font-medium">Portal</button>
            <button className="bg-[#1fa57e] text-white px-6 py-2 rounded-full font-medium">Order</button>
         </div>
      </nav>
      
      <div className="max-w-4xl mx-auto px-4 mt-12 text-center">
        <h1 className="text-6xl font-medium text-white mb-16 drop-shadow-sm">
          Manager Dashboard
        </h1>
        
        <section className="flex flex-col items-center gap-10 text-white">
          <div className="w-full max-w-xl bg-[#1fa57e] p-10 rounded-[45px] shadow-xl">
            <h2 className="text-3xl font-semibold mb-2">Daily Snapshots</h2>
            <p className="text-sm opacity-80 mb-6 italic">X-Report: Real-time sales view</p>
            <ReportModule type="X" />
          </div>

          <div className="w-full max-w-xl bg-[#1fa57e] p-10 rounded-[45px] shadow-xl">
            <h2 className="text-3xl font-semibold mb-2">End of Shift</h2>
            <p className="text-sm opacity-80 mb-6 italic">Z-Report: Close out registers</p>
            <ReportModule type="Z" />
          </div>

          <div className="w-full max-w-xl bg-[#1fa57e] p-10 rounded-[45px] shadow-xl">
            <h2 className="text-3xl font-semibold mb-2">Sales Report</h2>
            <p className="text-sm opacity-80 mb-6 italic">Inventory & Item tracking</p>
            <ReportModule type="Sales" />
          </div>
        </section>
      </div>
    </main>
  );
}