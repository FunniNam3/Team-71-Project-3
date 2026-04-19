"use client";

import { useState } from 'react';

// Added 'Sales' to the type definition
export default function ReportModule({ type }: { type: 'X' | 'Z' | 'Sales' }) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/Manager/Reports/api?type=${type}`);
      const result = await response.json();

      if (response.ok) {
        if (type === 'Sales') {
          // Formatting for the Item Sales Count
          let reportOutput = `# ITEM SALES REPORT\n`;
          reportOutput += `Generated: ${new Date().toLocaleString()}\n`;
          reportOutput += `-----------------------------------\n`;
          reportOutput += `| Item Name | Quantity Sold | Total Sales |\n`;
          reportOutput += `|-----------|---------------|-------------|\n`;

          // Iterate through the item list returned by the API
          result.data.items.forEach((item: any) => {
            reportOutput += `| ${item.name.padEnd(10)} | ${String(item.quantity).padEnd(13)} | $${item.total.toFixed(2)} |\n`;
          });

          console.log(reportOutput);
          alert(reportOutput);
        } else {
          // Your existing X/Z Report formatting
          const d = result.data;
          const reportOutput = `
# ${type}-REPORT
Generated: ${new Date().toLocaleString()}
-----------------------------------
### SALES SUMMARY
* Gross Sales: $${Number(d.gross_sales || 0).toFixed(2)}
* Total Transactions: ${d.total_transactions || 0}
          `;
          alert(reportOutput);
        }
      }
    } catch (err) {
      alert("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg flex justify-between items-center shadow-lg">
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-widest text-white">
          {type === 'Sales' ? 'SALES REPORT' : `${type}-REPORT`}
        </span>
        <span className="text-xs text-gray-400 mt-1">
          {type === 'Sales' ? 'Itemized Sales Count' : type === 'X' ? 'Current Sales Snapshot' : 'End of Shift Closeout'}
        </span>
      </div>
      <button 
        onClick={handleGenerate}
        disabled={loading}
        className={`${
          type === 'Sales' ? 'bg-green-600 hover:bg-green-700' : 
          type === 'X' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
        } text-white px-8 py-2 rounded-md font-bold transition-all disabled:opacity-50 shadow-md`}
      >
        {loading ? '...' : 'Generate'}
      </button>
    </div>
  );
}