"use client";
import React, { useState } from 'react';

interface ReportProps {
  type: 'X' | 'Z';
}

const ReportModule = ({ type }: ReportProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?type=${type}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch report", err);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl shadow-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold uppercase">{type}-Report</h3>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className={`${
            type === 'X' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
          } text-white px-4 py-2 rounded font-semibold transition disabled:opacity-50`}
        >
          {loading ? 'Running...' : 'Generate'}
        </button>
      </div>

      {data && (
        <div className="space-y-2 border-t border-gray-800 pt-4 animate-in fade-in duration-500">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Net Sales:</span>
            <span className="text-green-400 font-mono">${parseFloat(data.data.net_sales || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Transactions:</span>
            <span className="font-mono">{data.data.total_transactions}</span>
          </div>
          <p className="text-[10px] text-gray-600 italic mt-2 text-right">
            Synced: {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportModule;