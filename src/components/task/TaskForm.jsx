import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTaskWithWallet, updateTask, fetchMyTasks } from "../../slices/taskSlice";
import { fetchCategories } from "../../slices/categorySlice";
import { toast } from "react-toastify";

export default function TaskForm() {
  const dispatch = useDispatch();
  const { tasks, editId } = useSelector((state) => state.task);
  const { data: categories } = useSelector((state) => state.category);
  const user = useSelector((state) => state.user.data);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [category, setCategory] = useState("");
  const [bidEndDate, setBidEndDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchCategories());
    if (user?._id) dispatch(fetchMyTasks(user._id));
  }, [dispatch, user]);

  useEffect(() => {
    if (editId && tasks.length > 0) {
      const task = tasks.find((t) => t._id === editId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setBudget(task.budget);
        setCategory(task.category);
        setBidEndDate(task.bidEndDate?.slice(0, 10));
        setDeadline(task.deadline?.slice(0, 10));
      }
    } else {
      resetForm();
    }
  }, [editId, tasks]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setBudget("");
    setCategory("");
    setBidEndDate("");
    setDeadline("");
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!budget || isNaN(budget) || parseFloat(budget) <= 0) {
      newErrors.budget = "Budget must be a positive number.";
    }
    if (!category) newErrors.category = "Category is required.";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!deadline) {
      newErrors.deadline = "Deadline is required.";
    } else {
      const deadlineDate = new Date(deadline);
      if (deadlineDate <= today) {
        newErrors.deadline = "Deadline must be after today.";
      }
    }

    if (!bidEndDate) {
      newErrors.bidEndDate = "Bid end date is required.";
    } else {
      const bidDate = new Date(bidEndDate);
      const deadlineDate = new Date(deadline);
      if (bidDate <= today) {
        newErrors.bidEndDate = "Bid end date must be after today.";
      } else if (deadline && bidDate >= deadlineDate) {
        newErrors.bidEndDate = "Bid end date must be before the task deadline.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all the required fields before submitting.");
      return;
    }

    const taskBudget = parseFloat(budget);
    const walletBalance = user?.walletBalance || 0;

    if (!editId && taskBudget > walletBalance) {
      toast.error("Insufficient wallet balance. Please top up your wallet.");
      return;
    }

    try {
      if (editId) {
        const resultAction = await dispatch(
          updateTask({
            taskObj: {
              _id: editId,
              description,
              bidEndDate,
              deadline,
            },
          })
        );

        if (updateTask.fulfilled.match(resultAction)) {
          toast.success("Task updated successfully");
          await dispatch(fetchMyTasks(user._id));
          resetForm();
        } else {
          toast.error(resultAction.payload || "Failed to update task");
        }
      } else {
        const resultAction = await dispatch(
          createTaskWithWallet({
            title,
            description,
            budget,
            category,
            bidEndDate,
            deadline,
            userId: user._id,
          })
        );

        if (createTaskWithWallet.fulfilled.match(resultAction)) {
          toast.success("Task created successfully");
          await dispatch(fetchMyTasks(user._id));
          resetForm();
        } else {
          toast.error(resultAction.payload || "Failed to create task");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  if (!user) return <div>Loading...</div>;

  const minDate = new Date(Date.now() + 86400000).toISOString().split("T")[0]; // Tomorrow

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto p-6  rounded-md space-y-4"
    >
      <h1 className="text-2xl font-semibold text-gray-800 text-center mb-4">
        {editId ? "Edit Task Description" : "Create New Task"}
      </h1>

      <div>
        <label className="block mb-1 font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!!editId}
          className="w-full p-2 border rounded"
          placeholder="Enter task title"
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Describe the task"
          rows={4}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 font-medium">Budget (₹)</label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          disabled={!!editId}
          className="w-full p-2 border rounded"
          placeholder="Enter task budget"
        />
        {errors.budget && (
          <p className="text-red-500 text-sm">{errors.budget}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={!!editId}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a category</option>
          {categories?.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm">{errors.category}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 font-medium">Bid End Date</label>
        <input
          type="date"
          value={bidEndDate}
          onChange={(e) => setBidEndDate(e.target.value)}
          className="w-full p-2 border rounded"
          min={minDate}
        />
        {errors.bidEndDate && (
          <p className="text-red-500 text-sm">{errors.bidEndDate}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 font-medium">Task Deadline</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full p-2 border rounded"
          min={minDate}
        />
        {errors.deadline && (
          <p className="text-red-500 text-sm">{errors.deadline}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
      >
        {editId ? "Update Task" : "Create Task"}
      </button>
    </form>
  );
}
