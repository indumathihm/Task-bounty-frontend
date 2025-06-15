import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyTasks, assignEditId, removeTask } from "../../slices/taskSlice";
import { getBidsForTask } from "../../slices/bidSlice";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import TaskForm from "./TaskForm";
import { useNavigate } from "react-router-dom";

export default function Tasks () {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { tasks, loading } = useSelector((state) => state.task);
  const { data } = useSelector((state) => state.user);

  const [taskBidsMap, setTaskBidsMap] = useState({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (data?._id) {
      dispatch(fetchMyTasks(data._id));
    }
  }, [dispatch, data]);

  useEffect(() => {
    if (tasks.length === 0) {
      setTaskBidsMap({});
      return;
    }

    const fetchAllBids = async () => {
      try {
        const allResults = await Promise.all(
          tasks.map((task) => dispatch(getBidsForTask(task._id)))
        );

        const newTaskBidsMap = {};
        allResults.forEach((resultAction, idx) => {
          if (getBidsForTask.fulfilled.match(resultAction)) {
            newTaskBidsMap[tasks[idx]._id] = resultAction.payload;
          }
        });

        setTaskBidsMap(newTaskBidsMap);
      } catch (error) {
        console.error("Error fetching bids for tasks:", error);
      }
    };

    fetchAllBids();
  }, [dispatch, tasks]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await dispatch(removeTask(id));
      if (res.type.includes("fulfilled")) {
        toast.success("Task deleted");
      } else {
        toast.error("Failed to delete task");
      }
    } catch {
      toast.error("Error occurred");
    }
  };

  const handleEdit = (id) => {
    dispatch(assignEditId(id));
    setShowForm(true);
  };

  const handleRowClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">My Tasks</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => {
            dispatch(assignEditId(null));
            setShowForm((prev) => !prev);
          }}
        >
          {showForm ? "Close Form" : "+ Create Task"}
        </button>
      </div>

      {loading && <p className="text-blue-500">Loading...</p>}

      {tasks.length === 0 ? (
        <p className="text-gray-500 text-center">
          You currently have 0 tasks. Create your first task to get started!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Budget</th>
                <th className="px-2 py-2">Bid Deadline</th>
                <th className="px-2 py-2">Task Deadline</th>
                <th className="px-2 py-2">Posted By</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Assigned To</th>
                <th className="px-2 py-2">Accepted Bid</th>
                <th className="px-2 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const isOwner = task.postedBy?._id === data?._id;
                const isAssignedToMe = task.assignedTo?._id === data?._id;

                const bidsForThisTask = taskBidsMap[task._id] || [];
                const acceptedBid = bidsForThisTask.find(
                  (bid) => bid.status === "accepted"
                );

                return (
                  <tr
                    key={task._id}
                    onClick={() => handleRowClick(task._id)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <td className="px-2 py-2">{task.title}</td>
                    <td className="px-2 py-2">₹{task.budget}</td>
                    <td className="px-2 py-2">                    
                      {task.bidEndDate
                        ? new Date(task.bidEndDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })
                        : "N/A"}
                    </td>
                    <td className="px-2 py-2">
                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })
                        : "N/A"}
                    </td>
                    <td className="px-2 py-2">{task.postedBy?.name || "N/A"}</td>
                    <td className="px-2 py-2">{task.status || "Pending"}</td>
                    <td className="px-2 py-2">
                      {task.assignedTo?.name || "Unassigned"}
                    </td>
                    <td className="px-2 py-2">
                      {acceptedBid && acceptedBid.bidAmount != null && !isNaN(acceptedBid.bidAmount)
                        ? `₹${Number(acceptedBid.bidAmount).toLocaleString()}`
                        : "No Accepted Bid"}
                    </td>
                    <td
                      className="px-2 py-2 text-center space-x-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isOwner && task.status !== "completed" && (
                        <>
                          <button
                            onClick={() => handleEdit(task._id)}
                            className="text-green-600 hover:text-green-800"
                            title="Edit"
                          >
                            <FaEdit className="inline-block w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <FaTrash className="inline-block w-4 h-4" />
                          </button>
                        </>
                      )}
                      {!isOwner && isAssignedToMe && task.status !== "completed" && (
                        <button
                          onClick={() => handleEdit(task._id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit (Assigned)"
                        >
                          <FaEdit className="inline-block w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="mt-6 border p-4 rounded bg-gray-50">
          <TaskForm />
        </div>
      )}
    </div>
  );
};

