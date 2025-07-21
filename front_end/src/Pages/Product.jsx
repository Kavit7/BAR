import React, { useState, useEffect } from 'react'
import Header from '../Components/Header'
import Menu2 from '../Components/Menu2'
 import Swal from 'sweetalert2';
const Product = () => {
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null)
  const [editdata, setEditData] = useState({
    name: '',
    selling: '',
    buying: '',
    stock: '' 
  })
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    buying: '',
    selling: '',
    stock: ''
  });
  useEffect(() => {
    const fetchProduct = async () => {                            
      try {
        const response = await fetch('http://localhost:3000/product', {
          method: "GET",
          headers: { "content-type": "application/json" },
           credentials: 'include'
        });
        
        if (response.ok) {
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

  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      value.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const userdata = {
        name: newProduct.name,
        buying: newProduct.buying,
        selling: newProduct.selling,
        stock: newProduct.stock
      }
      const response = await fetch('http://localhost:3000/add', {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(userdata),
         credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(data.result);
        setShowModal(false);
        setNewProduct({ name: '', buying: '', selling: '', stock: '' });
        Swal.fire("added!",data.message)
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault(); 
    setShowModal(true);
  };

  const handleEdit = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3000/edit/data/${productId}`,{ credentials: 'include'});
      const datas = await response.json();

      if (response.ok && datas.result && datas.result.length > 0) {
        setEditData(datas.result[0]);
        setEditId(productId);
        Swal.fire("Updated!", datas.message)
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (editedId) => {
    if (!editedId) return;

    try {
      const response = await fetch(`http://localhost:3000/edit/${editedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editdata),
         credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setEditId(null);
        setEditData({ name: '', selling: '', buying: '', stock: '' });
        Swal.fire("Product confirmation Update!",result.message)
       
      }
      
    } catch (error) {
      console.error(error);
    }
  };



const handleDelete = async (productId) => {
  const confirm = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (!confirm.isConfirmed) return;

  try {
    const response = await fetch(`http://localhost:3000/delete/${productId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
       credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Delete failed");
    }

    Swal.fire('Deleted!', data.message || 'Product deleted.', 'success');
  } catch (error) {
    console.error("Error deleting product:", error);
    Swal.fire('Error!', 'Failed to delete the product.', 'error');
  }
};



  return (
    <>
      <Header />
      <div className='flex flex-row h-screen overflow-hidden'>
        <div className='flex flex-1 overflow-hidden' >
          <Menu2 />
        </div>
        <div className="w-[calc(100%-60px)] md:w-[calc(100%-80px)] lg:w-[90%] bg-blue-500 overflow-y-auto">
          <div className="flex justify-between items-center px-4 pt-4 mt-15">
            <h1 className='headers font-bold text-white text-xl md:text-2xl'>Product List Table</h1>
            <button 
              onClick={handleAddProduct}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg"
            >
              Add Product
            </button>
          </div>

          <div className='mt-6 w-full px-4 max-w-4xl mx-auto'>
            <input
              type='text'
              placeholder='Search anything...'
              className='mb-4 px-4 py-2 border border-gray-300 rounded w-full max-w-full'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className='overflow-x-auto px-4 pb-4'>
            <table className='mt-4 w-full max-w-4xl mx-auto text-xs sm:text-sm md:text-base border-collapse'>
              <thead className='bg-blue-600'>
                <tr>
                  <th className='px-2 sm:px-3 md:px-4 py-2 border border-gray-300 text-white font-semibold'>Name</th>
                  <th className='px-2 sm:px-3 md:px-4 py-2 border border-gray-300 text-white font-semibold'>Buying Price</th>
                  <th className='px-2 sm:px-3 md:px-4 py-2 border border-gray-300 text-white font-semibold'>Selling Price</th>
                  <th className='px-2 sm:px-3 md:px-4 py-2 border border-gray-300 text-white font-semibold'>Current Stock</th>
                  <th className='px-2 sm:px-3 md:px-4 py-2 border border-gray-300 text-white font-semibold whitespace-nowrap'>Action</th>
                </tr>  
              </thead>
              <tbody> 
                {filteredData.map((item, index) => (
                  <tr key={item.product_id || index} className='hover:bg-gray-50'>
                    <td className='px-2 sm:px-3 md:px-4 py-2 border border-gray-300'>{item.name}</td>
                    <td className='px-2 sm:px-3 md:px-4 py-2 border border-gray-300 text-right'>{item.buying_price}</td>
                    <td className='px-2 sm:px-3 md:px-4 py-2 border border-gray-300 text-right'>{item.selling_price}</td>
                    <td className='px-2 sm:px-3 md:px-4 py-2 border border-gray-300 text-right'>{item.stock}</td>
                    <td className='px-2 sm:px-3 md:px-4 py-2 border border-gray-300 text-center whitespace-nowrap'>
                      <button 
                        onClick={() => handleEdit(item.product_id)}
                        className='bg-amber-500 hover:bg-amber-600 text-white font-medium px-2 py-1 rounded mr-1 sm:mr-2 text-xs sm:text-sm hover:cursor-pointer'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.product_id)}
                        className='bg-rose-600 hover:bg-rose-700 text-white font-medium px-2 py-1 rounded text-xs sm:text-sm hover:cursor-pointer'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Product Modal - Moved outside table */}
      {editId !== null && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={editdata.name}
                  onChange={(e) => setEditData({ ...editdata, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Buying Price</label>
                <input
                  type="number"
                  name="buying"
                  value={editdata.buying}
                  onChange={(e) => setEditData({ ...editdata, buying: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Selling Price</label>
                <input
                  type="number"
                  name="selling"
                  value={editdata.selling}
                  onChange={(e) => setEditData({ ...editdata, selling: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Current Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={editdata.stock}
                  onChange={(e) => setEditData({ ...editdata, stock: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditId(null)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => handleUpdate(editId)}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Buying Price</label>
                <input
                  type="number"
                  name="buying"
                  value={newProduct.buying}
                  onChange={(e) => setNewProduct({ ...newProduct, buying: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Selling Price</label>
                <input
                  type="number"
                  name="selling"
                  value={newProduct.selling}
                  onChange={(e) => setNewProduct({ ...newProduct, selling: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Current Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" 
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Product