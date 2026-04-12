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
import { Canvas } from "skia-canvas";

type tableEntry = {
  id: number;
  name: String;
  frequency: number;
};

export default function TrendsPage() {
  // make buttons for time frame selection
  const [startMonth, setStartMonth] = useState('-');
  const [startDay, setStartDay] = useState('-');
  const [startYear, setStartYear] = useState('-');
  const [endMonth, setEndMonth] = useState('-');
  const [endDay, setEndDay] = useState('-');
  const [endYear, setEndYear] = useState('-');


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
      <div className="flex flex-wrap">
        <h3>Select Time Frame:</h3>
        <label>
          Start Month:
          <select value={startMonth} onChange={e => setStartMonth(e.target.value)}>
            <option value="01">January</option>
            <option value="02">February</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </label>
        <label>
          Start Day:
          <select value={startDay} onChange={e => setStartDay(e.target.value)}>
            <option value="01">1</option>
            <option value="02">2</option>
            <option value="03">3</option>
            <option value="04">4</option>
            <option value="05">5</option>
            <option value="06">6</option>
            <option value="07">7</option>
            <option value="08">8</option>
            <option value="09">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
          </select>
        </label>
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
    </div>
    
  );
}
