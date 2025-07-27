import React, { useState } from 'react';
import Header from '../Components/Header';
import Menu2 from '../Components/Menu2';
import Swal from 'sweetalert2';

const Report = () => {
  const [date, setDate] = useState('');
  const [report, setReport] = useState(null);

  const handleFilter = () => {
    if (!date) {
      Swal.fire('Please select a date', '', 'warning');
      return;
    }

    fetch(`http://localhost:3000/report?date=${date}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          Swal.fire('Error', data.error, 'error');
          setReport(null);
        } else if (data.success && (data.daily.total_sales > 0 || data.daily.total_expenses > 0 || data.products.length > 0)) {
          setReport(data);
          Swal.fire('Success', 'Report loaded successfully!', 'success');
        } else {
          Swal.fire('No Data', 'No report data found for this date', 'info');
          setReport(null);
        }
      })
      .catch(err => {
        Swal.fire('Error', 'Something went wrong', 'error');
        console.error(err);
      });
  };

  const handlePrint = () => window.print();

  return (
    <>
      <Header />
      <div className='flex flex-row h-screen overflow-hidden'>
        <div className='flex flex-1 overflow-hidden'><Menu2 /></div>
        <div className='w-[calc(100%-60px)] md:w-[calc(100%-80px)] lg:w-[90%] bg-[#f8f9f9] overflow-y-auto px-4 py-6'>
          <h1 className='headers font-bold text-xl mb-4 mt-10 text-white'>Report</h1>
          <div className='mb-4'>
            <input
              type='date'
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className='border p-2 rounded mr-4 text-blue-300 bg-white'
            />
            <button onClick={handleFilter} className='bg-green-500 text-white px-4 py-2 rounded mr-2'>
              Filter
            </button>
            <button onClick={handlePrint} className='bg-white text-blue-300 px-4 py-2 rounded'>
              Print
            </button>
          </div>

          {report && (
            <>
              <h2 className='text-lg font-semibold mb-2 headers italic text-white'>Daily Summary</h2>
              <p className='text-green-300'>Total Sales: {report.daily.total_sales}</p>
              <p className='text-green-300'>Total Expenses: {report.daily.total_expenses}</p>
              <p className='text-green-300'>Net: {report.daily.total_sales - report.daily.total_expenses}</p>

              <h2 className='text-lg font-semibold mt-6 mb-2'>Product Sales</h2>
              <table className='w-full border text-white'>
                <thead className='bg-[#aed6f1]'>
                  <tr>
                    <th className='border p-2'>Product</th>
                    <th className='border p-2'>Quantity</th>
                    <th className='border p-2'>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {report.products.map((item, i) => (
                    <tr key={i} >
                      <td className='border p-2 text-black border-white'>{item.name}</td>
                      <td className='border p-2 text-black border-white'>{item.quantity_sold}</td>
                      <td className='border p-2 text-black border-white'>{item.total_sale_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Report;