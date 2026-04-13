// This work is dedicated to the Holy Family. To Jesus, Mary and St. Joseph!

// installed chart.js skia-canvas react-day-picker and react-chartjs-2

"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Chart,
  plugins,
} from "chart.js/auto";
import { color } from "chart.js/helpers";
import { create } from "domain";
import { title } from "process";
import { use, useState } from "react";
import { Line } from "react-chartjs-2";
import { DateRange, DayPicker } from "react-day-picker";
import { Canvas } from "skia-canvas";
import "react-day-picker/dist/style.css";

type tableEntry = {
  id: number;
  name: String;
  frequency: number;
};

export default function TrendsPage() {
  // make variable to hold time frame selected from the day picker object
  const [timeFrame, setTimeFrame] = useState<DateRange>();
  const [allTime, setAllTime] = useState(true);

  // // create variables and functions to hold and set chart data
  // // pi chart for food and drink count sold in time period
  // const [piData, setPiData] = useState<any>(null);
  // // line chart of avg receipt purchase time in time period
  // const [timeData, setTimeData] = useState<any>(null);
  // // bar chart of monthly revenue and expense in time period
  // const [salesData, setSalesData] = useState<any>(null);
  // // line chart of number of receipts per month in time period
  // const [receiptData, setReceiptData] = useState<any>(null);
  // // Fill in data for weekly most frequently purchased table
  // const [tableEntry, setTableEntry] = useState<tableEntry[]>([]);

  // // loading variable to keep track of if still waiting on api request
  // // When set to false, safe to create graphs and display
  // const [loading, setLoading] = useState(true);

  // async function getWeeklyData() {
  //   try {
  //     // get weekly most frequently purchased items
  //     const weeklyData = await fetch('http://localhost:3000/api/food-and-drink-count?weekly=true');

  //   }
  //   catch (error) {
  //     console.error(error.message);
  //   }

  // }

  // button to toggle on view of calendar for date selection
  function toggleCalendar() {
    if (allTime) {
      setAllTime(false);
    }
  }

  // Button to toggle on all time data view
  function toggleAllTime() {
    if (!allTime) {
      setAllTime(true);
    }
  }

  // set up pi chart for items bought
  async function redrawPiChart() {
    const request = await fetch(
      "http://localhost:3000/api/food-and-drink-count/?allTime=true",
    );
    const data = await request.json();

    const itemNames = data.data.map((item) => item.name);
    const numberSold = data.data.map((item) => item.number_of_orders);

    const piData = {
      labels: itemNames,
      datasets: [
        {
          data: numberSold,
        },
      ],
    };

    createPiChart(piData);
  }

  function createPiChart(piData) {
    const canvas = document.getElementById("piChart");
    const piContext = canvas.getContext("2d");

    const piChart = new Chart(piContext, {
      type: "doughnut",
      data: piData,
      options: {
        plugins: {
          title: {
            display: true,
            text: "Items Sold by Type",
            font: {
              size: 20,
            },
          },
          legend: {
            display: false,
          },
        },
      },
    });
  }

  redrawPiChart();

  // Income and expenses
  async function redrawBarChart() {
    // get income
    const incomeRequest = await fetch(
      "http://localhost:3000/api/income/?allTime=true",
    );
    const incomeData = await incomeRequest.json();

    const incomes = incomeData.data.map((item) => item.income);
    const dates = incomeData.data.map((item) => item.month + "/" + item.year);

    // get expenses
    const expenseRequest = await fetch(
      "http://localhost:3000/api/expenses/?allTime=true",
    );
    const expenseData = await expenseRequest.json();

    const expenses = expenseData.data.map((item) => item.expense);

    const barData = {
      labels: dates,
      datasets: [
        {
          label: "Income",
          data: incomes,
          backgroundColor: "rgba(119, 221, 119, 1.0)",
        },
        {
          label: "Expense",
          data: expenses,
          backgroundColor: "rgba(255, 105, 97, 1.0)",
        },
      ],
    };

    createBarChart(barData);
  }

  function createBarChart(barData) {
    const canvas = document.getElementById("barChart");
    const barContext = canvas.getContext("2d");

    const barChart = new Chart(barContext, {
      type: "bar",
      data: barData,
      options: {
        plugins: {
          title: {
            display: true,
            text: "Monthly Revenue",
            font: {
              size: 20,
            },
          },
        },
        scales: {
          y: {
            ticks: {
              // adds dollar sign to y values since measuring money
              callback: function (value, index, ticks) {
                return "$" + value;
              },
            },
          },
        },
      },
    });
  }

  redrawBarChart();

  // Receipt count
  async function redrawReceiptLineChart() {
    // get income
    const request = await fetch(
      "http://localhost:3000/api/receipt-count/?allTime=true",
    );
    const data = await request.json();

    const receiptCount = data.data.map((item) => item.receipts);
    const dates = data.data.map((item) => item.month + "/" + item.year);

    const receiptLineData = {
      labels: dates,
      datasets: [
        {
          label: "Receipts",
          data: receiptCount,
        },
      ],
    };

    createReceiptLineChart(receiptLineData);
  }

  function createReceiptLineChart(receiptLineData) {
    const canvas = document.getElementById("receiptLineChart");
    const receiptLineContext = canvas.getContext("2d");

    const receiptLineChart = new Chart(receiptLineContext, {
      type: "line",
      data: receiptLineData,
      options: {
        plugins: {
          title: {
            display: true,
            text: "Monthly Order Count",
            font: {
              size: 20,
            },
          },
          legend: {
            display: false,
          },
        },
      },
    });
  }

  redrawReceiptLineChart();

  // Avg receipts per hour
  async function redrawAverageReceiptChart() {
    // get income
    const request = await fetch(
      "http://localhost:3000/api/receipts-per-hour/?allTime=true",
    );
    const data = await request.json();

    const averageReceipts = data.data.map((item) => item.avg_receipts);
    const hours = data.data.map((item) => item.hour);

    const averageReceiptData = {
      labels: hours,
      datasets: [
        {
          label: "Average Receipts",
          data: averageReceipts,
          backgroundColor: "rgba(128, 0, 128, 1.0)",
          borderColor: "rgba(128, 0, 128, 1.0)",
        },
      ],
    };

    createAverageReceiptChart(averageReceiptData);
  }

  function createAverageReceiptChart(averageReceiptData) {
    const canvas = document.getElementById("averageReceiptChart");
    const averageReceiptContext = canvas.getContext("2d");

    const averageReceiptChart = new Chart(averageReceiptContext, {
      type: "line",
      data: averageReceiptData,
      options: {
        plugins: {
          title: {
            display: true,
            text: "Average Orders per Hour",
            font: {
              size: 20,
            },
          },
          legend: {
            display: false,
          },
        },
      },
    });
  }

  redrawAverageReceiptChart();

  return (
    <div>
      <div className="flex flex-wrap justify-center">
        {allTime && (
          <button onClick={toggleCalendar} className="mx-5">
            Select Time Frame
          </button>
        )}
        {!allTime && (
          <div id="calendar">
            <DayPicker
              animate
              mode="range"
              selected={timeFrame}
              onSelect={setTimeFrame}
              footer={
                timeFrame
                  ? `${timeFrame.from?.toLocaleDateString()}-${timeFrame.to?.toLocaleDateString()}`
                  : "Pick the first day"
              }
            />
          </div>
        )}
        <button onClick={toggleAllTime} className="mx-5">
          All Time Data
        </button>
      </div>
      <div className="flex flex-wrap justify-center">
        <div>
          <canvas className="max-h-3/2 mx-33" id="piChart"></canvas>
        </div>
        <div>
          <canvas className="w-2/1" id="barChart"></canvas>
        </div>
        <div>
          <canvas className="w-2/1" id="receiptLineChart"></canvas>
        </div>
        <div>
          <canvas className="w-2/1" id="averageReceiptChart"></canvas>
        </div>
      </div>
      <div className="flex justify-center font-size-medium">
        {allTime && <h1>Selected: All Time Data</h1>}
        {!allTime && (
          <h1>
            Selected: {timeFrame?.from?.toLocaleDateString()}-
            {timeFrame?.to?.toLocaleDateString()}
          </h1>
        )}
      </div>
    </div>
  );
}

/*


*/
