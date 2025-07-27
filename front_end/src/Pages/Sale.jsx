import React, { useEffect, useState } from 'react'
import Header from '../Components/Header'
import Menu2 from '../Components/Menu2'
import Swal from 'sweetalert2'

const Sale = () => {
  const [data, setData] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [salesList, setSalesList] = useState([])
  const [quantities, setQuantities] = useState({})

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch('http://localhost:3000/product', {
          method: "GET",
          headers: { "content-type": "application/json" },
           credentials: 'include'
        });


        if (response.ok) {
          localStorage.setItem('loggedIn', 'true');
          setData(await response.json());

          console.log("success");
        } else {
          console.log('failed');
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    fetchProduct();
    const interval = setInterval(fetchProduct, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectChange = (e) => {
    const selectedName = e.target.value;
    if (!salesList.some(p => p.name === selectedName)) {
      const product = data.find(d => d.name === selectedName)
      if (product) {
        setSalesList(prev => [...prev, { ...product }])
        setQuantities(prev => ({ ...prev, [product.name]: 0 })) // Changed from 1 to 0
      }
    }
    setSelectedProduct('');
  }

  const handleQuantityChange = (name, value) => {
    const numValue = Number(value)
    if (numValue >= 0) { // Ensure value is not negative
      setQuantities(prev => ({ ...prev, [name]: numValue }))
    }
  }

  const calculateSales = async () => {
    // Prepare data in format backend expects: product_id and quantity_sold
    const salesPayload = salesList.map(product => ({
      product_id: product.product_id,
      quantity_sold: quantities[product.name] || 0 // Changed from 1 to 0
    }));

    try {
      const response = await fetch('http://localhost:3000/api/save-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sales: salesPayload }),
         credentials: 'include'
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('loggedIn', 'true');
        Swal.fire("Message ...", result.message)  
        setTimeout(() => {
          window.location.reload();
        }, 3000);       
      } else { 
        alert('Failed to save sales: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error(error);
      alert('Error saving sales');
    }
  }

  return (
    <>
      <Header />
      <div className='flex flex-row h-screen overflow-hidden'>
        <div className='flex flex-1 overflow-hidden'>
          <Menu2 />
        </div>
        <div className="w-[calc(100%-60px)] md:w-[calc(100%-80px)] lg:w-[90%] bg-[#f8f9f9] overflow-y-auto px-4 py-6">
          <h1 className='headers mt-10 font-bold text-white text-xl md:text-2xl mb-4'>
            Select Product from the Drop menu
          </h1>
          <select
            className="w-full md:w-1/2 lg:w-1/3 p-3 rounded-lg border-2 border-blue-300 bg-white text-blue-800 
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
              shadow-lg transition duration-200 ease-in-out hover:bg-blue-50 cursor-pointer mb-4"
            onChange={handleSelectChange}
            value={selectedProduct}
          >
            <option value="">Select a product</option>
            {data.map((d, i) => (
              <option key={i} value={d.name}>{d.name}</option>
            ))}
          </select>

          {salesList.length > 0 && (
            <div className='bg-white rounded-lg p-4 shadow-lg overflow-x-auto'>
              <table className='min-w-full text-sm text-left text-gray-700'>
                <thead className='bg-blue-200'>
                  <tr>
                    <th className='p-2'>Product</th>
                    <th className='p-2'>Selling Price</th>
                    <th className='p-2'>Quantity</th>
                    <th className='p-2'>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {salesList.map((product, index) => (
                    <tr key={index} className='border-b'>
                      <td className='p-2'>{product.name}</td>
                      <td className='p-2'>{product.selling_price}</td>
                      <td className='p-2'>
                        <input
                          type='number'
                          min='0' // Changed from min='1' to min='0'
                          value={quantities[product.name] || 0} // Changed from 1 to 0
                          onChange={(e) => handleQuantityChange(product.name, e.target.value)}
                          className='border p-1 rounded w-16'
                        />
                      </td>
                      <td className='p-2'>
                        {(quantities[product.name] || 0) * product.selling_price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={calculateSales}
                className='mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow'
              >
                Calculate & Save Sales
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Sale