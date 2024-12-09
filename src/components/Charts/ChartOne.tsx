"use client";

import { ApexOptions } from "apexcharts";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { gql, useQuery } from "@apollo/client";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const options: ApexOptions = {
  legend: {
    show: false,
    position: "top",
    horizontalAlign: "left",
  },
  colors: ["#3C50E0", "#80CAEE"],
  chart: {
    fontFamily: "Satoshi, sans-serif",
    height: 335,
    type: "area",
    dropShadow: {
      enabled: true,
      color: "#623CEA14",
      top: 10,
      blur: 4,
      left: 0,
      opacity: 0.1,
    },
    toolbar: { show: false },
  },
  responsive: [
    { breakpoint: 1024, options: { chart: { height: 300 } } },
    { breakpoint: 1366, options: { chart: { height: 350 } } },
  ],
  stroke: { width: [2, 2], curve: "straight" },
  grid: {
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: true } },
  },
  dataLabels: { enabled: false },
  markers: {
    size: 4,
    colors: "#fff",
    strokeColors: ["#3056D3", "#80CAEE"],
    strokeWidth: 3,
  },
  xaxis: {
    type: "category",
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    title: { style: { fontSize: "0px" } },
    min: 0,
    max: 100,
  },
};

// GraphQL query to fetch data
const GET_PRODUCT_DATA = gql`
  query GetProductData {
    productOne: allCreditTransactions(filter: { product: "Product One" }) {
      createdAt
      amount
    }
    productTwo: allCreditTransactions(filter: { product: "Product Two" }) {
      createdAt
      amount
    }
  }
`;

const ChartOne: React.FC = () => {
  const [timeframe, setTimeframe] = useState("Month");
  const [series, setSeries] = useState([
    { name: "Product One", data: [] as number[] },
    { name: "Product Two", data: [] as number[] },
  ]);
  const [categories, setCategories] = useState<string[]>([]);

  const { data, loading, error } = useQuery(GET_PRODUCT_DATA);

  useEffect(() => {
    if (data) {
      // Process Product One data
      const productOneData = data.productOne.reduce((acc: { [key: string]: number }, transaction: { createdAt: string; amount: number }) => {
        const date = new Date(transaction.createdAt).toLocaleDateString(); // Group by date
        acc[date] = (acc[date] || 0) + transaction.amount; // Aggregate amounts
        return acc;
      }, {});

      // Process Product Two data
      const productTwoData = data.productTwo.reduce((acc: { [key: string]: number }, transaction: { createdAt: string; amount: number }) => {
        const date = new Date(transaction.createdAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + transaction.amount;
        return acc;
      }, {});

      // Combine categories and series data
      const allDates = Array.from(new Set([...Object.keys(productOneData), ...Object.keys(productTwoData)])).sort();
      const productOneSeries = allDates.map((date) => productOneData[date] || 0);
      const productTwoSeries = allDates.map((date) => productTwoData[date] || 0);

      setCategories(allDates);
      setSeries([
        { name: "Product One", data: productOneSeries },
        { name: "Product Two", data: productTwoSeries },
      ]);
    }
  }, [data]);

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    // You can modify the logic here if timeframe filtering is required
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          {/* Add any additional UI elements here */}
        </div>
        <div className="flex w-full max-w-45 justify-end">
          <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
            <button
              onClick={() => handleTimeframeChange("Day")}
              className={`rounded px-3 py-1 text-xs font-medium text-black ${
                timeframe === "Day" ? "bg-white shadow-card dark:bg-boxdark" : ""
              }`}
            >
              Day
            </button>
            <button
              onClick={() => handleTimeframeChange("Week")}
              className={`rounded px-3 py-1 text-xs font-medium text-black ${
                timeframe === "Week" ? "bg-white shadow-card dark:bg-boxdark" : ""
              }`}
            >
              Week
            </button>
            <button
              onClick={() => handleTimeframeChange("Month")}
              className={`rounded px-3 py-1 text-xs font-medium text-black ${
                timeframe === "Month" ? "bg-white shadow-card dark:bg-boxdark" : ""
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>
      <div>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={{ ...options, xaxis: { ...options.xaxis, categories } }}
            series={series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartOne;
