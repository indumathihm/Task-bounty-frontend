import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllTasks } from "../../slices/taskSlice";
import { useNavigate } from "react-router-dom";

export default function TaskSubmission () {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tasks, loading } = useSelector((state) => state.task);

  useEffect(() => {
    dispatch(fetchAllTasks());
  }, [dispatch]);

  const filteredTasks = tasks.filter(
    (task) => task.status === "in_progress" || task.status === "submitted"
  );

  if (loading) return <p>Loading tasks...</p>;

  if (filteredTasks.length === 0)
    return <p>No tasks in progress or submitted.</p>;

  return (
    <div className="space-y-4">
      {filteredTasks.map((task) => (
        <div
          key={task._id}
          onClick={() => navigate(`/tasks/${task._id}`)}
          className="p-4 border rounded shadow bg-white cursor-pointer hover:bg-gray-50 transition"
        >
          <h3 className="text-lg font-semibold text-blue-600">
            {task.title}
          </h3>
          <p>Status: <strong>{task.status}</strong></p>
          <p>{task.description}</p>
        </div>
      ))}
    </div>
  );
};

