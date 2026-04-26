"use client";

import { useState } from "react";
import { XReportResponse } from "../api/reports/x/route";
import { ZReportResponse } from "../api/reports/z/route";
import { SalesReportResponse } from "../api/reports/sales/route";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export default function ReportModule({
  type,
  dateRange,
}: {
  type: "x" | "z" | "sales";
  dateRange?: { startDate: Date; endDate: Date };
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showZConfirmDialog, setShowZConfirmDialog] = useState(false);

  const handleZReportConfirm = async () => {
    setShowZConfirmDialog(false);
    await proceedWithGenerate();
  };

  const handleGenerate = async () => {
    if (type === "z") {
      // Check if there are open receipts and show confirmation
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/reports/check-open-receipts");
        const data = await response.json();

        if (!data.hasOpenReceipts) {
          setError(
            "There are no open transactions. Z-Report cannot be generated.",
          );
          setLoading(false);
          return;
        }

        setLoading(false);

        setShowZConfirmDialog(true);
      } catch (err) {
        setError("Failed to check open receipts");
        setLoading(false);
      }
    } else {
      setLoading(true);
      setError(null);
      await proceedWithGenerate();
    }
  };

  const proceedWithGenerate = async () => {
    try {
      let url = `/api/reports/${type}`;

      // Add date range for sales report
      if (type === "sales" && dateRange) {
        const start = dateRange.startDate.toISOString().split("T")[0];
        const end = dateRange.endDate.toISOString().split("T")[0];
        url += `?startDate=${start}&endDate=${end}`;
      }

      // For Z-Report, first generate the report, then close receipts
      if (type === "z") {
        // Generate the report first
        const getResponse = await fetch(url, { method: "GET" });
        const reportData = await getResponse.json();

        if (!getResponse.ok) {
          throw new Error(reportData.error || "Failed to generate Z-Report");
        }

        // Generate and download the report
        const reportOutput = generateZReport(reportData);
        downloadReport(reportOutput, type);

        // Then close all receipts
        const postResponse = await fetch(url, { method: "POST" });
        const closeResult = await postResponse.json();

        if (!postResponse.ok) {
          throw new Error(closeResult.error || "Failed to close receipts");
        }

        // Show success message with number of receipts closed
        setError(null);
      } else {
        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to generate report");
        }

        let reportOutput = "";

        if (type === "sales") {
          const salesData = result as SalesReportResponse;
          reportOutput = generateSalesReport(salesData);
        } else if (type === "x") {
          const xData = result as XReportResponse;
          reportOutput = generateXReport(xData);
        }

        downloadReport(reportOutput, type);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to generate report";
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateXReport = (data: XReportResponse): string => {
    const summary = data.data.summary;
    const payments = data.data.paymentMethods;

    let output = `X REPORT\n`;
    output += `Generated: ${new Date(data.timestamp).toLocaleString()}\n`;
    output += `═══════════════════════════════════════════════\n\n`;

    output += `SALES SUMMARY\n`;
    output += `─────────────────────────────────────────────\n`;
    output += `Total Transactions:     ${summary.total_transactions}\n`;
    output += `Gross Sales:            ${formatCurrency(summary.gross_sales)}\n`;
    output += `Net Sales:              ${formatCurrency(summary.net_sales)}\n`;
    output += `Food Sales:             ${formatCurrency(summary.total_food_sales)}\n`;
    output += `Drink Sales:            ${formatCurrency(summary.total_drink_sales)}\n`;
    output += `Food Items:             ${summary.total_food_items}\n`;
    output += `Drink Items:            ${summary.total_drink_items}\n\n`;

    output += `PAYMENT METHODS\n`;
    output += `─────────────────────────────────────────────\n`;
    output += `Method                  | Trans. | Gross Sales | Net Sales\n`;
    output += `────────────────────────|────────|─────────────|───────────\n`;
    payments.forEach((payment) => {
      output += `${String(payment.payment_method).padEnd(24)}| ${String(payment.total_transactions).padEnd(6)} | ${String(formatCurrency(payment.gross_sales)).padEnd(11)} | ${formatCurrency(payment.net_sales)}\n`;
    });

    return output;
  };

  const generateZReport = (data: ZReportResponse): string => {
    const summary = data.data.summary;
    const payments = data.data.paymentMethods;

    let output = `Z REPORT (END OF SHIFT)\n`;
    output += `Generated: ${new Date(data.timestamp).toLocaleString()}\n`;
    output += `═══════════════════════════════════════════════\n\n`;

    output += `SHIFT SUMMARY\n`;
    output += `─────────────────────────────────────────────\n`;
    output += `Receipt Range:          ${summary.first_receipt} - ${summary.last_receipt}\n`;
    output += `Total Transactions:     ${summary.total_transactions}\n`;
    output += `Valid Transactions:     ${summary.valid_transactions}\n`;
    output += `Void Transactions:      ${summary.void_transactions}\n`;
    output += `Gross Sales:            ${formatCurrency(summary.gross_sales)}\n`;
    output += `Net Sales:              ${formatCurrency(summary.net_sales)}\n`;
    output += `Void Amount:            ${formatCurrency(summary.void_amount)}\n\n`;

    output += `PAYMENT METHODS\n`;
    output += `─────────────────────────────────────────────\n`;
    output += `Method                  | Trans. | Gross Sales | Net Sales\n`;
    output += `────────────────────────|────────|─────────────|───────────\n`;
    payments.forEach((payment) => {
      output += `${String(payment.payment_method).padEnd(24)}| ${String(payment.total_transactions).padEnd(6)} | ${String(formatCurrency(payment.gross_sales)).padEnd(11)} | ${formatCurrency(payment.net_sales)}\n`;
    });

    return output;
  };

  const generateSalesReport = (data: SalesReportResponse): string => {
    const summary = data.data.summary;
    const items = data.data.items;
    const payments = data.data.paymentMethods;

    let output = `SALES REPORT\n`;
    output += `Generated: ${new Date(data.timestamp).toLocaleString()}\n`;
    output += `Period: ${data.dateRange.startDate} to ${data.dateRange.endDate}\n`;
    output += `═══════════════════════════════════════════════\n\n`;

    output += `SALES SUMMARY\n`;
    output += `─────────────────────────────────────────────\n`;
    output += `Total Transactions:     ${summary.total_transactions}\n`;
    output += `Valid Transactions:     ${summary.valid_transactions}\n`;
    output += `Void Transactions:      ${summary.void_transactions}\n`;
    output += `Gross Sales:            ${formatCurrency(summary.gross_sales)}\n`;
    output += `Net Sales:              ${formatCurrency(summary.net_sales)}\n`;
    output += `Void Amount:            ${formatCurrency(summary.void_amount)}\n\n`;

    output += `ITEM SALES\n`;
    output += `─────────────────────────────────────────────\n`;
    output += `Item Name               | Quantity | Total Sales\n`;
    output += `────────────────────────|──────────|─────────────\n`;
    items.forEach((item) => {
      output += `${String(item.name).padEnd(24)}| ${String(item.quantity).padEnd(8)} | ${formatCurrency(item.total_sales)}\n`;
    });

    output += `\nPAYMENT METHODS\n`;
    output += `─────────────────────────────────────────────\n`;
    output += `Method                  | Trans. | Gross Sales | Net Sales\n`;
    output += `────────────────────────|────────|─────────────|───────────\n`;
    payments.forEach((payment) => {
      output += `${String(payment.payment_method).padEnd(24)}| ${String(payment.total_transactions).padEnd(6)} | ${String(formatCurrency(payment.gross_sales)).padEnd(11)} | ${formatCurrency(payment.net_sales)}\n`;
    });

    return output;
  };

  const downloadReport = (content: string, reportType: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportType}_${new Date().toISOString().split("T")[0]}_${new Date().toLocaleTimeString().replace(/:/g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getReportLabel = (): string => {
    switch (type) {
      case "x":
        return "X REPORT";
      case "z":
        return "Z REPORT";
      case "sales":
        return "SALES REPORT";
      default:
        return "REPORT";
    }
  };

  const getReportDescription = (): string => {
    switch (type) {
      case "x":
        return "Current Sales Snapshot";
      case "z":
        return "End of Shift Closeout";
      case "sales":
        return "Itemized Sales by Item";
      default:
        return "";
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex flex-col bg-(--primary) w-full p-6 rounded-lg justify-center shadow-lg hover:cursor-pointer disabled:cursor-not-allowed transition-colors"
      >
        <span className="text-xl font-bold tracking-widest text-white">
          {loading ? "Generating..." : `Generate ${getReportLabel()}`}
        </span>
        <span className="text-xs text-blue-100 mt-1">
          {getReportDescription()}
        </span>
      </button>
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Z-Report Confirmation Dialog */}
      {showZConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Z-Report
            </h2>
            <p className="text-gray-700 mb-6">
              Generating a Z-Report will close all open transactions and create
              a permanent record of today's shift.
            </p>
            <p className="text-gray-700 mb-6 font-semibold">
              This action cannot be undone. Continue?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowZConfirmDialog(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleZReportConfirm}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {loading ? "Generating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
