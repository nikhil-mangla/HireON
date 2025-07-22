import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { paymentAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Crown, Zap, Star, CreditCard, Shield } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, selectedPlan }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, updateUser } = useAuth();

  const plans = {
    trial: {
      name: 'Trial Week',
      price: 99,
      duration: '7 days',
      features: [
        '5 interview sessions',
        'Basic AI feedback',
        'Resume upload',
        'Email support',
        'Try premium features'
      ],
      icon: <Star className="h-6 w-6" />,
      color: 'from-green-500 to-emerald-600',
      badge: 'Most Popular'
    },
    monthly: {
      name: 'Premium Monthly',
      price: 999,
      duration: '30 days',
      features: [
        'Unlimited interview sessions',
        'AI-powered feedback',
        'Resume analysis',
        'Priority support',
        'Advanced analytics'
      ],
      icon: <Zap className="h-6 w-6" />,
      color: 'from-blue-500 to-purple-600'
    },
    annual: {
      name: 'Premium Annual',
      price: 9999,
      duration: '365 days',
      originalPrice: 11988,
      features: [
        'Everything in Monthly',
        '2 months free',
        'Exclusive interview templates',
        'Career guidance sessions',
        'Premium badge'
      ],
      icon: <Crown className="h-6 w-6" />,
      color: 'from-purple-500 to-pink-600',
      badge: 'Best Value'
    }
  };

  const currentPlan = plans[selectedPlan] || plans.monthly;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // ====== RAZORPAY PAYMENT LOGIC COMMENTED FOR TESTING =====
      /*
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Create order
      const orderResponse = await paymentAPI.createOrder({
        amount: currentPlan.price,
        currency: 'INR',
        plan: selectedPlan
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      // Configure Razorpay options
      const options = {
        key: orderResponse.key_id,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: 'HireOn',
        description: `${currentPlan.name} Subscription`,
        order_id: orderResponse.order.id,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#6366f1'
        },
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: selectedPlan
            });

            if (verifyResponse.success) {
              // Update user with new subscription
              const updatedUser = {
                ...user,
                plan: verifyResponse.plan,
                verified: true,
                expires: verifyResponse.expires
              };
              updateUser(updatedUser);
              
              // Show success message and close modal
              alert('Payment successful! Your subscription has been activated.');
              onClose();
            } else {
              throw new Error(verifyResponse.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setError('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      */
      // ====== END RAZORPAY PAYMENT LOGIC =====

      // ====== MOCK SUCCESS FOR TESTING =====
      // Simulate a successful payment verification response
      const verifyResponse = {
        success: true,
        plan: selectedPlan,
        expires: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 // 30 days from now
      };

      if (verifyResponse.success) {
        // Update user with new subscription
        const updatedUser = {
          ...user,
          plan: verifyResponse.plan,
          verified: true,
          expires: verifyResponse.expires
        };
        updateUser(updatedUser);
        // Show success message and close modal
        alert('Payment successful! Your subscription has been activated.');
        onClose();
      } else {
        throw new Error(verifyResponse.error || 'Payment verification failed');
      }
      // ====== END MOCK SUCCESS =====
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${currentPlan.color} text-white`}>
              {currentPlan.icon}
            </div>
            Upgrade to {currentPlan.name}
          </DialogTitle>
          <DialogDescription>
            Unlock premium features and accelerate your interview preparation
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardContent className="p-0 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Pricing */}
            <div className="text-center space-y-2">
              {currentPlan.badge && (
                <Badge className="mb-2 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  {currentPlan.badge}
                </Badge>
              )}
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-bold">₹{currentPlan.price}</span>
                {currentPlan.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{currentPlan.originalPrice}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Valid for {currentPlan.duration}
              </p>
              {selectedPlan === 'annual' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Save ₹{currentPlan.originalPrice - currentPlan.price}
                </Badge>
              )}
              {selectedPlan === 'trial' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Perfect for trying out!
                </Badge>
              )}
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                What's included:
              </h4>
              <ul className="space-y-2">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4" />
              Secured by Razorpay
            </div>

            {/* Payment button */}
            <Button 
              onClick={handlePayment} 
              disabled={loading}
              className={`w-full bg-gradient-to-r ${currentPlan.color} hover:opacity-90 text-white border-0`}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {loading ? 'Processing...' : `Pay ₹${currentPlan.price}`}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;

