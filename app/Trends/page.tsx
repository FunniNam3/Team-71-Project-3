// This work is dedicated to the Holy Family. To Jesus, Mary and St. Joseph!

// installed chart.js and react-chartjs-2

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { use, useState } from "react";
import { Line } from "react-chartjs-2";

export default function TrendsPage() {

    // create variables and functions to hold and set chart data
    // pi chart for food and drink count sold in time period
    const [piData, setPiData] = useState<any>(null);
    // line chart of avg receipt purchase time in time period
    const [timeData, setTimeData] = useState<any>(null);
    // bar chart of monthly revenue and expense in time period
    const [salesData, setSalesData] = useState<any>(null);
    // line chart of number of receipts per month in time period
    const [receiptData, setReceiptData] = useState<any>(null);

    // loading variable to keep track of if still waiting on api request
    // When set to false, safe to create graphs and display
    const [loading, setLoading] = useState(true);

    

}
