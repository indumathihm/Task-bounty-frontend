import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBidsForTask, createBid, deleteBid, updateBid, updateBidStatus, assignEditId } from "../../slices/bidSlice";
import { toast } from "react-toastify";

export default function BidInfo() {
  const dispatch = useDispatch();
  const task = useSelector((state) => state.task.selectedTask);
  const user = useSelector((state) => state.user.data);
  const { bids = [], loading, error, editId } = useSelector((state) => state.bid);

  const [bidAmount, setBidAmount] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const taskId = task?._id;
  const postedById = task?.postedBy?._id || task?.postedBy || "";
  const isOwner = String(postedById) === String(user?._id);
  const taskStatus = task?.status || "";
  const userBid = bids.find((bid) => String(bid.userId?._id || bid.userId) === String(user?._id));

  useEffect(() => {
    if (editId) {
      const bid = bids.find((b) => b._id === editId);
      if (bid) {
        setBidAmount(bid.bidAmount);
        setComment(bid.comment || "");
        return;
      }
    }
    setBidAmount("");
    setComment("");
  }, [editId, bids]);

  useEffect(() => {
    if (taskId) dispatch(getBidsForTask(taskId));
  }, [dispatch, taskId]);

  const refreshBids = () => {
    if (taskId) dispatch(getBidsForTask(taskId));
  };

  const canBid =
    !["accepted", "completed"].includes(taskStatus) &&
    !["poster", "admin"].includes(user?.role) &&
    (!userBid || editId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bidAmount) return toast.error("Bid amount required");
    setSubmitting(true);

    try {
      if (editId) {
        await dispatch(updateBid({ bidId: editId, bidAmount, comment })).unwrap();
        toast.success("Bid updated!");
        dispatch(assignEditId(null));
      } else {
        await dispatch(createBid({ taskId, bidAmount, comment })).unwrap();
        toast.success("Bid placed!");
      }
      setBidAmount("");
      setComment("");
      refreshBids();
    } catch {
      toast.error("Failed to submit bid");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => dispatch(assignEditId(null));

  const handleDelete = async (bidId) => {
    if (!window.confirm("Delete this bid?")) return;
    try {
      await dispatch(deleteBid(bidId)).unwrap();
      toast.success("Bid deleted");
      refreshBids();
      if (editId === bidId) handleCancelEdit();
    } catch {
      toast.error("Delete failed");
    }
  };

  const updateStatus = async (bidId, status, successMsg, failMsg) => {
    try {
      await dispatch(updateBidStatus({ bidId, status })).unwrap();
      toast.success(successMsg);
      refreshBids();
    } catch {
      toast.error(failMsg);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow mt-4">
      <h2 className="text-xl font-bold mb-4">Bids</h2>

      {canBid && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block font-medium">Bid Amount</label>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full border rounded p-2"
              min="0"
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block font-medium">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded p-2"
              disabled={submitting}
            />
          </div>
          <div className="space-x-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={submitting}
            >
              {editId ? "Update Bid" : "Submit Bid"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-400 text-white px-4 py-2 rounded"
                disabled={submitting}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {!["accepted", "completed"].includes(taskStatus) &&
        !["poster", "admin"].includes(user?.role) &&
        userBid &&
        !editId && (
          <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
            You have already placed a bid for this task.
          </div>
        )}

      {taskStatus === "completed" ? (
        <p className="text-gray-500 italic">This task has been completed.</p>
      ) : loading ? (
        <p>Loading bids...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : bids.length === 0 ? (
        <p>No bids yet.</p>
      ) : (
        <ul className="space-y-4">
          {bids.map((bid) => {
            const isBidOwner = String(bid.userId?._id || bid.userId) === String(user?._id);
            return (
              <li key={bid._id} className="border rounded p-4">
                <div className="flex justify-between items-center">
                  <p>
                    <strong>{bid.userId?.name || "User"}</strong> — ₹{bid.bidAmount}
                  </p>
                  <span className="text-sm text-gray-600 capitalize">{bid.status}</span>
                </div>
                {bid.comment && <p className="mt-2 text-gray-700">{bid.comment}</p>}

                {isBidOwner && taskStatus === "open" && (
                  <div className="mt-2 space-x-4">
                    <button
                      onClick={() => dispatch(assignEditId(bid._id))}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bid._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}

                {isOwner && bid.status === "pending" && taskStatus !== "accepted" && (
                  <div className="mt-2 space-x-4">
                    <button
                      onClick={() => updateStatus(bid._id, "accepted", "Bid assigned", "Failed to assign")}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => updateStatus(bid._id, "rejected", "Bid rejected", "Failed to reject")}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
