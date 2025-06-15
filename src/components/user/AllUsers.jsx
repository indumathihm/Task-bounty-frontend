import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers, updateUserActivation } from "../../slices/userSlice";

export default function AllUsers() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.user.users).filter(user => user.role !== "admin");

  useEffect(() => {
    if (localStorage.getItem("token")) dispatch(fetchAllUsers());
  }, [dispatch]);

  const toggleActivation = (id, isActive) => {
    dispatch(updateUserActivation({ id, isActive }));
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-semibold text-center mb-6">All Users</h1>

      {users.length === 0 ? (
        <p className="text-center text-gray-600 text-lg mt-10">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-md">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {["Name", "Role", "Status", "Subscription", "Action"].map(header => (
                  <th key={header} className="py-3 px-5 text-center text-sm font-medium">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-5 text-center font-medium">{user.name}</td>
                  <td className="py-3 px-5 text-center capitalize">{user.role}</td>
                  <td className="py-3 px-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-center">
                    {user.role === "poster" && (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.subscription ? "bg-yellow-100 text-yellow-800" : "bg-gray-200 text-gray-700"}`}>
                        {user.subscription ? "Premium User" : "Free User"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-5 text-center">
                    <button
                      onClick={() => toggleActivation(user._id, !user.isActive)}
                      className={`px-4 py-1 rounded-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        user.isActive ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"
                      } text-white`}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}