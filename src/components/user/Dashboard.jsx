import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Category from "../task/Category.jsx";
import AllUsers from "./AllUsers.jsx";
import Tasks from "../task/Tasks.jsx";
import Wallet from "./Wallet.jsx";
import Subscription from "./Subscription.jsx";
import Withdraw from "./Withdraw.jsx";
import MyWork from "./MyWork.jsx";
import ListTasks from "../task/ListTasks.jsx";
import Transaction from "./Transaction.jsx";
import Profile from "./Profile.jsx";

export default function Dashboard() {
  const { data } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const currentTab = useLocation().pathname.split("/").pop() || "profile";

  useEffect(() => {
    if (!data) navigate("/login");
  }, [data, navigate]);

  if (!data) return null;

  const tabsByRole = {
    admin: ["add-categories", "all-users", "list-tasks", "transactions"],
    poster: ["my-tasks", "wallet", "subscription"],
    hunter: ["my-work", "withdraw"],
  };

  const tabs = ["profile", ...(tabsByRole[data.role] || [])];

  const tabComponents = {
    profile: (
      <>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Profile Information</h2>
        <Profile />
      </>
    ),
    "add-categories": <Category />,
    "all-users": <AllUsers />,
    "list-tasks": <ListTasks />,
    "my-tasks": <Tasks />,
    "my-work": <MyWork />,
    transactions: <Transaction />,
    subscription: <Subscription />,
    wallet: <Wallet />,
    withdraw: <Withdraw />,
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen p-4 gap-6 bg-gray-100">
      <aside className="w-full md:w-1/4 bg-white shadow rounded-2xl p-6 text-center">
        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-blue-600 mx-auto bg-gray-300 overflow-hidden flex items-center justify-center font-bold text-white text-xl">
          {data.avatar ? (
            <img src={data.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span>{data.name?.[0]?.toUpperCase()}</span>
          )}
        </div>

        {data.role !== "admin" && (
          <h3 className="text-sm text-orange-600 font-semibold mt-2">{data.streakCount} Day Streak 🔥</h3>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          <h3 className="font-semibold text-lg">{data.name}</h3>
          <span className="bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full">{data.role}</span>
        </div>

        <p className="text-gray-600 mt-1 text-sm">{data.email}</p>

        <nav className="mt-6 text-left">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`w-full text-left p-2 mb-2 rounded hover:bg-blue-200 ${
                currentTab === tab ? "bg-blue-100 font-semibold" : ""
              }`}
              onClick={() => navigate(`/user-info/${tab}`)}
            >
              {tab.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </nav>
      </aside>

      <main className="w-full md:w-3/4 bg-white shadow rounded-2xl p-6">
        {tabComponents[currentTab] || <p className="text-red-500">Tab not found</p>}
      </main>
    </div>
  );
}
