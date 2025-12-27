import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PriceChart = ({ theme }) => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=365&interval=daily');
        const prices = response.data.prices;
        
        setChartData({
          labels: prices.map(price => new Date(price[0]).toLocaleDateString()),
          datasets: [
            {
              label: 'ETH Price (USD)',
              data: prices.map(price => price[1]),
              borderColor: 'rgba(144, 145, 193, 1)',
              backgroundColor: 'rgba(29, 9, 212, 0.5)',
            },
          ],
        });
      } catch (err) {
        setError('Failed to fetch price data. Please try again later.');
        console.error('Error fetching price chart data:', err);
      }
    };

    fetchData();
  }, []);

  const textColor = theme === 'dark' ? 'white' : 'black';

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
        },
      },
      title: {
        display: true,
        text: 'Ethereum (ETH) Price - Last 365 Days (Coingecko API)',
        color: textColor,
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: theme === 'dark' ? 'rgba(191, 199, 242, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: theme === 'dark' ? 'rgba(226, 212, 212, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!chartData) {
    return <div>Loading chart...</div>;
  }

  return (
    <div style={{ position: 'relative', margin: 'auto', width: '100%' }}>
      <Line options={options} data={chartData} />
    </div>
  );
};

export default PriceChart;
