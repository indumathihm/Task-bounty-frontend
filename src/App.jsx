import './App.css';
import { useEffect, useState } from 'react';
import Login from "./components/auth/Login"
import Register from './components/auth/Register'
import AllUsers from './components/user/AllUsers';
import Category from "./components/task/Category";
import TaskForm from "./components/task/TaskForm";
import TaskDetails from './components/task/TaskDetails';
import Home from './components/Home';
import Leaderboard from "./components/Leaderboard"
import Wallet from "./components/user/Wallet";
import unauthorizedImage from './assets/401.png';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import AllCategories from "./components/task/AllCategories";
import PrivateRoute from "./components/shared/PrivateRoute";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import Subscription from './components/user/Subscription';
import AllTasks from './components/task/AllTasks';
import Tasks from './components/task/Tasks';
import Withdraw from './components/user/Withdraw';
import MyWork from './components/user/MyWork';

import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, fetchUserAccount } from "./slices/userSlice";
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './components/user/Dashboard';
import TaskSubmission from './components/task/TaskSubmission ';

export default function App() {
  const { isLoggedIn ,data} = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showImage, setShowImage] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchUserAccount());
    } 
  }, [dispatch]);

  return (
    <div className="font-sans">
       <ToastContainer position="top-center" autoClose={1000} />
      <nav className="bg-white fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-4">
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">Task Bounty</Link>

          <div className="flex gap-10">
            <Link to="/" 
              className="relative text-black after:absolute after:bottom-0 after:left-1/2 after:translate-x-[-50%] after:h-[2px] after:w-0 after:bg-blue-600  after:duration-300 hover:after:w-full">
            Home </Link>
            <Link to="/all-tasks"
              className="relative text-black after:absolute after:bottom-0 after:left-1/2 after:translate-x-[-50%] after:h-[2px] after:w-0 after:bg-blue-600  after:duration-300 hover:after:w-full">
            Explore Tasks </Link> 
            <Link to="/leaderboard"
              className="relative text-black after:absolute after:bottom-0 after:left-1/2 after:translate-x-[-50%] after:h-[2px] after:w-0 after:bg-blue-600  after:duration-300 hover:after:w-full">
            Leaderboard </Link>  
             <Link to="/task-submission"
              className="relative text-black after:absolute after:bottom-0 after:left-1/2 after:translate-x-[-50%] after:h-[2px] after:w-0 after:bg-blue-600  after:duration-300 hover:after:w-full">
            Task Submission </Link> 
            
          </div>          
          <ul className="flex items-center gap-10">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link to="/user-info/profile" className="w-10 h-10 rounded-full border-2 border-blue-500 text-black flex items-center justify-center text-lg font-bold hover:scale-105 transition-transform" 
                  title={data?.name || "Profile"}>
                  {data?.avatar ? 
                    ( 
                      <img src={data.avatar} alt="Profile" className="w-full h-full object-cover rounded-full"/>
                    ) : (
                      <span>{data?.name?.charAt(0).toUpperCase()}</span>)}
                </Link>

                <button
                  onClick={() => {
                    dispatch(logout());
                    localStorage.removeItem("token");
                    localStorage.removeItem("currentTab");
                    navigate("/login");
                  }}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 "
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-5">
              <Link
                to="/login"
                className="px-3 py-1 border-[3px] border-transparent rounded active:border-blue-300"
              >
                Login
              </Link>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 text-white border-transparent rounded hover:bg-blue-700 px-3 py-0.5 border-[3px]  active:border-blue-300"
              >
                Sign Up
              </button>
            </div>
            )}
          </ul>
        </div>
      </nav>

      <div className="mt-20">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/categories" element={<AllCategories/>}/>
          <Route path="/all-tasks" element={<AllTasks />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/tasks/:taskId" element={<TaskDetails />} />
          <Route path="/hunter/:id" element={<MyWork />} />
          <Route path="/task-submission" element={<TaskSubmission />} />
          <Route path="/user-info/:tab?" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>} 
          />

          <Route path="/all-users" element={
            <PrivateRoute>
              <ProtectedRoute roles={["admin"]}>
                <AllUsers />
              </ProtectedRoute>
            </PrivateRoute>
          } />
          
          <Route path="/add-categories" element={
            <PrivateRoute>
              <ProtectedRoute roles={["admin"]}>
                <Category/>
              </ProtectedRoute>
            </PrivateRoute>
          } />

          <Route path="/add-tasks" element={
            <PrivateRoute>
              <ProtectedRoute roles={["poster"]}>
                <TaskForm/>
              </ProtectedRoute>
            </PrivateRoute>
          } />

          <Route path="/subscription" element={
            <PrivateRoute>
              <ProtectedRoute roles={["poster"]}>
                <Subscription/>
              </ProtectedRoute>
            </PrivateRoute>
          } />
          <Route path="/wallet" element={
            <PrivateRoute>
              <ProtectedRoute roles={["poster"]}>
                <Wallet/>
              </ProtectedRoute>
            </PrivateRoute>
          } />

          <Route path="/withdraw" element={
            <PrivateRoute>
              <ProtectedRoute roles={["hunter"]}>
                <Withdraw/>
              </ProtectedRoute>
            </PrivateRoute>
          } />

          <Route path="/my-tasks" element={
            <PrivateRoute>
              <ProtectedRoute roles={["poster"]}>
                <Tasks/>
              </ProtectedRoute>
            </PrivateRoute>
          } />

          <Route path="/unauthorized" element={
            <div className="flex flex-col items-center justify-center p-4">
              {showImage ? (
                <img
                  src={unauthorizedImage}
                  alt="Unauthorized Access"
                  className="w-1/2 mb-4"
                  onError={() => setShowImage(false)}
                />
              ) : (
                <h2 className="text-xl text-red-600">You don't have access to this</h2>
              )}
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
}