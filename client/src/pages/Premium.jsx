import React, { useState } from 'react';
import api from '../utils/api';

export default function Premium() {
  const [loading, setLoading] = useState(false);

  const buyPremium = async () => {
    try {
      setLoading(true);
      const amount = 199; // INR price for premium
      const resp = await api.post('/api/payment/create-order', { amount });
      const { order, key_id } = resp.data;

      // Razorpay options
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'AI Interview Simulator',
        description: 'Premium – Detailed reports',
        order_id: order.id,
        handler: async function (response) {
          // verify payment
          try {
            const verify = await api.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            alert('Payment successful! You are now premium.');
            // reload user state / UI
            window.location.reload();
          } catch (err) {
            console.error('verify error', err);
            alert('Payment verification failed');
          }
        },
        prefill: {
        
        },
        theme: { color: '#2563eb' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('create order error', err);
      alert('Failed to create payment order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Premium Features</h2>
      <p className="mb-4">Get detailed downloadable PDF reports and advanced analytics.</p>
      <button onClick={buyPremium} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">
        {loading ? 'Processing...' : 'Buy Premium — ₹199'}
      </button>
    </div>
  );
}
