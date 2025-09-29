const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

let rzp = null;
if (key_id && key_secret) {
  rzp = new Razorpay({ key_id, key_secret });
}

exports.createOrder = async (req, res) => {
  try {
    if (!rzp) return res.status(500).json({ message: 'Razorpay not configured' });

    const { amount } = req.body; // amount in rupees expected from client, e.g. 199
    if (!amount) return res.status(400).json({ message: 'amount required (in INR)' });

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await rzp.orders.create(options);
    // we will return order and key id for checkout
    res.json({ order, key_id: key_id });
  } catch (err) {
    console.error('createOrder error', err);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment data' });
    }

    // verify signature
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // mark user as premium
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isPremium = true;
    await user.save();

    res.json({ message: 'Payment verified, user upgraded to premium' });
  } catch (err) {
    console.error('verifyPayment error', err);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};
