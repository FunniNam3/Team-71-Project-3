"use client";

import { useState } from 'react';

// Added 'Sales' to the type definition
export default function ReportModule({ type }: { type: 'X' | 'Z' | 'Sales' }) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Fetching from the new hierarchy: /api/reports
      const response = await fetch(`/api/reports?type=${type}`);
      const result = await response.json();

      if (response.ok) {
        let reportOutput = "";
        
        if (type === 'Sales') {
          reportOutput = `# ITEM SALES REPORT\n`;
          reportOutput += `Generated: ${new Date().toLocaleString()}\n`;
          reportOutput += `-----------------------------------\n`;
          reportOutput += `| Item Name | Quantity Sold |\n`;
          reportOutput += `|-----------|---------------|\n`;

          // result.rows matches the database query structure in your new route
          result.forEach((item: any) => {
            reportOutput += `| ${item.name.padEnd(10)} | ${String(item.count).padEnd(13)} |\n`;
          });
        } else {
          reportOutput = `
# ${type}-REPORT
Generated: ${new Date().toLocaleString()}
-----------------------------------
### SALES SUMMARY
* Gross Sales: $${Number(result.gross_sales || 0).toFixed(2)}
* Total Transactions: ${result.total_transactions || 0}
          `;
        }

        // --- NEW DOWNLOAD LOGIC ---
        // 1. Create a "Blob" (the actual file data)
        const blob = new Blob([reportOutput], { type: 'text/plain' });
        
        // 2. Create a temporary URL for the file
        const url = window.URL.createObjectURL(blob);
        
        // 3. Create a hidden link and "click" it
        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}_Report_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        
        // 4. Clean up the DOM and the URL
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        // ---------------------------

      }
    } catch (err) {
      console.error(err);
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