import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { fetchTasks } from "../../slices/taskSlice";
import { fetchCategories } from "../../slices/categorySlice";
import { getBidsForTask } from "../../slices/bidSlice";

const ITEMS_PER_PAGE = 10;

export default function AllTasks () {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { tasks = [], loading, error, totalPages = 0 } = useSelector((state) => state.task);
  const { data: categories = [] } = useSelector((state) => state.category);

  const [taskBids, setTaskBids] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [endingSoon, setEndingSoon] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder, selectedCategory, endingSoon]);

  useEffect(() => {
    dispatch(
      fetchTasks({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchTerm,
        sortBy,
        sortOrder,
        category: selectedCategory || undefined,
        endingSoon,
      })
    );
  }, [dispatch, currentPage, searchTerm, sortBy, sortOrder, selectedCategory, endingSoon]);

  useEffect(() => {
    if (!tasks.length) return;

    const fetchAllBids = async () => {
      const bidsMap = {};
      await Promise.all(
        tasks.map(async (task) => {
          try {
            const bids = await dispatch(getBidsForTask(task._id)).unwrap();
            bidsMap[task._id] = bids;
          } catch {
            bidsMap[task._id] = [];
          }
        })
      );
      setTaskBids(bidsMap);
    };

    fetchAllBids();
  }, [tasks, dispatch]);

  const handleCategoryClick = (id) => {
    setSelectedCategory((prev) => (prev === id ? null : id));
  };

  const handlePageChange = (num) => {
    if (num >= 1 && num <= totalPages) {
      setCurrentPage(num);
    }
  };

  const handleSortChange = (e) => {
    const [field, order, status] = e.target.value.split("|");
    setSortBy(field);
    setSortOrder(order);
    setEndingSoon(status === "open");
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-gray-100 text-gray-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "incomplete":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  const visibleTasks = tasks.filter((task) => {
    const isOpen = task.status?.toLowerCase() === "open";
    const isBidActive = new Date(task.bidEndDate) >= new Date();
    return isOpen && isBidActive;
  });

  return (
    <div className="px-5 max-w-7xl mx-auto text-left">
      <h1 className="text-3xl font-bold mb-6">Browse Tasks</h1>

      {/* Search & Sorting */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative w-full md:w-3/4">
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full p-3 border border-gray-300 rounded-xl pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>

        <select
          value={endingSoon ? "bidEndDate|asc|open" : `${sortBy}|${sortOrder}`}
          onChange={handleSortChange}
          className="w-full md:w-1/4 p-3 rounded-xl border border-gray-300"
        >
          <option value="">Sort By</option>
          <option value="createdAt|desc">Latest</option>
          <option value="createdAt|asc">Oldest</option>
          <option value="budget|asc">Lowest Price</option>
          <option value="budget|desc">Highest Price</option>
          <option value="bidEndDate|asc|open">Ending Soonest</option>
        </select>
      </div>

      {/* Category Filters */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hidden">
        {categories.map(({ _id, name }) => (
          <button
            key={_id}
            onClick={() => handleCategoryClick(_id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
              selectedCategory === _id
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-600">Loading tasks...</p>}
      {error && <p className="text-red-500">{error.message || error}</p>}
      {!loading && visibleTasks.length === 0 && <p>No matching tasks found.</p>}

      {/* Task Cards */}
      <div className="grid gap-6">
        {visibleTasks.map((task) => (
          <div
            key={task._id}
            onClick={() => navigate(`/tasks/${task._id}`)}
            className="border rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer bg-white"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
                <p className="text-gray-700 font-medium mt-1">Budget: ₹{task.budget}</p>
                <p className="text-gray-700 font-medium mt-1">Owner: {task.postedBy?.name}</p>

              </div>
              <div className="flex flex-col items-end text-sm text-gray-600 space-y-1">
                <div className="flex items-center space-x-4">
                  <span>Bids: {taskBids[task._id]?.length || 0}</span>
                  <span className={`px-3 py-1 rounded-full ${getStatusBadgeClass(task.status)}`}>
                    {task.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            <p className="mb-6 text-gray-600 line-clamp-3">{task.description}</p>

            <div className="text-sm text-gray-500">
              Deadline: {new Date(task.deadline).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => handlePageChange(num)}
              className={`px-4 py-2 rounded ${
                currentPage === num
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};