"use client";
import React, { useState, useEffect } from 'react';

// NOTE: In a real Next.js app, the database logic should be in an 
// API route or Server Action. This UI will fetch from those endpoints.

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'X' | 'Z'>('X');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [zFinalized, setZFinalized] = useState(false);

  // 1. Fetch X-Report Data
  const fetchXReport = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint e.g., /api/manager/reports/x
      const response = await fetch('/api/manager/reports/x');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error("Failed to fetch X report", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Run Z-Report (The Reset)
  const handleRunZReport = async () => {
    const confirmed = window.confirm(
      "CRITICAL: This will finalize all daily totals and RESET the database for tomorrow. Continue?"
    );
    if (confirmed) {
      setLoading(true);
      try {
        // This endpoint should perform the SQL Transaction (Sum -> Archive -> Delete)
        await fetch('/api/manager/reports/z', { method: 'POST' });
        setZFinalized(true);
      } catch (error) {
        alert("Error resetting database totals.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'X') fetchXReport();
  }, [activeTab]);

  return (
    <main className="min-h-screen p-8 bg-[var(--secondary)] text-black pt-24">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        
        {/* Navigation Tabs */}
        <div className="flex bg-[var(--dark)] text-white">
          <button 
            onClick={() => setActiveTab('X')}
            className={`flex-1 py-5 font-bold transition-all ${activeTab === 'X' ? 'bg-[var(--primary)] text-white' : 'hover:bg-gray-700'}`}
          >
            X-Report (Hourly Snapshot)
          </button>
          <button 
            onClick={() => setActiveTab('Z')}
            className={`flex-1 py-5 font-bold transition-all ${activeTab === 'Z' ? 'bg-[var(--accent)] text-black' : 'hover:bg-gray-700'}`}
          >
            Z-Report (Close Day)
          </button>
        </div>

        <div className="p-10">
          {activeTab === 'X' ? (
            <div className="space-y-8">
              <header className="flex justify-between items-center border-b pb-4">
                <h2 className="text-3xl font-serif">Daily Sales Snapshot</h2>
                <button onClick={fetchXReport} className="text-sm text-[var(--primary)] font-bold hover:underline">
                  ↻ Refresh Feed
                </button>
              </header>

              {loading ? <p>Loading activity...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Detailed Hourly List */}
                  <div className="md:col-span-2 border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 uppercase text-xs font-bold text-gray-500">
                        <tr>
                          <th className="p-4">Time Window</th>
                          <th className="p-4">Sales Volume</th>
                          <th className="p-4">Voids/Returns</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {/* Example of how mapped data will look */}
                        <tr className="hover:bg-gray-50">
                          <td className="p-4 font-mono">11:00 AM - 12:00 PM</td>
                          <td className="p-4 font-bold">$245.50</td>
                          <td className="p-4 text-red-500">2 Voids</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-[var(--secondary)] bg-opacity-30 p-6 rounded-xl border border-[var(--secondary)]">
                    <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-600">Total Activities</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span>Gross Sales:</span><span className="font-bold">$0.00</span></div>
                      <div className="flex justify-between"><span>Taxes:</span><span className="font-bold">$0.00</span></div>
                      <div className="flex justify-between text-red-600"><span>Returns:</span><span>-$0.00</span></div>
                      <hr className="border-gray-300" />
                      <div className="flex justify-between text-xl font-bold"><span>Net Cash:</span><span>$0.00</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-serif text-red-700 uppercase tracking-tight">End of Day Closeout</h2>
              <p className="text-gray-600">
                This report calculates final totals for all payment methods and <span className="font-bold underline text-black">resets daily values in the database.</span>
              </p>

              {!zFinalized ? (
                <button 
                  onClick={handleRunZReport}
                  disabled={loading}
                  className="w-full py-5 bg-[var(--dark)] text-white rounded-xl font-black text-lg hover:bg-black transition-all shadow-lg active:scale-95"
                >
                  {loading ? "PROCESSING RESET..." : "GENERATE Z-REPORT & RESET DAY"}
                </button>
              ) : (
                <div className="p-8 bg-green-50 border-2 border-green-500 rounded-2xl">
                  <h3 className="text-green-800 text-2xl font-bold">✓ DAY CLOSED</h3>
                  <p className="mt-2 text-sm text-green-700">Database totals have been cleared. All registers reset to $0.00.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
