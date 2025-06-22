import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllTasks } from "../../slices/taskSlice";
import { useNavigate } from "react-router-dom";

export default function TaskSubmission() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tasks, loading } = useSelector((state) => state.task);

  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    dispatch(fetchAllTasks({ status: "in_progress,submitted" }));
  }, [dispatch]);

  const handleChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === "all") return ["in_progress", "submitted"].includes(task.status);
    return task.status === filterStatus;
  });

  const renderMessage = () => {
    if (filterStatus === "in_progress") return <p className="text-gray-600">No tasks under progress.</p>;
    if (filterStatus === "submitted") return <p className="text-gray-600">No tasks under submission.</p>;
    return <p className="text-gray-600">No tasks found.</p>;
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="statusFilter" className="mr-2 font-medium">Filter by:</label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={handleChange}
          className="border px-3 py-1 rounded shadow"
        >
          <option value="all">All</option>
          <option value="in_progress">In Progress</option>
          <option value="submitted">Submitted</option>
        </select>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        renderMessage()
      ) : (
        filteredTasks.map((task) => (
          <div
            key={task._id}
            onClick={() => navigate(`/tasks/${task._id}`)}
            className="p-4 border rounded shadow bg-white cursor-pointer hover:bg-gray-50 transition"
          >
            <h3 className="text-lg font-semibold text-blue-600">{task.title}</h3>
            <p>Status: <strong>{task.status}</strong></p>
            <p>{task.description}</p>
          </div>
        ))
      )}
    </div>
  );
}
