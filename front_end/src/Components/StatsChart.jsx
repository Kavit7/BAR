import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function StatsChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/weekly-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch weekly stats');
        }
        const result = await response.json();
        if (result.success) {
          setChartData(result.data);
        } else {
          throw new Error(result.message || 'Failed to load chart data');
        }
      } catch (err) {
        console.error('Error fetching weekly stats:', err);
        setError(err.message);
        // Fallback to empty data
        setChartData([
          { day: 'Mon', sales: 0, expenses: 0, profit: 0, loss: 0 },
          { day: 'Tue', sales: 0, expenses: 0, profit: 0, loss: 0 },
          { day: 'Wed', sales: 0, expenses: 0, profit: 0, loss: 0 },
          { day: 'Thu', sales: 0, expenses: 0, profit: 0, loss: 0 },
          { day: 'Fri', sales: 0, expenses: 0, profit: 0, loss: 0 },
          { day: 'Sat', sales: 0, expenses: 0, profit: 0, loss: 0 },
          { day: 'Sun', sales: 0, expenses: 0, profit: 0, loss: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyStats();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchWeeklyStats, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <p>Loading chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] p-2 md:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData}
          margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            formatter={(value, name) => [`$${value.toFixed(2)}`, name]}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
          />
          <Bar dataKey="sales" fill="#8884d8" name="Sales" />
          <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
          <Bar dataKey="profit" fill="#4caf50" name="Profit" />
          <Bar dataKey="loss" fill="#f44336" name="Loss" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StatsChart;