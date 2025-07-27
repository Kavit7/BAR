import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Swal from 'sweetalert2';
import { User } from 'lucide-react';
const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('loggedIn', 'true');
                Swal.fire("Success",data.message)
navigate('/dashboard');
            } else {
                Swal.fire("Error",data.error,"warning")
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#f8f9f9]">
            {/* Header - Matching your dashboard style */}
            <Header/>
            
            {/* Login Form */}
            <div className="flex flex-1 items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="bg-[#5d6d7e] p-4 text-white">
                        <h2 className="text-xl font-bold text-center">Admin Login</h2>
                    </div>
                    
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-[#a6acaf] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a6acaf]"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Password
                                </label>
                                
                                <input
                                    type="password"
                                    className="w-full p-3 border border-[#a6acaf] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a6acaf]"
                                    value={password}
                                    
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 px-4 rounded-lg text-white font-bold ${loading ? 'bg-[#5d6d7e]' : 'bg-[#5d6d7e] hover:bg-[#2e4053] hover:cursor-pointer'} transition duration-200`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : 'Login'}
                            </button>
                        </form>
                        
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;