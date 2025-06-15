import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getHunterSummary } from "../../slices/taskSlice";
import { BADGES } from "../../assets/badges";

function ProfileBadges({ badges }) {
  if (!badges?.length) {
    return <p className="text-gray-400 italic text-center">No badges earned yet.</p>;
  }

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {badges.map((key) => {
        const badge = BADGES[key];
        if (!badge) return null;
        return (
          <div
            key={key}
            title={badge.description}
            className="flex flex-col items-center cursor-pointer hover:scale-105 transform transition"
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full border border-gray-300 shadow-inner bg-gray-100">
              <span role="img" aria-label={badge.name} className="text-2xl">
                {badge.emoji || "🏅"}
              </span>
            </div>
            <p className="text-gray-800 mt-1 text-sm">{badge.name}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function MyWork() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data } = useSelector((state) => state.user);
  const { taskSummary, loading, error } = useSelector((state) => state.task);

  const [filter, setFilter] = useState(null);

  useEffect(() => {
    dispatch(getHunterSummary());
  }, [dispatch]);

  if (loading) return <p className="text-center py-10 animate-pulse">Loading summary...</p>;
  if (error) return <p className="text-center py-10 text-red-600 font-semibold">{error.toString()}</p>;
  if (!taskSummary) return <p className="text-center py-10 text-gray-600">No summary available.</p>;

  const assignedTasks = taskSummary.assignedTasks || [];
  const totalEarnings = data?.totalEarnings || 0;

  const stats = [
    { label: "Total Tasks", value: assignedTasks.length, color: "blue", key: "all" },
    { label: "Completed Tasks", value: taskSummary.completedTasks || 0, color: "green", key: "completed" },
    {
      label: "Ongoing Tasks",
      value: assignedTasks.filter((t) =>
        ["ongoing", "in_progress"].includes(t.status.toLowerCase())
      ).length,
      color: "indigo",
      key: "ongoing",
    },
    { label: "Total Earnings", value: `₹${totalEarnings}`, color: "teal" },
  ];

  const statusColors = {
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
    in_progress: "bg-indigo-100 text-indigo-800",
    incomplete: "bg-red-100 text-red-800",
  };

  const filteredTasks = filter
    ? filter === "all"
      ? assignedTasks
      : assignedTasks.filter((t) =>
          filter === "completed"
            ? t.status.toLowerCase() === "completed"
            : ["ongoing", "in_progress"].includes(t.status.toLowerCase())
        )
    : [];

  return (
    <section className="max-w-6xl mx-auto p-8 bg-white rounded-2xl shadow-xl space-y-12">
      <h1 className="text-center text-3xl font-bold mb-5 text-gray-900">My Work Summary</h1>

      {/* Stats */}
      <div className="flex flex-wrap justify-center gap-4">
        {stats.map(({ label, value, color, key }) => (
          <button
            key={key || label}
            onClick={() => key && setFilter(key)}
            className={`min-w-[120px] px-5 py-3 rounded-lg border border-gray-200 cursor-pointer text-center shadow-sm
              bg-${color}-100 text-${color}-900
              ${filter === key ? "ring-2 ring-offset-2 ring-blue-500" : ""}
              ${key ? "hover:brightness-90 transition" : "opacity-60 cursor-default"}`}
            title={key ? `Show ${label}` : ""}
          >
            <div className="text-lg font-bold">{value}</div>
            <div className="text-xs">{label}</div>
          </button>
        ))}
      </div>

      {filter && (
        <div className="text-center">
          <button
            onClick={() => setFilter(null)}
            className="px-6 py-2 bg-red-600 text-white text-sm rounded-md shadow hover:bg-red-500 transition"
          >
            Hide Tasks
          </button>
        </div>
      )}

      {filter && (
        <div className="space-y-8">
          {filteredTasks.length ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTasks.map(({ _id, title, description, status, budget, deadline, submissionFiles }) => (
                <li
                  key={_id}
                  onClick={() => navigate(`/tasks/${_id}`)}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-5 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
                  title="Click to view task details"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-4">{description}</p>

                  <div className="flex flex-wrap gap-3 text-xs font-medium text-gray-700 mb-3">
                    <span className={statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-700"}>
                      {status[0].toUpperCase() + status.slice(1)}
                    </span>
                    <span>Budget: ₹{budget}</span>
                    <span>
                      Deadline:{" "}
                      {new Date(deadline).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {submissionFiles?.length > 0 && (
                    <a
                      href={submissionFiles[0].fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Submission
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 italic text-lg">No tasks found.</p>
          )}
        </div>
      )}

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Earned Badges</h2>
        <ProfileBadges badges={data?.badges} />
      </section>
    </section>
  );
}