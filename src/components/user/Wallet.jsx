import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createRazorpayOrder, depositMoney, getWalletBalance } from "../../slices/userSlice"
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

export default function Wallet() {
  const [amount, setAmount] = useState('');
  const dispatch = useDispatch();
  const { loading, error, data } = useSelector(state => state.user);

  useEffect(() => {
    if (data && data.userId) {
      dispatch(getWalletBalance(data.userId));
    }
  }, [data, dispatch]);

  const handlePayment = async () => {
    const numericAmount = Number(amount);

    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      toast.warning("Enter a valid amount");
      return;
    }

    const result = await dispatch(createRazorpayOrder(numericAmount));

    if (!result.payload) {
      toast.error("Failed to create order. Please try again.");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: numericAmount * 100,
      currency: 'INR',
      name: "TaskBounty",
      description: "Wallet Deposit",
      order_id: result.payload.id,
      handler: async function (response) {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

        const depositResult = await dispatch(depositMoney({
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          signature: razorpay_signature,
          amount: numericAmount,
        }));

        if (depositResult.payload) {
          toast.success("Amount added to wallet!");
          dispatch(getWalletBalance(data.userId));
          setAmount('');
          dispatch(getWalletBalance(data.userId));
        } else {
          toast.error("Payment verification failed.");
        }
      },
      theme: {
        color: "#3399cc"
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="p-6 max-w-md mx-auto  rounded">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Add Money to Wallet</h1>
      <p className="text-lg mb-4">Wallet Balance: ₹{data?.walletBalance ?? 0}</p>

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <button
        onClick={handlePayment}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Processing..." : "Deposit"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}