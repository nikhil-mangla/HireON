import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PaymentModal from './PaymentModal';
import { Check, Star, Zap, Crown, Sparkles } from 'lucide-react';

const PricingSection = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('trial');

  const plans = [
    {
      id: 'trial',
      name: 'Trial Week',
      price: 99,
      originalPrice: null,
      duration: '2 days',
      description: 'Perfect for trying out our platform',
      badge: 'Most Popular',
      badgeColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
      icon: <Star className="h-6 w-6" />,
      color: 'from-green-500 to-emerald-600',
      features: [
      
        'Basic AI feedback',
        'Email support',
        'Try premium features'
      ],
      limitations: [
        'Limited sessions',
        'Basic feedback only'
      ]
    },
    {
      id: 'monthly',
      name: 'Premium Monthly',
      price: 999,
      originalPrice: null,
      duration: '30 days',
      description: 'Full access to all premium features',
      badge: null,
      icon: <Zap className="h-6 w-6" />,
      color: 'from-blue-500 to-purple-600',
      features: [
        'Unlimited interview sessions',
        'Advanced AI feedback',
        'Priority support',
        'Advanced analytics',
        'Custom question sets'
      ],
      limitations: []
    },
    {
      id: 'annual',
      name: 'Premium Annual',
      price: 9999,
      originalPrice: 11988,
      duration: '365 days',
      description: 'Best value with exclusive benefits',
      badge: 'Best Value',
      badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
      icon: <Crown className="h-6 w-6" />,
      color: 'from-purple-500 to-pink-600',
      features: [
        'Everything in Monthly',
        '2 months free (17% savings)',
        'Exclusive interview templates',
       
        
        'Early access to new features',
        'Dedicated account manager'
      ],
      limitations: []
    }
  ];

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  return (
    <div className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-blue-500" />
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              Choose Your Plan
            </Badge>
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Start Your Interview Success Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan to accelerate your interview preparation and land your dream job
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                plan.badge ? 'border-orange-200 shadow-lg' : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-0 left-0 right-0">
                  <div className={`${plan.badgeColor} text-white text-center py-2 text-sm font-medium`}>
                    {plan.badge}
                  </div>
                </div>
              )}

              <CardHeader className={`text-center ${plan.badge ? 'pt-12' : 'pt-6'}`}>
                {/* Icon */}
                <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center text-white mb-4`}>
                  {plan.icon}
                </div>

                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>

                {/* Pricing */}
                <div className="py-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold">₹{plan.price}</span>
                    {plan.originalPrice && (
                      <span className="text-xl text-gray-400 line-through">
                        ₹{plan.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">for {plan.duration}</p>
                  {plan.originalPrice && (
                    <Badge className="mt-2 bg-green-100 text-green-800">
                      Save ₹{plan.originalPrice - plan.price}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limitations (for trial) */}
                {plan.limitations.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500 mb-2">Limitations:</p>
                    <div className="space-y-1">
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-xs text-gray-500">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <Button 
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white border-0 py-3`}
                >
                  {plan.id === 'trial' ? 'Start Trial' : 
                   plan.id === 'monthly' ? 'Get Premium' : 
                   'Get Best Value'}
                </Button>

                {/* Additional info */}
                {/* <p className="text-xs text-center text-gray-500">
                  {plan.id === 'trial' ? 'No commitment • Cancel anytime' :
                   plan.id === 'monthly' ? 'Cancel anytime • Full refund in 7 days' :
                   'Best value • Cancel anytime'}
                </p> */}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            All plans include secure payment processing and customer support
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Secure payments</span>
            </div>
            
            {/* <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>24/7 support</span>
            </div> */}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedPlan={selectedPlan}
      />
    </div>
  );
};

export default PricingSection;

