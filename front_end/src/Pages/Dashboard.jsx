import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import Menu from '../Components/Menu';
import StatsChart from '../Components/StatsChart';
//import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  //const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalSales: 0,
    profit: 0
  });


  useEffect(() => {
    // Fetch dashboard statistics from your backend
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/dashboard-stats', {
          method: 'GET',
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalExpenses: data.total_expenses || 0,
            totalSales: data.total_sales || 0,
            profit: (data.total_sales || 0) - (data.total_expenses || 0)
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Fixed Header */}
      <Header />

      {/* Content Area (will scroll behind header) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Menu (always visible) */}
        <div className="w-[60px] md:w-[10%] overflow-y-none">
          <Menu />
        </div>

        {/* Scrollable Content Area */}
        <div className="w-[calc(100%-60px)] md:w-[90%] bg-blue-500 overflow-y-auto">
          <div className="pt-16"> {/* Spacer for fixed header */}
            <h1 className='headers mt-4 md:mt-8 text-center font-bold text-white text-xl md:text-2xl italic'>
              Dashboard
            </h1>

            {/* Stats Cards */}
            <div className='flex flex-col md:flex-row justify-center items-center gap-4 mt-6 md:mt-10 px-2 md:px-4'>
              <div className='bg-green-200 w-[90%] md:w-[30%] p-4 md:p-6 rounded text-center font-bold text-lg md:text-2xl'>
                Total Expenses: {stats.totalExpenses.toFixed(2)}
              </div>
              <div className='bg-green-200 w-[90%] md:w-[30%] p-4 md:p-6 rounded text-center font-bold text-lg md:text-2xl'>
                Total Sales: {stats.totalSales.toFixed(2)}
              </div>
              <div className={`w-[90%] md:w-[30%] p-4 md:p-6 rounded text-center font-bold text-lg md:text-2xl ${
                stats.profit >= 0 ? 'bg-green-200' : 'bg-red-200'
              }`}>
                {stats.profit >= 0 ? 'Profit: ' : 'Loss: '}
                {Math.abs(stats.profit).toFixed(2)}
              </div>
            </div>

            {/* Graph Section */}
            <h1 className='headers text-center mt-10 md:mt-20 text-xl md:text-2xl text-white font-bold italic underline'>
              Graph for General Report
            </h1>
            <div className='w-full p-2 md:p-4 mb-8'>
              <StatsChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;