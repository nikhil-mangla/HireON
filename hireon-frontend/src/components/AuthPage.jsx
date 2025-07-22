import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import DownloadPage from './DownloadPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Zap, 
  Shield, 
  Users, 
  TrendingUp, 
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Code,
  Download
} from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI-Powered Feedback",
      description: "Get instant, personalized responses on your interview questions"
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Optimized Code",
      description: "Get AI driven coding approach with optimized time complexity"
    },
    
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Your data is encrypted and completely confidential"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      content: "HireOn helped me land my dream job! The AI feedback was incredibly accurate.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Product Manager at Meta",
      content: "The interview simulations felt so real. I was fully prepared for my actual interviews.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black relative overflow-hidden">
      {/* Dynamic animated background */}
      <div className="absolute inset-0">
        {/* Floating orbs with different colors and sizes */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-emerald-500/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse delay-1500"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/50"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-70"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-violet-400 rounded-full animate-pulse delay-1000 opacity-60"></div>
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse delay-500 opacity-80"></div>
        <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-rose-400 rounded-full animate-pulse delay-1500 opacity-70"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 text-white">
          <div className="max-w-xl">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4 mb-12">
              <div className="relative">
                <div className="w-14 h-14 mt-10 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r mt-10 from-emerald-400 to-teal-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-4xl mt-10 font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                  HireOn
                </h1>
                <p className="text-sm text-cyan-300 font-semibold tracking-wide"> • PERFECT • SUCCEED</p>
              </div>
            </div>

            {/* Main Headline */}
            <div className="mb-16">
              <h2 className="text-6xl font-bold mb-6 leading-tight">
                <span className="text-white">Ace Your Next</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                  Dream Job
                </span>
              </h2>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed font-light">
                Master technical interviews with AI-powered responses, optimized solutions with different language support.
              </p>
              
              <div className="flex items-center gap-6 mb-10">
                <Badge className="bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-300 border-emerald-500/50 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  • Code • MCQ • Interview
                </Badge>
                <Badge className="bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-300 border-amber-500/50 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                  <Star className="h-4 w-4 mr-2" />
                  4.9/5 Rating
                </Badge>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-8 mb-16">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-5 group cursor-pointer transform hover:scale-105 transition-all duration-300">
                  <div className="relative">
                    <div className="p-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-2xl group-hover:from-slate-700/80 group-hover:to-slate-600/80 transition-all duration-300 shadow-xl backdrop-blur-sm border border-slate-600/50">
                      <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-white group-hover:text-cyan-300 transition-colors">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">What Our Users Say</h3>
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-slate-600/50 backdrop-blur-md hover:from-slate-700/60 hover:to-slate-600/60 transition-all duration-300 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-300 mb-4 italic text-lg leading-relaxed">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{testimonial.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{testimonial.name}</p>
                        <p className="text-cyan-300 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">HireOn</h1>
            </div>

            {/* Auth Form Container */}
            <div className="relative mb-140">
              {/* Enhanced glassmorphism background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-slate-50/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-black/20 rounded-3xl"></div>
              
              {/* Form Content */}
              <div className="relative z-10 p-10">
                {/* Tab Switcher */}
                <div className="flex bg-slate-800/50 rounded-2xl p-1.5 mb-8 backdrop-blur-sm border border-slate-700/50">
                  <Button
                    variant={isLogin ? "default" : "ghost"}
                    className={`flex-1 font-semibold py-3 transition-all duration-500 ${isLogin 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/30' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    onClick={() => setIsLogin(true)}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant={!isLogin ? "default" : "ghost"}
                    className={`flex-1 font-semibold py-3 transition-all duration-500 ${!isLogin 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/30' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    onClick={() => setIsLogin(false)}
                  >
                    Sign Up
                  </Button>
                </div>

                {/* Form */}
                <div className="space-y-6">
                  {isLogin ? (
                    <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
                  ) : (
                    <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
                  )}
                  
                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-600/50" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      {/* <span className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-2 text-slate-300 rounded-full border border-slate-600/50"> */}
                        {/* Or continue with */}
                      {/* </span> */}
                    </div>
                  </div>
                  
                  {/* Google Login */}
                  {/* <GoogleLoginButton /> */}
                </div>

                {/* Additional Info */}
                <div className="mt-10 text-center">
                  <div className="flex items-center justify-center gap-3 text-slate-300 mb-6">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    <span className="font-medium">Join Your Success</span>
                  </div>
                  <div className="flex items-center justify-center gap-8 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-400" />
                      <span>Bank-level Security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-400" />
                      <span>4.9★ Rating</span>
                    </div>
                  </div>
                </div>
                {/* Call to Action - moved inside the card */}
                <div className="mt-10 text-center">
                  <p className="text-slate-400 mb-6 font-medium">
                    Ready to transform your interview game?
                  </p>
                  
                  <div className="flex justify-center space-x-4">
                    <Link to="/download">
                      <Button 
                        variant="outline" 
                        className="border-cyan-500/50 text-cyan-600 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-300 font-semibold px-8 py-3 backdrop-blur-sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download App
                      </Button>
                    </Link>
                    <Button 
                        variant="outline" 
                        className="border-cyan-500/50 text-cyan-600 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-300 font-semibold px-8 py-3 backdrop-blur-sm"
                        onClick={() => setIsLogin(false)}
                      >
                        Start Trial
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                  </div>
                  </div>
              </div>
              
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;