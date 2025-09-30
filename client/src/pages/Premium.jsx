import React, { useState } from 'react';
import api from '../utils/api';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function Premium() {
  const [loading, setLoading] = useState(false);

  const buyPremium = async () => {
    try {
      setLoading(true);
      const amount = 199; // INR
      const resp = await api.post('/api/payment/create-order', { amount });
      const { order, key_id } = resp.data;
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'AI Interview Simulator',
        description: 'Premium – Detailed reports',
        order_id: order.id,
        handler: async function (response) {
          try {
            await api.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success('Payment successful — you are premium now');
            window.location.reload();
          } catch (err) {
            console.error('verify error', err);
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#0ea5e9' }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-2">Premium Features</h2>
      <p className="mb-4">Get detailed downloadable PDF reports and advanced analytics for better practice.</p>
      <Button className="btn-primary" onClick={buyPremium} disabled={loading}>{loading ? 'Processing...' : 'Buy Premium — ₹199'}</Button>
    </div>
  );
}
