import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSubscription, getSubscriptionStatus, verifySubscription } from '../../slices/subscriptionSlice';
import { toast } from 'react-toastify';
import { FaSpinner, FaCrown } from 'react-icons/fa';

export default function Subscription() {
  const dispatch = useDispatch();
  const { loading, isActive, subscriptionEndDate } = useSelector((state) => state.subscription);
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    dispatch(getSubscriptionStatus());
  }, [dispatch]);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleSubscribe = async (planType) => {
    setActivePlan(planType);
    try {
      const resultAction = await dispatch(createSubscription(planType));
      if (!createSubscription.fulfilled.match(resultAction)) {
        toast.error(resultAction.payload || 'Failed to create order');
        setActivePlan(null);
        return;
      }
      openRazorpay(resultAction.payload.order, planType);
    } catch {
      toast.error('Subscription initiation failed');
      setActivePlan(null);
    }
  };

  const openRazorpay = async (order, planType) => {
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      toast.error('Failed to load Razorpay SDK');
      setActivePlan(null);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: 'INR',
      name: 'TaskBounty',
      description: `Subscribe to ${planType} plan`,
      order_id: order.id,
      handler: async (response) => {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
        try {
          const verifyAction = await dispatch(
            verifySubscription({ payment_id: razorpay_payment_id, order_id: razorpay_order_id, signature: razorpay_signature, planType })
          );
          if (verifySubscription.fulfilled.match(verifyAction)) {
            toast.success('Subscription successful!');
            localStorage.setItem(
              'subscription',
              JSON.stringify({
                subscriptionId: verifyAction.payload.subscriptionId,
                subscriptionEndDate: verifyAction.payload.subscriptionEndDate,
                isActive: true,
              })
            );
            dispatch(getSubscriptionStatus());
          } else {
            toast.error(verifyAction.payload || 'Payment verification failed');
          }
        } catch {
          toast.error('Payment verification error');
        }
        setActivePlan(null);
      },
      theme: { color: '#4F46E5' }, // Indigo/Blue
    };

    new window.Razorpay(options).open();
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  return (
    <div className="max-w-3xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-10 text-gray-800">Get Premium Access</h1>

      {isActive ? (
        <div className="text-sky-600 flex flex-col items-center">
          <FaCrown className="text-3xl mb-2" />
          <p className="text-lg font-semibold">You have an active subscription.</p>
          <p className="text-sm text-gray-600">Valid till: {formatDate(subscriptionEndDate)}</p>
        </div>
      ) : (
        <div className="flex justify-between space-x-4">
          <PlanCard
            title="Monthly Plan"
            price="₹299"
            description="Billed every month."
            active={activePlan === 'monthly'}
            loading={loading}
            onSubscribe={() => handleSubscribe('monthly')}
            color="sky"
          />
          <PlanCard
            title="Yearly Plan"
            price="₹2999"
            description="Best value. Save over 15%!"
            active={activePlan === 'yearly'}
            loading={loading}
            onSubscribe={() => handleSubscribe('yearly')}
            color="emerald"
          />
        </div>
      )}
    </div>
  );
}

const PlanCard = ({ title, price, description, active, loading, onSubscribe, color }) => {
  // Define classes for blue and green (sky and emerald)
  const bgFromClass = color === 'sky' ? 'from-sky-100' : 'from-emerald-100';
  const bgToClass = color === 'sky' ? 'to-sky-200' : 'to-emerald-200';
  const textColorClass = color === 'sky' ? 'text-sky-800' : 'text-emerald-800';
  const badgeBgClass = color === 'sky' ? 'bg-sky-300' : 'bg-emerald-300';
  const badgeTextClass = color === 'sky' ? 'text-sky-900' : 'text-emerald-900';
  const buttonBgClass = color === 'sky' ? 'bg-sky-600' : 'bg-emerald-600';
  const buttonHoverClass = color === 'sky' ? 'hover:bg-sky-700' : 'hover:bg-emerald-700';

  return (
    <div
      className={`bg-gradient-to-br ${bgFromClass} ${bgToClass} p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 w-full max-w-xs text-center`}
    >
      <h3 className={`text-xl font-bold ${textColorClass} mb-2`}>{title}</h3>
      <span className={`${badgeBgClass} ${badgeTextClass} px-3 py-1 text-xs font-semibold rounded-full mb-2`}>{price}</span>
      <p className="text-gray-700 mb-4">{description}</p>
      <button
        onClick={onSubscribe}
        disabled={loading && active}
        className={`w-full ${buttonBgClass} ${buttonHoverClass} text-white font-semibold py-2 rounded-lg transition disabled:opacity-50`}
      >
        {loading && active ? (
          <span className="flex justify-center items-center gap-2">
            <FaSpinner className="animate-spin" /> Processing...
          </span>
        ) : (
          `Subscribe ${title.split(' ')[0]}`
        )}
      </button>
    </div>
  );
};
