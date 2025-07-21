import React, { useState, useEffect } from 'react'
import Header from '../Components/Header'
import Menu2 from '../Components/Menu2'

const Expenses = () => {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [expenses, setExpenses] = useState([])
  const [filterDate, setFilterDate] = useState('')
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    fetchExpenses()
  }, [filterDate])

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/expenses${filterDate ? `?date=${filterDate}` : ''}`,{ credentials: 'include'})
      const data = await res.json()
      setExpenses(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { description, amount }

    const url = editId
      ? `http://localhost:3000/api/expenses/${editId}`
      : 'http://localhost:3000/api/expenses'

    const method = editId ? 'PUT' : 'POST'

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
         credentials: 'include'
      })
      setDescription('')
      setAmount('')
      setEditId(null)
      fetchExpenses()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/expenses/${id}`, { method: 'DELETE', credentials: 'include' })
      fetchExpenses()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (expense) => {
    setDescription(expense.description)
    setAmount(expense.amount)
    setEditId(expense.id)
  }

  return (
    <>
      <Header />
      <div className='flex flex-row h-screen overflow-hidden'>
        <div className='flex flex-1 overflow-hidden'>
          <Menu2 />
        </div>
        <div className="w-[calc(100%-60px)] md:w-[calc(100%-80px)] lg:w-[90%] bg-blue-500 overflow-y-auto px-4 py-6">
          <h1 className='headers mt-10 font-bold text-white text-xl md:text-2xl mb-4'>
            Expenses
          </h1>

          <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow-md max-w-lg">
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full mb-3 p-2 border rounded"
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
              {editId ? 'Update' : 'Add'}
            </button>
          </form>

          <div className="mb-4">
            <label className="text-white mr-2">Filter by date:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="p-2 rounded"
            />
          </div>

          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200 text-left">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Description</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <tr key={expense.id} className="border-t">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{expense.description}</td>
                    <td className="p-2">{expense.amount}</td>
                    <td className="p-2">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-600 underline hover:cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 underline hover:cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-2 text-center text-gray-500">No expenses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default Expenses
