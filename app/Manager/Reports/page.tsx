"use client";
import React, { useState } from 'react';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async (type: 'X' | 'Z') => {
    setLoading(true);
    const res = await fetch(`/api/reports?type=${type}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
    
    if(type === 'Z') alert("Z-Report generated: Register has been reset.");
  };

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold uppercase tracking-wider">Manager Reports</h1>
      </header>

      <div className="flex gap-4 justify-center mb-10">
        <button 
          onClick={() => generateReport('X')}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition"
        >
          Generate X-Report
        </button>
        <button 
          onClick={() => generateReport('Z')}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold transition"
        >
          Generate Z-Report (Reset)
        </button>
      </div>

      {data && (
        <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-700 p-8 rounded-xl">
          <h2 className="text-3xl font-bold mb-4 border-b border-gray-700 pb-2">
            {data.reportType}-Report Results
          </h2>
          <div className="space-y-4 text-xl">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Transactions:</span>
              <span>{data.data.total_transactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Gross Sales:</span>
              <span className="text-green-400">${parseFloat(data.data.gross_sales).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Net Sales:</span>
              <span className="text-green-500 font-bold">${parseFloat(data.data.net_sales).toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-500 mt-6 italic">Generated at: {data.timestamp}</p>
          </div>
        </div>
      )}
    </main>
  );
}