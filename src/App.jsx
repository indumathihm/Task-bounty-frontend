import './App.css';
import { useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, fetchUserAccount } from "./slices/userSlice";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './components/Home';
import Login from "./components/auth/Login";
import Register from './components/auth/Register';
import AllTasks from './components/task/AllTasks';
import Leaderboard from "./components/Leaderboard";
import TaskSubmission from './components/task/TaskSubmission ';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import TaskDetails from './components/task/TaskDetails';
import MyWork from './components/user/MyWork';
import Dashboard from './components/user/Dashboard';
import AllCategories from "./components/task/AllCategories";
import AllUsers from './components/user/AllUsers';
import Category from "./components/task/Category";
import TaskForm from "./components/task/TaskForm";
import Tasks from './components/task/Tasks';
import Subscription from './components/user/Subscription';
import Wallet from "./components/user/Wallet";
import Withdraw from './components/user/Withdraw';
import PrivateRoute from "./components/shared/PrivateRoute";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import unauthorizedImage from './assets/401.png';

export default function App() {
  const { isLoggedIn, data } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showImage, setShowImage] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) dispatch(fetchUserAccount());
  }, [dispatch]);
  return (
    <div className="font-sans">
      <ToastContainer position="top-center" autoClose={1000} />

      <nav className="bg-white fixed top-0 left-0 w-full z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center py-4 flex-wrap">
          <Link to="/" className="text-2xl font-bold text-blue-600">Task Bounty</Link>

          <button
            className="md:hidden text-2xl border px-3 py-1 rounded"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✖' : '☰'}
          </button>

          <div className={`w-full ${menuOpen ? 'flex' : 'hidden'} flex-col items-center  gap-4 mt-4 md:flex md:flex-row md:items-center md:justify-end md:gap-8 md:mt-0 md:w-auto`}>
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


            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link to="/user-info/profile" className="w-10 h-10 rounded-full border-2 border-blue-500 flex items-center justify-center font-bold text-lg overflow-hidden" title={data?.name}>
                  {data?.avatar ? (
                    <img src={data.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{data?.name?.charAt(0).toUpperCase()}</span>
                  )}
                </Link>
                <button
                  onClick={() => {
                    dispatch(logout());
                    localStorage.removeItem("token");
                    localStorage.removeItem("currentTab");
                    navigate("/login");
                    setMenuOpen(false);
                  }}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="border px-3 py-1 rounded hover:border-blue-400">Login</Link>
                <button
                  onClick={() => {
                    navigate("/register");
                    setMenuOpen(false);
                  }}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="mt-24 px-4 sm:px-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/all-tasks" element={<AllTasks />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/task-submission" element={<TaskSubmission />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/tasks/:taskId" element={<TaskDetails />} />
          <Route path="/hunter/:id" element={<MyWork />} />
          <Route path="/categories" element={<AllCategories />} />
          <Route path="/user-info/:tab?" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
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
                <Category />
              </ProtectedRoute>
            </PrivateRoute>
          } />
          <Route path="/add-tasks" element={
            <PrivateRoute>
              <ProtectedRoute roles={["poster"]}>
                <TaskForm />
              </ProtectedRoute>
            </PrivateRoute>
          } />
          <Route path="/subscription" element={
            <PrivateRoute>
              <ProtectedRoute roles={["poster"]}>
                <Subscription />
              </ProtectedRoute>
            </PrivateRoute>
          } />
          <Route path="/wallet" element={
            <PrivateRoute>
              <ProtectedRoute roles={["poster"]}>
                <Wallet />
              </ProtectedRoute>
            </PrivateRoute>
          } />
          <Route path="/withdraw" element={
            <PrivateRoute>
              <ProtectedRoute roles={["hunter"]}>
                <Withdraw />
              </ProtectedRoute>
            </PrivateRoute>
          } />
          <Route path="/my-tasks" element={
            <PrivateRoute>
              <ProtectedRoute roles={["poster"]}>
                <Tasks />
              </ProtectedRoute>
            </PrivateRoute>
          } />
          <Route path="/unauthorized" element={
            <div className="flex flex-col items-center justify-center p-4 text-center">
              {showImage ? (
                <img src={unauthorizedImage} alt="Unauthorized Access" className="w-full max-w-md mb-4" onError={() => setShowImage(false)} />
              ) : (
                <h2 className="text-xl text-red-600">You don't have access to this page.</h2>
              )}
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
}