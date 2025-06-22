import axios from '../../config/axios.js';
import { useState,useEffect } from "react";
import { isEmail, isMobilePhone } from 'validator';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [clientErrors, setClientErrors] = useState({});
  const [serverErrors, setServerErrors] = useState(null);
  const [showRole, setShowRole] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
  const checkFirstUser = async () => {
    try {
      const res = await axios.get('/users/count');
      if (res.data.count === 0) {
        setShowRole(false); 
      }
    } catch (err) {
      console.error("Failed to check user count", err);
    }
  };
  checkFirstUser();
}, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (name.trim().length === 0) {
      errors.name = 'Name is required';
    }

    if (email.trim().length === 0) {
      errors.email = 'Email is required';
    } else if (!isEmail(email)) {
      errors.email = 'Invalid email';
    }

    if (phone.trim().length !== 10) {
      errors.phone = 'Enter 10-digit mobile number';
    } else if (!isMobilePhone(`+91${phone}`, 'en-IN')) {
      errors.phone = 'Invalid Indian phone number';
    }

    if (password.trim().length === 0) {
      errors.password = 'Password is required';
    } else if (password.length < 8 || password.length > 128) {
      errors.password = 'Password must be between 8 and 128 characters';
    }

    if (showRole && !role) {
      errors.role = 'Role is required';
    }


    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
    } else {
      const formData = {
        name,
        email,
        phone: `+91${phone}`,
        password,
        role
      };
      try {
        // eslint-disable-next-line no-unused-vars
        const response = await axios.post('/users/register', formData);
        toast.success('Registered successfully! Redirecting to login...', {
          autoClose: 2500,
        });
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } catch (err) {
        if (err.response?.data?.errors) {
          setServerErrors(err.response.data.errors);
        } else {
          toast.error('Something went wrong. Try again later.');
        }
        setClientErrors({});
      }
    }
  };

  return (
    <div className="flex items-center justify-center  bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        {serverErrors && (
          <ul className="mb-4 text-red-500 text-sm">
            {serverErrors.map((err, i) => (
              <li key={i}>{err.msg}</li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="flex items-center border rounded px-3 py-2">
            <FaUser className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full outline-none"
            />
          </div>
          {clientErrors.name && <p className="text-red-500 text-sm">{clientErrors.name}</p>}

          <div className="flex items-center border rounded px-3 py-2">
            <FaEnvelope className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full outline-none"
            />
          </div>
          {clientErrors.email && <p className="text-red-500 text-sm">{clientErrors.email}</p>}

          <div className="flex items-center border rounded px-3 py-2">
            <FaPhone className="text-gray-500 mr-2" />
            <span className="text-gray-700 mr-1">+91</span>
            <input
              type="text"
              placeholder="Enter 10-digit number"
              value={phone}
              onChange={e => {
                const val = e.target.value;
                if (/^\d{0,10}$/.test(val)) setPhone(val);
              }}
              className="w-full outline-none"
            />
          </div>
          {clientErrors.phone && <p className="text-red-500 text-sm">{clientErrors.phone}</p>}

          <div className="flex items-center border rounded px-3 py-2">
            <FaLock className="text-gray-500 mr-2" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full outline-none"
            />
          </div>
          {clientErrors.password && <p className="text-red-500 text-sm">{clientErrors.password}</p>}

          {showRole && (
            <div className="mt-4">
              <p className="mb-2 font-medium">Select Role:</p>
              <label className="inline-flex items-center mr-4">
                <input
                  type="radio"
                  name="role"
                  value="poster"
                  checked={role === 'poster'}
                  onChange={() => setRole("poster")}
                  className="mr-2"
                />
                Poster
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="hunter"
                  checked={role === 'hunter'}
                  onChange={() => setRole("hunter")}
                  className="mr-2"
                />
                Hunter
              </label>
              {clientErrors.role && <p className="text-red-500 text-sm">{clientErrors.role}</p>}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Sign Up
            </button>
            <div className="text-center mt-4">
              <p className="text-sm">
                Have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}