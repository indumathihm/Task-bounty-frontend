import axios from '../../config/axios.js'; 
import { useState } from "react";
import { isEmail } from 'validator';
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom'; 
import { login } from "../../slices/userSlice.js";
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';  

export default function Login() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientErrors, setClientErrors] = useState({});
  const [serverErrors, setServerErrors] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if(email.trim().length === 0) {
      errors.email = 'Email is required';
    } else if(!isEmail(email)) {
      errors.email = 'Email is invalid';
    }

    if(password.trim().length === 0) {
      errors.password = 'Password is required';
    } else if(password.trim().length < 8 || password.trim().length > 128) {
      errors.password = 'Password should be between 8 to 128 characters';
    }

    if(Object.keys(errors).length > 0) {
      setClientErrors(errors);
    } else {
      const formData = { email, password };
      try {
        const response = await axios.post('/users/login', formData);
        localStorage.setItem("token", response.data.token);
        const userResponse = await axios.get('/users/myProfile', { headers: { Authorization: localStorage.getItem("token") } });
        dispatch(login(userResponse.data));
        navigate('/user-info/profile');
        toast.success("Login successful!");
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            setServerErrors("Your account is inactive. Please contact admin.");
          } else {
            setServerErrors("Login failed. Please check your credentials.");
          }
        }
        setClientErrors({});
      }
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {serverErrors && (
          <div className="mb-4 bg-red-100 text-red-800 p-2 rounded">
            <h3 className="font-bold">Error:</h3>
            <p>{serverErrors}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex items-center border border-gray-300 rounded px-3 py-2">
              <FaEnvelope className="text-gray-500 mr-2" />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Enter email"
                className="w-full outline-none"
              />
            </div>
            {clientErrors.email && <p className="text-red-500 text-sm mt-1">{clientErrors.email}</p>}
          </div>

          <div className="mb-4">
            <div className="flex items-center border border-gray-300 rounded px-3 py-2">
              <FaLock className="text-gray-500 mr-2" />
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Enter password" 
                className="w-full outline-none"
              />
            </div>
            {clientErrors.password && <p className="text-red-500 text-sm mt-1">{clientErrors.password}</p>}
          </div>
          
          <div className="text-right mb-3 ">
            <p className="text-sm underline">
              <Link to="/forgot-password" className="text-blue-600">
              Forgot password?</Link>
            </p>
          </div>
          
          <div className="mb-4">
            <button 
              type="submit" 
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Login
            </button>
            <div className="text-center mt-4">
              <p className="text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                Register</Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}