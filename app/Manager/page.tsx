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
import { use, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { DateRange, DayPicker } from "react-day-picker";
import { Canvas } from "skia-canvas";
import "react-day-picker/dist/style.css";
import { el } from "react-day-picker/locale";
import { start } from "repl";

type tableEntry = {
  id: number;
  name: String;
  number_of_orders: String;
};

export default function TrendsPage() {
  // make variable to hold time frame selected from the day picker object
  const [timeFrame, setTimeFrame] = useState<DateRange>();
  const [allTime, setAllTime] = useState(true);

  let startDate: String | null = null;
  let endDate: String | null = null;
  const [piChart, setPiChart] = useState<Chart>();
  const [barChart, setBarChart] = useState<Chart>();
  const [receiptLineChart, setReceiptLineChart] = useState<Chart>();
  const [averageReceiptChart, setAverageReceiptChart] = useState<Chart>();

  useEffect(() => {
    createPiChart();
    createBarChart();
    createReceiptLineChart();
    redrawAverageReceiptChart();
  }, []);


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

    redrawPiChart();
    redrawBarChart();
    redrawReceiptLineChart();
    // redrawAverageReceiptChart();
  }

  function updateDates() {
    startDate = `${timeFrame?.from?.toISOString().split("T")[0]}`;
    endDate = `${timeFrame?.to?.toISOString().split("T")[0]}`;

    redrawPiChart();
    redrawBarChart();
    redrawReceiptLineChart();
    // redrawAverageReceiptChart();
  }

  // function called on first creation of piChart
  // first time is always allTime data
  async function createPiChart() {
    const result = await fetch(
      "http://localhost:3000/api/food-and-drink-count/?allTime=true",
    );

    const data = await result.json();

    //console.log(data);
    const numberSold = data.data.map((item) => item.number_of_orders);
    const itemNames = data.data.map((item) => item.name);

    const piData = {
      labels: itemNames,
      datasets: [
        {
          data: numberSold,
        },
      ],
    };

    const canvas = document.getElementById("piChart");
    const piContext = canvas?.getContext("2d");

    // pi chart does not exist. create one
    setPiChart(
      new Chart(piContext, {
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
      }),
    );
  }

  // function in charge of getting new data and redrawing the chart
  async function redrawPiChart() {
    let result;

    if (allTime) {
      result = await fetch(
        "http://localhost:3000/api/food-and-drink-count/?allTime=true",
      );
    } else {
      result = await fetch(
        `http://localhost:3000/api/food-and-drink-count/?startDate=${startDate}&endDate=${endDate}`,
      );
    }

    const data = await result.json();

    // console.log(data);

    let itemNames = [];
    let numberSold = [];
    if (data.data && data.data.length !== 0) {
      // data exists
      itemNames = data.data.map((item) => item.name);
      numberSold = data.data.map((item) => item.number_of_orders);
    }

    let piData = {
      labels: itemNames,
      datasets: [
        {
          data: numberSold,
        },
      ],
    };

    //console.log("made it");
    //console.log(piChart);

    if (piChart) {
      //console.log("updating");
      piChart.data.labels = piData.labels;
      piChart.data.datasets = [{ data: numberSold }];
      piChart.update();
    }
  }

  async function createBarChart() {
    let incomeRequest = await fetch(
      "http://localhost:3000/api/income/?allTime=true",
    );
    let expenseRequest = await fetch(
      "http://localhost:3000/api/expenses/?allTime=true",
    );

    // get income
    const incomeData = await incomeRequest.json();
    const incomes = incomeData.data.map((item) => item.income);
    const dates = incomeData.data.map((item) => item.month + "/" + item.year);

    // get expenses
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

    const canvas = document.getElementById("barChart");
    const barContext = canvas?.getContext("2d");

    setBarChart(
      new Chart(barContext, {
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
      }),
    );
  }

  // Income and expenses
  async function redrawBarChart() {
    let incomeRequest;
    let expenseRequest;

    if (allTime) {
      incomeRequest = await fetch(
        "http://localhost:3000/api/income/?allTime=true",
      );
      expenseRequest = await fetch(
        "http://localhost:3000/api/expenses/?allTime=true",
      );
    } else {
      incomeRequest = await fetch(
        `http://localhost:3000/api/income?startDate=${startDate}&endDate=${endDate}`,
      );
      expenseRequest = await fetch(
        `http://localhost:3000/api/expenses?startDate=${startDate}&endDate=${endDate}`,
      );
    }

    let incomes = [];
    let expenses = [];
    let dates = [];

    // get income
    const incomeData = await incomeRequest.json();

    if (incomeData.data && incomeData.data.length !== 0) {
      // data exists
      incomes = incomeData.data.map((item) => item.income);
      dates = incomeData.data.map((item) => item.month + "/" + item.year);
    }

    // get expenses
    const expenseData = await expenseRequest.json();

    if (expenseData.data && expenseData.data.length !== 0) {
      // data exists
      expenses = expenseData.data.map((item) => item.expense);
    }

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

    if (barChart) {
      barChart.data.labels = barData.labels;
      barChart.data.datasets.forEach((dataset, i) => {
        dataset.data = barData.datasets[i].data;
      });
      barChart.update();
    }
  }

  // function to create receipt line chart for the first time. Displays all time data
  async function createReceiptLineChart() {
    const request = await fetch(
        "http://localhost:3000/api/receipt-count/?allTime=true",
      );

    // get receipts
    const data = await request.json();

    let receiptCount = [];
    let dates = [];
    if (data.data && data.data.length !== 0) {
      receiptCount = data.data.map((item) => item.receipts);
      dates = data.data.map((item) => item.month + "/" + item.year);
    }

    const receiptLineData = {
      labels: dates,
      datasets: [
        {
          label: "Receipts",
          data: receiptCount,
        },
      ],
    };
    
    const canvas = document.getElementById("receiptLineChart");
    const receiptLineContext = canvas?.getContext("2d");

    setReceiptLineChart(
      new Chart(receiptLineContext, {
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
      }),
    );
  }

  // Receipt count
  async function redrawReceiptLineChart() {
    let request;

    if (allTime) {
      request = await fetch(
        "http://localhost:3000/api/receipt-count/?allTime=true",
      );
    } else {
      request = await fetch(
        `http://localhost:3000/api/receipt-count/?startDate=${startDate}&endDate=${endDate}`,
      );
    }

    // get receipts
    const data = await request.json();

    let receiptCount = [];
    let dates = [];
    if (data.data && data.data.length !== 0) {
      receiptCount = data.data.map((item) => item.receipts);
      dates = data.data.map((item) => item.month + "/" + item.year);
    }
    
    const receiptLineData = {
      labels: dates,
      datasets: [
        {
          label: "Receipts",
          data: receiptCount,
        },
      ],
    };

    if (receiptLineChart) {
      receiptLineChart.data.labels = receiptLineData.labels;
      receiptLineChart.data.datasets.forEach((dataset) => {
        dataset.label = receiptLineData.datasets[0].label;
        dataset.data = receiptLineData.datasets[0].data;
      });
      receiptLineChart.update();
    }
  }

  

  // Avg receipts per hour
  async function redrawAverageReceiptChart() {
    let request;

    if (allTime) {
      request = await fetch(
        "http://localhost:3000/api/receipts-per-hour/?allTime=true",
      );
    } else {
      request = await fetch(
        "http://localhost:3000/api/receipts-per-hour/?startDate=${startDate}&endDate=${endDate}",
      );
    }

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
    const averageReceiptContext = canvas?.getContext("2d");

    if (averageReceiptChart) {
      averageReceiptChart.destroy();
    }

    setAverageReceiptChart(
      new Chart(averageReceiptContext, {
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
      }),
    );
  }

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
            <button onClick={updateDates}>Update Graphs</button>
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
            Selected: {startDate} to {endDate}
          </h1>
        )}
      </div>
    </div>
  );
}

/*


*/
