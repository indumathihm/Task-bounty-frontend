import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { showTask, submitTaskFile, markTaskCompleted } from "../../slices/taskSlice";
import BidInfo from "./BidInfo";

export default function TaskDetails() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const dispatch = useDispatch();

  const { selectedTask: task, loading } = useSelector((state) => state.task);
  const user = useSelector((state) => state.user.data);

  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(showTask(taskId));
    } else {
      navigate("/login");
    }
  }, [dispatch, navigate, taskId]);

  useEffect(() => {
    setSubmitted(task?.submissionFiles?.length > 0);
  }, [task]);

  const taskStatus = task?.status?.toLowerCase();
  const isAssignedHunter =
    user?.role === "hunter" && task?.assignedTo?._id === user._id;
  const isTaskOwner = user?._id === task?.postedBy?._id;

  const canSubmit =
    isAssignedHunter &&
    !submitted &&
    !["submitted", "under_review", "completed", "accepted"].includes(taskStatus);

  const getStatusClasses = (status) => {
    const map = {
      open: "bg-blue-100 text-blue-700",
      in_progress: "bg-gray-100 text-gray-700",
      completed: "bg-green-100 text-green-700",
      incomplete: "bg-red-100 text-red-700",
      rejected: "bg-red-100 text-red-700",
      submitted: "bg-yellow-100 text-yellow-700",
      under_review: "bg-yellow-100 text-yellow-700",
    };
    return map[status] || "bg-gray-200 text-gray-600";
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please choose a file to submit.");
    const result = await dispatch(submitTaskFile({ taskId, file }));
    if (result.meta.requestStatus === "fulfilled") {
      alert("Task submitted successfully!");
      setFile(null);
      setSubmitted(true);
      dispatch(showTask(taskId));
    } else {
      alert("Failed to submit task: " + (result.payload || "Unknown error"));
    }
  };

  const handleAccept = async () => {
    if (!confirm("Accept this submission?")) return;
    const result = await dispatch(
      markTaskCompleted({ id: taskId, status: "completed" })
    );
    if (result.meta.requestStatus === "fulfilled") {
      alert("Task accepted!");
      dispatch(showTask(taskId));
    } else {
      alert("Failed to accept task: " + (result.payload || "Unknown error"));
    }
  };

  const handleReject = async () => {
    if (!confirm("Reject this submission?")) return;
    const result = await dispatch(
      markTaskCompleted({ id: taskId, status: "incomplete" })
    );
    if (result.meta.requestStatus === "fulfilled") {
      alert("Task rejected.");
      dispatch(showTask(taskId));
    } else {
      alert("Failed to reject task: " + (result.payload || "Unknown error"));
    }
  };

  if (!user) {
    return (
      <div className="text-center text-red-500 py-8">
        Please log in to view task details.
      </div>
    );
  }

  if (!task || Object.keys(task).length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">Loading task...</div>
    );
  }

  return (
    <div className="mx-auto text-left px-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-2 px-4 py-1 text-gray-700 rounded hover:bg-gray-200 "
      >
        Back
      </button>

      <div className="bg-white shadow-md rounded-xl p-6 space-y-6 text-left">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src={task.postedBy?.avatar || "https://via.placeholder.com/48"}
              alt={task.postedBy?.name}
              className="w-12 h-12 rounded-full border border-gray-300 object-cover"
            />
            <p className="font-semibold text-lg text-gray-800">
              {task.postedBy?.name}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-700 font-medium">
              Budget: ₹{task.budget || "N/A"}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClasses(
                taskStatus
              )}`}
            >
              {task.status}
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {task.title}
          </h2>
          <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
        </div>

        {canSubmit && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Submit Your Work
            </h3>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}

        {submitted && isAssignedHunter && (
          <>
            {["submitted", "under_review"].includes(taskStatus) && (
              <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded">
                <strong>Task Submitted</strong>
                <p>Your submission is under review.</p>
              </div>
            )}
            {["rejected", "incomplete"].includes(taskStatus) && (
              <div className="bg-red-100 border-l-4 border-red-400 text-red-700 p-4 rounded">
                <strong>Task Rejected</strong>
                <p>Unfortunately, your submission was not accepted.</p>
              </div>
            )}
            {taskStatus === "completed" && (
              <div className="bg-green-100 border-l-4 border-green-400 text-green-700 p-4 rounded">
                <strong>Task Completed</strong>
                <p>Your submission was accepted. Great job!</p>
              </div>
            )}
          </>
        )}

        {isTaskOwner && (
          <>
            {["submitted", "under_review"].includes(taskStatus) && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Submitted Files
                </h3>
                {task.submissionFiles?.length > 0 ? (
                  <ul className="list-disc list-inside text-blue-600 space-y-1">
                    {task.submissionFiles.map((file, idx) => (
                      <li key={file._id || idx}>
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-blue-800"
                        >
                          {file.originalName || `View File ${idx + 1}`}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">No files submitted.</p>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={handleAccept}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {taskStatus === "completed" && (
              <div className="bg-green-100 border-l-4 border-green-400 text-green-700 p-4 rounded">
                <strong>Task Completed</strong>
                <p>You accepted this submission.</p>
              </div>
            )}
          </>
        )}         
          <BidInfo/>
      </div>
    </div>
  );
}
