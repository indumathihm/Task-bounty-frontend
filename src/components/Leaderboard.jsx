import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaderboard } from "../slices/leaderboardSlice";

export default function Leaderboard() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.leaderboard);

  useEffect(() => {
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  if (loading) return <p className="text-center py-4">Loading leaderboard...</p>;
  if (error) return <p className="text-center text-red-500 py-4">Error: {error}</p>;

  const getStyleByRank = (index) => {
    switch (index) {
      case 0:
        return "bg-blue-100 border-l-4 border-blue-400 font-bold scale-[1.03]";
      case 1:
        return " font-semibold scale-[1.02]";
      case 2:
        return " font-semibold scale-[1.01]";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5">
      <h2 className="text-3xl font-bold mb-6 text-blue-600 text-center">Leaderboard 🏆</h2>

      <div className="grid grid-cols-3 gap-4 font-semibold border-b-2 border-gray-300 pb-2 mb-4 text-gray-700">
        <div>Name</div>
        <div>Total Earnings (₹)</div>
        <div>Tasks Completed</div>
      </div>

      <ul className="divide-y divide-gray-200">
        {data.map((user, index) => (
          <li
            key={user._id}
            className={`grid grid-cols-3 gap-4 py-3 items-center text-gray-900 rounded-md transform transition ${getStyleByRank(index)}`}
          >
            <div className="flex items-center gap-2">
              {index === 0 && <span>🥇</span>}
              {index === 1 && <span>🥈</span>}
              {index === 2 && <span>🥉</span>}
              <span>{user.name}</span>
            </div>
            <div>{user.totalEarnings}</div>
            <div>{user.totalTasksCompleted}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
