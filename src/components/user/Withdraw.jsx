import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withdrawMoney, fetchUserAccount } from "../../slices/userSlice"
import { toast } from 'react-toastify';

export default function Withdraw() {
  const dispatch = useDispatch();
  const { data: user, loading } = useSelector((state) => state.user);

  const [amount, setAmount] = useState('');

  const handleWithdraw = async (e) => {
    e.preventDefault();

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error('Enter a valid amount greater than 0');
      return;
    }

    if (user?.walletBalance < numericAmount) {
      toast.error('Insufficient wallet balance');
      return;
    }

    const result = await dispatch(withdrawMoney({ amount }));

    if (withdrawMoney.fulfilled.match(result)) {
      toast.success(`Withdrawn ₹${amount} successfully`);
      setAmount('');
      dispatch(fetchUserAccount());
    } else {
      toast.error(result.payload || 'Withdrawal failed');
    }
  };

  return (
    <div className="max-w-md mx-auto  p-4">
      <h2 className="text-xl font-semibold mb-3">Withdraw Amount</h2>
      {user && (
        <p className="mt-3 text-gray-700">
          Balance: ₹{user.walletBalance?.toFixed(2)}
        </p>
      )}  

      <form onSubmit={handleWithdraw} className="space-y-3">
        <input
          type="number"
          placeholder="Enter amount"
          min="1"
          className="w-full border px-3 py-2 rounded"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Withdraw
        </button>
      </form>      
    </div>
  );
};