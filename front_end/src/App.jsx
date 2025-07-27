import './modify.css'
import './App.css'

import { Route, Routes,BrowserRouter } from 'react-router-dom';
import Dashboard from './Pages/Dashboard';
import Product from './Pages/Product';
import Sale from './Pages/Sale';
import Expenses from './Pages/Expenses';
import Report from './Pages/Report';
import Login from './Pages/Login';
import Logout from './Pages/Logout';
import PrivateRoute from './Components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/Product" element={<PrivateRoute><Product /></PrivateRoute>} />
        <Route path="/sale" element={<PrivateRoute><Sale /></PrivateRoute>} />
        <Route path="/Expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
        <Route path="/Report" element={<PrivateRoute><Report /></PrivateRoute>} />
        <Route path="/logout" element={<PrivateRoute><Logout /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

