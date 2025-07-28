import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Crown, Zap, Star, CreditCard, Shield } from 'lucide-react';
import { paymentAPI, setAuthToken } from '../lib/api';

// Helper to load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      // Add accessibility improvements for Razorpay iframe
      setTimeout(() => {
        const razorpayContainer = document.querySelector('.razorpay-container');
        if (razorpayContainer) {
          // Remove aria-hidden to fix accessibility issue
          razorpayContainer.removeAttribute('aria-hidden');
          // Add proper ARIA attributes
          razorpayContainer.setAttribute('role', 'dialog');
          razorpayContainer.setAttribute('aria-modal', 'true');
          razorpayContainer.setAttribute('aria-label', 'Payment Gateway');
        }
      }, 100);
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentModal = ({ isOpen, onClose, selectedPlan }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, updateUser } = useAuth();

  // Fix Razorpay accessibility issues and focus management
  useEffect(() => {
    if (isOpen) {
      // Monitor for Razorpay container and fix accessibility
      const checkAndFixRazorpayAccessibility = () => {
        const razorpayContainer = document.querySelector('.razorpay-container');
        if (razorpayContainer) {
          // Remove aria-hidden to fix accessibility issue
          razorpayContainer.removeAttribute('aria-hidden');
          // Add proper ARIA attributes
          razorpayContainer.setAttribute('role', 'dialog');
          razorpayContainer.setAttribute('aria-modal', 'true');
          razorpayContainer.setAttribute('aria-label', 'Payment Gateway');
          
          // Focus management for Razorpay popup
          const razorpayIframe = razorpayContainer.querySelector('iframe');
          if (razorpayIframe && !razorpayIframe.hasAttribute('data-focused')) {
            razorpayIframe.setAttribute('data-focused', 'true');
            razorpayIframe.focus();
            console.log('Razorpay iframe focused via container monitoring');
          }
        }
        
        // Also check for any Razorpay iframe directly
        const razorpayIframe = document.querySelector('iframe[src*="razorpay"]');
        if (razorpayIframe && !razorpayIframe.hasAttribute('data-focused')) {
          razorpayIframe.setAttribute('data-focused', 'true');
          razorpayIframe.focus();
          console.log('Razorpay iframe focused via direct query');
        }
      };

      // Keyboard event listener for better focus management
      const handleKeyDown = (event) => {
        // If user presses Tab and Razorpay popup is open, ensure it gets focus
        if (event.key === 'Tab' || event.key === 'Enter') {
          const razorpayIframe = document.querySelector('iframe[src*="razorpay"]');
          if (razorpayIframe) {
            setTimeout(() => {
              razorpayIframe.focus();
            }, 50);
          }
        }
      };

      // Check immediately and then periodically
      checkAndFixRazorpayAccessibility();
      const interval = setInterval(checkAndFixRazorpayAccessibility, 300);

      // Add keyboard event listener
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        clearInterval(interval);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const plans = {
    trial: {
      name: 'Trial Week',
      price: 99,
      duration: '2 days',
      features: [
        
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

  const handlePayment = async () => {
    setLoading(true);
    setError('');

          try {
        // ====== RAZORPAY PAYMENT LOGIC COMMENTED FOR TESTING =====
        
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
              // This sends a POST request to /api/razorpay/verify-payment on the backend.
              const verifyResponse = await paymentAPI.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: selectedPlan
              });

              if (verifyResponse.success) {
                console.log('Payment verification successful:', verifyResponse);
                console.log('Current user before update:', user);
                
                // 1. Save the new token with updated subscription
                setAuthToken(verifyResponse.token);
                
                // 2. Update user state with new subscription data
                const updatedUser = {
                  ...user,
                  plan: verifyResponse.plan,
                  verified: true,
                  expires: verifyResponse.expires
                };
                console.log('Updated user data:', updatedUser);
                updateUser(updatedUser);
                
                // Force a re-render by updating the user state immediately
                setTimeout(() => {
                  console.log('Checking user state after update...');
                  // This will trigger a re-render
                }, 100);
                
                // 3. Show success message and close modal
                alert('Payment successful! Your subscription has been activated.');
                
                // Wait a moment for state to update before closing
                setTimeout(() => {
                  console.log('Closing modal, final user state:', user);
                  onClose();
                }, 1000);
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
        
        // Enhanced event handling for Razorpay popup
        razorpay.on('payment.failed', function (response) {
          console.log('Payment failed:', response.error);
          setError('Payment failed. Please try again.');
          setLoading(false);
        });

        razorpay.on('payment.canceled', function (response) {
          console.log('Payment canceled:', response);
          setLoading(false);
        });

        // Enhanced focus management when modal opens
        razorpay.on('modal.opened', function () {
          console.log('Razorpay modal opened - attempting to activate iframe');
          
          const activateRazorpayIframe = () => {
            try {
              const razorpayIframe = document.querySelector('iframe[src*="razorpay"]');
              if (razorpayIframe) {
                // Method 1: Focus the iframe
                razorpayIframe.focus();
                
                // Method 2: Click on the iframe to activate it
                razorpayIframe.click();
                
                // Method 3: Dispatch focus event
                razorpayIframe.dispatchEvent(new Event('focus', { bubbles: true }));
                
                // Method 4: Try to access iframe content (if same-origin)
                try {
                  if (razorpayIframe.contentWindow && razorpayIframe.contentWindow.document) {
                    const iframeDoc = razorpayIframe.contentWindow.document;
                    const firstInput = iframeDoc.querySelector('input');
                    if (firstInput) {
                      firstInput.focus();
                      console.log('✅ Focused first input inside Razorpay iframe');
                    }
                  }
                } catch (iframeError) {
                  // Cross-origin restriction - this is expected
                  console.log('Cross-origin iframe - using external focus methods:', iframeError.message);
                }
                
                console.log('✅ Razorpay iframe activated via multiple methods');
                return true;
              }
              return false;
            } catch (error) {
              console.log('❌ Iframe activation error:', error);
              return false;
            }
          };
          
          // Try activation multiple times with different delays
          setTimeout(activateRazorpayIframe, 100);
          setTimeout(activateRazorpayIframe, 300);
          setTimeout(activateRazorpayIframe, 600);
          setTimeout(activateRazorpayIframe, 1000);
        });

        // Handle modal close
        razorpay.on('modal.closed', function () {
          console.log('Razorpay modal closed');
          setLoading(false);
        });

        // Open the payment modal
        razorpay.open();
        
        // Close the payment modal when Razorpay popup opens
        onClose();
        
        // Show a brief notification to guide user focus and interaction
        const showFocusNotification = () => {
          const notification = document.createElement('div');
          notification.innerHTML = `
            <div style="
              position: fixed;
              top: 20px;
              right: 20px;
              background: #10b981;
              color: white;
              padding: 16px 20px;
              border-radius: 8px;
              font-size: 14px;
              z-index: 10000;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              animation: slideIn 0.3s ease-out;
              max-width: 350px;
            ">
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>💳</span>
                  <span style="font-weight: 600;">Payment window opened</span>
                </div>
                <div style="font-size: 13px; opacity: 0.9;">
                  Click inside the payment window to start filling your details
                </div>
              </div>
            </div>
            <style>
              @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
            </style>
          `;
          document.body.appendChild(notification);
          
          // Remove notification after 5 seconds
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 5000);
        };
        
        // Show notification after a short delay
        setTimeout(showFocusNotification, 500);
        
        // Enhanced iframe activation: Wait for Razorpay iframe to load and activate it
        const activateRazorpayIframe = () => {
          try {
            // Method 1: Find Razorpay iframe by src
            const razorpayIframe = document.querySelector('iframe[src*="razorpay"]');
            if (razorpayIframe) {
              // Multiple activation methods
              razorpayIframe.focus();
              razorpayIframe.click();
              
              // Simulate user interaction to activate the iframe
              const rect = razorpayIframe.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              
              // Create and dispatch click events at the center of the iframe
              const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: centerX,
                clientY: centerY
              });
              razorpayIframe.dispatchEvent(clickEvent);
              
              // Also dispatch mousedown and mouseup events
              const mouseDownEvent = new MouseEvent('mousedown', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: centerX,
                clientY: centerY
              });
              const mouseUpEvent = new MouseEvent('mouseup', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: centerX,
                clientY: centerY
              });
              razorpayIframe.dispatchEvent(mouseDownEvent);
              razorpayIframe.dispatchEvent(mouseUpEvent);
              
              console.log('✅ Razorpay iframe activated with multiple interaction methods');
              return true;
            }
            
            // Method 2: Find Razorpay container and its iframe
            const razorpayContainer = document.querySelector('.razorpay-container');
            if (razorpayContainer) {
              const containerIframe = razorpayContainer.querySelector('iframe');
              if (containerIframe) {
                containerIframe.focus();
                containerIframe.click();
                console.log('✅ Razorpay iframe activated via container');
                return true;
              }
            }
            
            // Method 3: Find iframe by high z-index (Razorpay typically has high z-index)
            const iframes = document.querySelectorAll('iframe');
            for (const iframe of iframes) {
              const zIndex = parseInt(window.getComputedStyle(iframe).zIndex);
              if (zIndex > 1000) {
                iframe.focus();
                iframe.click();
                console.log('✅ High z-index iframe activated (likely Razorpay)');
                return true;
              }
            }
            
            // Method 4: Activate any visible iframe that appeared recently
            const visibleIframes = Array.from(iframes).filter(iframe => {
              const rect = iframe.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0 && 
                     window.getComputedStyle(iframe).display !== 'none';
            });
            
            if (visibleIframes.length > 0) {
              const iframe = visibleIframes[0];
              iframe.focus();
              iframe.click();
              console.log('✅ Visible iframe activated as fallback');
              return true;
            }
            
            console.log('⚠️ No Razorpay iframe found to activate');
            return false;
          } catch (error) {
            console.log('❌ Iframe activation error:', error);
            return false;
          }
        };

        // Try to activate immediately and then retry with delays
        setTimeout(activateRazorpayIframe, 100);  // Quick attempt
        setTimeout(activateRazorpayIframe, 500);  // Main attempt
        setTimeout(activateRazorpayIframe, 1000); // Fallback attempt
        setTimeout(activateRazorpayIframe, 2000); // Final attempt
        
        // ====== END RAZORPAY PAYMENT LOGIC =====
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

