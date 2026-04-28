// This work is dedicated to the Holy Family. To Jesus, Mary and St. Joseph!

// installed chart.js skia-canvas react-day-picker and react-chartjs-2

"use client";

import { Chart } from "chart.js/auto";
import { useEffect, useRef, useState } from "react";
import { DateRange, DayPicker } from "react-day-picker";
import { useRouter } from "next/router";
import "react-day-picker/dist/style.css";

export default function TrendsPage() {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/login")
      .then((result) => result.json())
      .then((res) => {
        if (res.role !== "manager" && res.role !== "rev") {
          router.push("/Portal");
        }
      });
  }, []);
  // make variable to hold time frame selected from the day picker object
  const [timeFrame, setTimeFrame] = useState<DateRange>();
  const [allTime, setAllTime] = useState(true);
  const [viewCalendar, setViewCalendar] = useState(false);

  // const [piChart, setPiChart] = useState<Chart>();
  // const [barChart, setBarChart] = useState<Chart>();
  // const [receiptLineChart, setReceiptLineChart] = useState<Chart>();
  // const [averageReceiptChart, setAverageReceiptChart] = useState<Chart>();
  const piChart = useRef<Chart | null>(null);
  const barChart = useRef<Chart | null>(null);
  const receiptLineChart = useRef<Chart | null>(null);
  const averageReceiptChart = useRef<Chart | null>(null);

  useEffect(() => {
    createPiChart();
    createBarChart();
    createReceiptLineChart();
    createAverageReceiptChart();
  }, []);

  // button to toggle on view of calendar for date selection
  function toggleCalendar() {
    if (viewCalendar) {
      setViewCalendar(false);
    } else {
      setViewCalendar(true);
      setAllTime(false);
    }
  }

  // Button to toggle on all time data view
  function toggleAllTime() {
    setAllTime(true);
    redrawCharts();
  }

  function redrawCharts() {
    redrawPiChart();
    redrawBarChart();
    redrawReceiptLineChart();
    redrawAverageReceiptChart();
  }

  // function called on first creation of piChart
  // first time is always allTime data
  async function createPiChart() {
    const result = await fetch("/api/food-and-drink-count/?allTime=true");

    const data = await result.json();

    //console.log(data);
    const numberSold = data.data.map((item: any) => item.number_of_orders);
    const itemNames = data.data.map((item: any) => item.name);

    const piData = {
      labels: itemNames,
      datasets: [
        {
          data: numberSold,
        },
      ],
    };

    // pi chart does not exist. create one
    piChart?.current?.destroy();
    piChart.current = new Chart("piChart", {
      type: "doughnut",
      data: piData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
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

  // function in charge of getting new data and redrawing the chart
  async function redrawPiChart() {
    let result;

    if (allTime) {
      result = await fetch("/api/food-and-drink-count/?allTime=true");
    } else {
      const startDate = `${timeFrame?.from?.toISOString().split("T")[0]}`;
      const endDate = `${timeFrame?.to?.toISOString().split("T")[0]}`;

      result = await fetch(
        `/api/food-and-drink-count/?startDate=${startDate}&endDate=${endDate}`,
      );
    }

    const data = await result.json();

    let itemNames = [];
    let numberSold = [];
    if (data.data && data.data.length !== 0) {
      // data exists
      itemNames = data.data.map((item: any) => item.name);
      numberSold = data.data.map((item: any) => item.number_of_orders);
    }

    let piData = {
      labels: itemNames,
      datasets: [
        {
          data: numberSold,
        },
      ],
    };

    if (piChart.current) {
      piChart.current.data.labels = piData.labels;
      piChart.current.data.datasets = piData.datasets;
      piChart.current.options = {
        responsive: true,
        maintainAspectRatio: false,
      };
      piChart.current.update();
    }
  }

  async function createBarChart() {
    let incomeRequest = await fetch("/api/income/?allTime=true");
    let expenseRequest = await fetch("/api/expenses/?allTime=true");

    // get income
    const incomeData = await incomeRequest.json();
    const incomes = incomeData.data.map((item: any) => item.income);
    const dates = incomeData.data.map(
      (item: any) => item.month + "/" + item.year,
    );

    // get expenses
    const expenseData = await expenseRequest.json();
    const expenses = expenseData.data.map((item: any) => item.expense);

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

    barChart?.current?.destroy();
    barChart.current = new Chart("barChart", {
      type: "bar",
      data: barData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
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

  // Income and expenses
  async function redrawBarChart() {
    let incomeRequest;
    let expenseRequest;

    if (allTime) {
      incomeRequest = await fetch("/api/income/?allTime=true");
      expenseRequest = await fetch("/api/expenses/?allTime=true");
    } else {
      const startDate = `${timeFrame?.from?.toISOString().split("T")[0]}`;
      const endDate = `${timeFrame?.to?.toISOString().split("T")[0]}`;

      incomeRequest = await fetch(
        `/api/income?startDate=${startDate}&endDate=${endDate}`,
      );
      expenseRequest = await fetch(
        `/api/expenses?startDate=${startDate}&endDate=${endDate}`,
      );
    }

    let incomes = [];
    let expenses = [];
    let dates = [];

    // get income
    const incomeData = await incomeRequest.json();

    if (incomeData.data && incomeData.data.length !== 0) {
      // data exists
      incomes = incomeData.data.map((item: any) => item.income);
      dates = incomeData.data.map((item: any) => item.month + "/" + item.year);
    }

    // get expenses
    const expenseData = await expenseRequest.json();

    if (expenseData.data && expenseData.data.length !== 0) {
      // data exists
      expenses = expenseData.data.map((item: any) => item.expense);
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

    if (barChart.current) {
      barChart.current.data.labels = barData.labels;
      barChart.current.data.datasets.forEach((dataset, i) => {
        dataset.data = barData.datasets[i].data;
      });
      barChart.current.update();
    }
  }

  // function to create receipt line chart for the first time. Displays all time data
  async function createReceiptLineChart() {
    const request = await fetch("/api/receipt-count/?allTime=true");

    // get receipts
    const data = await request.json();

    let receiptCount = [];
    let dates = [];
    if (data.data && data.data.length !== 0) {
      receiptCount = data.data.map((item: any) => item.receipts);
      dates = data.data.map((item: any) => item.month + "/" + item.year);
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

    receiptLineChart?.current?.destroy();
    receiptLineChart.current = new Chart("receiptLineChart", {
      type: "line",
      data: receiptLineData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
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

  // Receipt count
  async function redrawReceiptLineChart() {
    let request;

    if (allTime) {
      request = await fetch("/api/receipt-count/?allTime=true");
    } else {
      const startDate = `${timeFrame?.from?.toISOString().split("T")[0]}`;
      const endDate = `${timeFrame?.to?.toISOString().split("T")[0]}`;

      request = await fetch(
        `/api/receipt-count/?startDate=${startDate}&endDate=${endDate}`,
      );
    }

    // get receipts
    const data = await request.json();

    let receiptCount = [];
    let dates = [];
    if (data.data && data.data.length !== 0) {
      receiptCount = data.data.map((item: any) => item.receipts);
      dates = data.data.map((item: any) => item.month + "/" + item.year);
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

    if (receiptLineChart.current) {
      receiptLineChart.current.data.labels = receiptLineData.labels;
      receiptLineChart.current.data.datasets.forEach((dataset) => {
        dataset.label = receiptLineData.datasets[0].label;
        dataset.data = receiptLineData.datasets[0].data;
      });
      receiptLineChart.current.update();
    }
  }

  // function to create average receipt chart for first time. Displays all time data
  async function createAverageReceiptChart() {
    const request = await fetch("/api/receipts-per-hour/?allTime=true");

    const data = await request.json();
    let averageReceipts = [];
    let hours = [];

    if (data.data && data.data.length !== 0) {
      averageReceipts = data.data.map((item: any) => item.avg_receipts);
      hours = data.data.map((item: any) => item.hour);
    }

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

    averageReceiptChart?.current?.destroy();
    averageReceiptChart.current = new Chart("averageReceiptChart", {
      type: "line",
      data: averageReceiptData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
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

  // Avg receipts per hour
  async function redrawAverageReceiptChart() {
    let request;

    if (allTime) {
      request = await fetch("/api/receipts-per-hour/?allTime=true");
    } else {
      const startDate = `${timeFrame?.from?.toISOString().split("T")[0]}`;
      const endDate = `${timeFrame?.to?.toISOString().split("T")[0]}`;

      request = await fetch(
        `/api/receipts-per-hour/?startDate=${startDate}&endDate=${endDate}`,
      );
    }

    const data = await request.json();
    let averageReceipts = [];
    let hours = [];

    if (data.data && data.data.length !== 0) {
      averageReceipts = data.data.map((item: any) => item.avg_receipts);
      hours = data.data.map((item: any) => item.hour);
    }

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

    if (averageReceiptChart.current) {
      averageReceiptChart.current.data.labels = averageReceiptData.labels;
      averageReceiptChart.current.data.datasets[0].data =
        averageReceiptData.datasets[0].data;
      averageReceiptChart.current.update();
    }
  }

  return (
    <div className="my-10">
      <div>
        {!viewCalendar && (
          <div className="flex flex-wrap justify-center border-3 m-auto px-1.5 py-0.75 gap-2 bg-white rounded-full w-fit h-fit border-white">
            <button
              onClick={toggleCalendar}
              className="px-3 py-1.5 gap-3 bg-(--primary) w-fit text-white h-fit rounded-full"
            >
              Select Time Frame
            </button>
            <button
              onClick={toggleAllTime}
              className="px-3 py-1.5 gap-3 bg-(--primary) w-fit text-white h-fit rounded-full"
            >
              All Time Data
            </button>
          </div>
        )}
        {viewCalendar && (
          <div
            id="calendar"
            className="flex flex-col justify-center border-3 m-auto border-white px-3 py-3 gap-3 bg-white w-fit h-fit rounded-xl"
          >
            <DayPicker
              className="m-auto px-3 py-3 bg-(--primary) w-fit h-fit rounded-xl"
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
            <div>
              <button
                onClick={redrawCharts}
                className="m-1 px-3 py-1.5 bg-(--primary) w-fit h-fit rounded-full"
              >
                Update Graphs
              </button>
              <button
                onClick={toggleCalendar}
                className="m-1 px-3 py-1.5 bg-(--primary) w-fit h-fit rounded-full"
              >
                Close Calendar
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 min-h-7 justify-center max-w-5/7 mx-auto">
        <div className="relative">
          <canvas id="piChart"></canvas>
        </div>
        <div className="relative">
          <canvas id="barChart"></canvas>
        </div>
        <div className="relative">
          <canvas id="receiptLineChart"></canvas>
        </div>
        <div className="relative">
          <canvas id="averageReceiptChart"></canvas>
        </div>
      </div>
      <div className="mt-10 flex justify-center font-size-large font-bold border-3 m-auto px-1.5 py-0.75 gap-2 bg-white rounded-full w-fit h-fit border-white">
        {allTime && (
          <h1 className="text-(--primary) font-size-large font-bold">
            Selected: All Time Data
          </h1>
        )}
        {!allTime && (
          <h1 className="text-(--primary) font-size-large font-bold">
            Selected: {`${timeFrame?.from?.toISOString().split("T")[0]}`} to{" "}
            {`${timeFrame?.to?.toISOString().split("T")[0]}`}
          </h1>
        )}
      </div>
    </div>
  );
}

/*


*/
