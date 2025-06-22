import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchCategories } from "../../slices/categorySlice";
import { useNavigate } from "react-router-dom";

export default function AllCategories() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: categories } = useSelector((state) => state.category);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCategoryClick = (name) => {
    setSelectedCategory(name);
    navigate("/all-tasks");
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {categories.map(({ _id, name }) => (
          <div
            key={_id || name}
            onClick={() => handleCategoryClick(name)}
            className={`flex items-center justify-center h-16 text-base sm:text-lg font-medium cursor-pointer select-none px-4 rounded-xl transition-all text-center
              ${
                selectedCategory === name
                  ? "bg-blue-200 text-blue-900 border border-blue-500"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}
