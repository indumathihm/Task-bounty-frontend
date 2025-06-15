import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTransactions } from "../../slices/userSlice";

const types = [ "task_posting", "task_payment", "subscription_payment", "deposit", "withdraw"];

export default function TransactionsAdminView () {
  const dispatch = useDispatch();
  const { transactions, loading, error } = useSelector((state) => state.user);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    dispatch(getTransactions({ search: type || search }));
  }, [dispatch, search, type]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Transactions</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={!!type}
          className={`flex-grow min-w-[240px] px-3 py-2 border rounded ${
            type ? "bg-gray-100 cursor-not-allowed" : "bg-white"
          }`}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 border rounded min-w-[180px]"
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-center text-gray-600 italic">Loading...</p>}
      {error && <p className="text-center text-red-600 font-semibold">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              {["Name", "Type", "Amount (₹)", "Method", "Date"].map((head) => (
                <th key={head} className="border px-4 py-2 text-left">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && transactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500 italic">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t._id} className="even:bg-gray-50 hover:bg-gray-100">
                  <td className="border px-4 py-2">{t.userId?.name || "Unknown"}</td>
                  <td className="border px-4 py-2 capitalize">{t.type.replace(/_/g, " ")}</td>
                  <td className="border px-4 py-2">{t.amount.toFixed(2)}</td>
                  <td className="border px-4 py-2 capitalize">{t.method}</td>
                  <td className="border px-4 py-2 whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};