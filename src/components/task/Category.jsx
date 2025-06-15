import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, createCategory, updateCategory, assignEditId, removeCategory } from "../../slices/categorySlice";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Category() {
  const dispatch = useDispatch();
  const { data, serverErrors, editId, loading } = useSelector(
    (state) => state.category
  );
  const [name, setName] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (editId) {
      const category = data.find((c) => c._id === editId);
      setName(category ? category.name : "");
    } else {
      setName("");
    }
  }, [data, editId]);

  const resetForm = () => setName("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please provide a category name.");

    const onSuccess = () => {
      toast.success(`Category ${editId ? "updated" : "added"} successfully!`);
      resetForm();
    };

    if (editId) {
      const category = data.find((c) => c._id === editId);
      dispatch(updateCategory({ categoryObj: { ...category, name }, resetForm }))
        .unwrap()
        .then(onSuccess)
        .catch(() => {});
    } else {
      dispatch(createCategory({ body: { name }, resetForm }))
        .unwrap()
        .then(onSuccess)
        .catch(() => {});
    }
  };

  const handleRemove = (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    dispatch(removeCategory(id))
      .unwrap()
      .then(() => toast.success("Category removed successfully!"))
      .catch((err) => {
        toast.error(err?.message || "Category deletion failed.");
      });
  };

  return (
    <div className="max-w-5xl mx-auto px-10">
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          {editId ? "Edit" : "Add"} Category
        </h1>

        {serverErrors && !serverErrors.message && (
          <ul className="text-red-500 mb-4">
            {serverErrors.errors?.map((err, i) => (
              <li key={i}>{err.msg || err}</li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter category name"
          />
          <button
            type="submit"
            disabled={loading}
            className={`py-2 px-4 rounded-md font-semibold transition duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {editId ? "Update" : "Add"} Category
          </button>
        </form>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Available Categories
        </h3>

        <div className="overflow-auto">
          <table className="w-full table-auto text-sm text-left border border-gray-200 rounded-lg">
            <thead className="text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center py-4 text-gray-500">
                    No categories found.
                  </td>
                </tr>
              ) : (
                data.map(({ _id, name }) => (
                  <tr key={_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{name}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => dispatch(assignEditId(_id))}
                        className="text-green-500 hover:text-green-800"
                        title="Edit"
                      >
                        <FaEdit className="inline-block w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(_id)}
                        disabled={loading}
                        className={`text-red-500 hover:text-red-800 ${
                          loading ? "cursor-not-allowed opacity-50" : ""
                        }`}
                        title="Delete"
                      >
                        <FaTrash className="inline-block w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
