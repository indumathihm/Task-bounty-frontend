import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTasks } from "../../slices/taskSlice"; 
import { getBidsForTask } from "../../slices/bidSlice";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  inprogress: "bg-blue-100 text-blue-800",
};

export default function Tasks () {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.task);
  const [taskBidsMap, setTaskBidsMap] = useState({});

  useEffect(() => {
    dispatch(fetchAllTasks());
  }, [dispatch]);

  useEffect(() => {
    if (!tasks.length) {
      setTaskBidsMap({});
      return;
    }

    const fetchBids = async () => {
      try {
        const results = await Promise.all(tasks.map((task) => dispatch(getBidsForTask(task._id))));
        const bidsMap = {};
        results.forEach((res, i) => {
          if (getBidsForTask.fulfilled.match(res)) {
            bidsMap[tasks[i]._id] = res.payload;
          }
        });
        setTaskBidsMap(bidsMap);
      } catch (err) {
        console.error("Error fetching bids:", err);
      }
    };

    fetchBids();
  }, [dispatch, tasks]);

  const formatStatus = (status = "Pending") => {
    const key = status.toLowerCase().replace(/\s/g, "");
    const classes = statusColors[key] || "bg-gray-100 text-gray-800";
    return (
      <span className={`${classes} px-2 py-1 rounded-full text-xs font-semibold uppercase`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
      </header>

      {loading && <p className="text-blue-600 font-medium text-center mb-6">Loading tasks...</p>}

      {!loading && tasks.length === 0 && (
        <p className="text-gray-500 text-center italic">No tasks found.</p>
      )}

      {tasks.length > 0 && (
        <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <caption className="sr-only">List of all tasks</caption>
            <thead className="bg-gray-50">
              <tr>
                {["Title", "Category", "Budget", "Posted By", "Assigned To", "Status", "Accepted Bid"].map(
                  (heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {tasks.map((task) => {
                const bids = taskBidsMap[task._id] || [];
                const acceptedBid = bids.find((bid) => bid.status === "accepted");

                return (
                  <tr key={task._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {task.title}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {task.category?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-semibold">
                      ₹{task.budget.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {task.postedBy?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {task.assignedTo?.name || (
                        <span className="italic text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{formatStatus(task.status)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {acceptedBid?.bidAmount != null && !isNaN(acceptedBid.bidAmount)
                        ? `₹${Number(acceptedBid.bidAmount).toLocaleString()}`
                        : <span className="italic text-gray-400">No Accepted Bid</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
