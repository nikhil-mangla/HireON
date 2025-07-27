import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Zap, 
  Shield, 
  Star,
  CheckCircle,
  Code,
  Download,
  Play,
  Monitor,
  Smartphone,
  Globe,
  Clock,
  Cpu,
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Heart,
  Flag,
  DollarSign
} from 'lucide-react';
import { useState } from 'react';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsOfServiceModal from './TermsOfServiceModal';

const IntroPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 100 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

  const platforms = [
    {
      id: "001",
      name: "Zoom",
      status: "Undetectable",
      icon: <Monitor className="h-5 w-5" />
    },
    {
      id: "002",
      name: "Hackerrank",
      status: "Undetectable", 
      icon: <Code className="h-5 w-5" />
    },
    {
      id: "003",
      name: "Leetcode",
      status: "Undetectable",
      icon: <Code className="h-5 w-5" />
    },
    {
      id: "004",
      name: "Microsoft Teams",
      status: "Undetectable",
      icon: <Globe className="h-5 w-5" />
    },
    {
      id: "005",
      name: "Google Meet",
      status: "Undetectable",
      icon: <Smartphone className="h-5 w-5" />
    },
    {
      id: "006",
      name: "Amazon Chime",
      status: "Undetectable",
      icon: <Monitor className="h-5 w-5" />
    },
    {
      id: "007",
      name: "Unstop",
      status: "Undetectable",
      icon: <Globe className="h-5 w-5" />
    }
  ];

  const approachSteps = [
    {
      step: "01",
      title: "Problem Analysis",
      description: "AI analyzes the problem statement and identifies key constraints, edge cases, and optimal approach patterns."
    },
    {
      step: "02", 
      title: "Algorithm Design",
      description: "Generate multiple solution approaches with detailed explanations of trade-offs between different strategies."
    },
    {
      step: "03",
      title: "Code Implementation",
      description: "Write clean, optimized code in your preferred language with proper variable naming and structure."
    },
    {
      step: "04",
      title: "Complexity Analysis",
      description: "Provide detailed time and space complexity analysis with Big O notation and optimization insights."
    }
  ];

  const socialLinks = [
    { icon: <Github className="h-5 w-5" />, href: "#", label: "GitHub" },
    { icon: <Twitter className="h-5 w-5" />, href: "#", label: "Twitter" },
    { icon: <Linkedin className="h-5 w-5" />, href: "#", label: "LinkedIn" },
    { icon: <Mail className="h-5 w-5" />, href: "mailto:support@hireon.ex", label: "Email" }
  ];

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

      {/* Navigation */}
      <nav className="relative z-20 flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <Target className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
            HireOn
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setShowFAQ(!showFAQ)}
            variant="outline" 
            className="border-violet-500/50 text-violet-400 hover:bg-violet-500/20"
          >
            <Code className="h-4 w-4 mr-2" />
            FAQ
          </Button>
          <Link to="/download">
            <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <div className="relative z-10">
        {/* Main Content Grid */}
        <div className="min-h-screen">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Left Column - Hero Section */}
              <div className="flex flex-col justify-center">
                <div className="max-w-xl">
                  {/* Main Headline */}
                  <div className="mb-12">
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
                  <div className="grid grid-cols-1 gap-8">
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
                </div>
              </div>

              {/* Right Column - Performance Section */}
              <div className="flex items-center justify-center">
                <div className="w-full space-y-8">
                  {/* Performance Section */}
                  <div className="relative">
                    {/* Enhanced glassmorphism background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-slate-50/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-black/20 rounded-3xl"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 p-10">
                      <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold text-white mb-4">Performance with Top Interview Platforms</h2>
                        <p className="text-xl text-slate-300">
                          Seamlessly integrate with all major interview platforms
                        </p>
                      </div>

                      {/* Platforms Grid */}
                      <div className="grid grid-cols-1 gap-4">
                        {platforms.map((platform) => (
                          <div key={platform.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-2xl border border-slate-600/50 backdrop-blur-sm hover:from-slate-700/60 hover:to-slate-600/60 transition-all duration-300">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-xl flex items-center justify-center border border-cyan-500/50">
                                <div className="text-cyan-400">
                                  {platform.icon}
                                </div>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
                                <p className="text-sm text-slate-400">Platform {platform.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                              <span className="text-emerald-400 font-medium text-sm">{platform.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Get Started & Pricing CTA Section */}
          <div className="max-w-4xl mx-auto px-6 py-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-slate-50/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-black/20 rounded-3xl"></div>
              
              <div className="relative z-10 p-12 text-center">
                <h2 className="text-4xl font-bold text-white mb-6">Ready to Ace Your Interviews?</h2>
                <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                  Join thousands of developers who are already using HireOn to land their dream jobs. 
                  Start your journey today with our powerful AI-powered interview assistant.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link to="/auth">
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-6 px-12 text-lg shadow-xl transform hover:scale-105 transition-all duration-300">
                      <Zap className="h-5 w-5 mr-3" />
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="outline" className="border-violet-500/50 text-violet-400 hover:bg-violet-500/20 font-semibold py-6 px-12 text-lg backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                      
                      View Pricing
                    </Button>
                  </Link>
                </div>
                
                
              </div>
            </div>
          </div>

          {/* Visual Demonstrations Section */}
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-slate-50/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-black/20 rounded-3xl"></div>
              
              <div className="relative z-10 p-10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Visual Demonstrations</h2>
                  <p className="text-lg text-slate-300">
                    See HireOn in action across different scenarios
                  </p>
                </div>

                {/* Image Grid - 3 rows of 2 images each */}
                <div className="space-y-6">
                  {/* Row 1: Images 1 & 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full aspect-video bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-2xl border border-slate-600/50 backdrop-blur-sm flex items-center justify-center hover:from-slate-700/60 hover:to-slate-600/60 transition-all duration-300 cursor-pointer">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/50">
                          <Code className="h-8 w-8 text-cyan-400" />
                        </div>
                        <p className="text-slate-400 text-lg">Demo Image 1</p>
                      </div>
                    </div>
                    <div className="w-full aspect-video bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-2xl border border-slate-600/50 backdrop-blur-sm flex items-center justify-center hover:from-slate-700/60 hover:to-slate-600/60 transition-all duration-300 cursor-pointer">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/50">
                          <Code className="h-8 w-8 text-emerald-400" />
                        </div>
                        <p className="text-slate-400 text-lg">Demo Image 2</p>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Images 3 & 4 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full aspect-video bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-2xl border border-slate-600/50 backdrop-blur-sm flex items-center justify-center hover:from-slate-700/60 hover:to-slate-600/60 transition-all duration-300 cursor-pointer">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-violet-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-violet-500/50">
                          <Code className="h-8 w-8 text-violet-400" />
                        </div>
                        <p className="text-slate-400 text-lg">Demo Image 3</p>
                      </div>
                    </div>
                    <div className="w-full aspect-video bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-2xl border border-slate-600/50 backdrop-blur-sm flex items-center justify-center hover:from-slate-700/60 hover:to-slate-600/60 transition-all duration-300 cursor-pointer">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-rose-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/50">
                          <Code className="h-8 w-8 text-rose-400" />
                        </div>
                        <p className="text-slate-400 text-lg">Demo Image 4</p>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Images 5 & 6 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full aspect-video bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-2xl border border-slate-600/50 backdrop-blur-sm flex items-center justify-center hover:from-slate-700/60 hover:to-slate-600/60 transition-all duration-300 cursor-pointer">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/50">
                          <Code className="h-8 w-8 text-amber-400" />
                        </div>
                        <p className="text-slate-400 text-lg">Demo Image 5</p>
                      </div>
                    </div>
                    <div className="w-full aspect-video bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-2xl border border-slate-600/50 backdrop-blur-sm flex items-center justify-center hover:from-slate-700/60 hover:to-slate-600/60 transition-all duration-300 cursor-pointer">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500/30 to-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/50">
                          <Code className="h-8 w-8 text-indigo-400" />
                        </div>
                        <p className="text-slate-400 text-lg">Demo Image 6</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Approach Steps Section */}
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-slate-50/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-black/20 rounded-3xl"></div>
              
              <div className="relative z-10 p-10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Our Approach</h2>
                  <p className="text-lg text-slate-300">
                    Systematic problem-solving methodology
                  </p>
                </div>

                <div className="space-y-6">
                  {approachSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-2xl border border-slate-600/50 backdrop-blur-sm hover:from-slate-700/60 hover:to-slate-600/60 transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-xl flex items-center justify-center border border-cyan-500/50 flex-shrink-0">
                        <span className="text-cyan-400 font-bold text-sm">{step.step}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                        <p className="text-slate-400 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Optimized Code Section */}
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-slate-50/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-black/20 rounded-3xl"></div>
              
              <div className="relative z-10 p-10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Optimized Code Solutions</h2>
                  <p className="text-lg text-slate-300">
                    Multi-language support with complexity analysis
                  </p>
                </div>

                {/* Language Selection */}
                <div className="flex justify-center gap-2 mb-6">
                  {['python', 'c++', 'java'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        selectedLanguage === lang
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                          : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <p className="text-slate-400 text-sm">Optimized solutions for various algorithms</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Draggable FAQ Window */}
        {showFAQ && (
          <div 
            className="fixed inset-0 z-50 pointer-events-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div 
              className="absolute w-96 max-h-[80vh] bg-gradient-to-br from-slate-900/95 to-black/95 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl pointer-events-auto overflow-hidden"
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
            >
              {/* Draggable Header */}
              <div 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-b border-slate-600/50 cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Code className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">FAQ & Help</h3>
                </div>
                <button 
                  onClick={() => setShowFAQ(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
              </div>

              {/* FAQ Content */}
              <div className="p-4 max-h-[calc(80vh-80px)] overflow-y-auto">
                <div className="space-y-4">
                  {/* Basic Checks Section */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">Basic Checks</h4>
                    <p className="text-sm text-slate-300 mb-4">Verify if Application works on your system before subscribing</p>
                    
                    <div className="space-y-3">
                      {[
                        { step: 1, title: "Download the free Application", desc: "Download the free application from our website" },
                        { step: 2, title: "Launch the Application", desc: "When you run the app for the first time, Windows may show a SmartScreen warning since it's a new file. Just click \"More info\" and then \"Run anyway\" to proceed." },
                        { step: 3, title: "Share your full screen on Google Meet", desc: "Start a Google Meet call, join the same call with another device as well and share your full screen, check on another device it's working or not" },
                        { step: 4, title: "Check visibility", desc: "If it's not visible, you are good to subscribe. 99% of cases it's not visible" }
                      ].map((item) => (
                        <div key={item.step} className="flex items-start gap-3 p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg border border-slate-600/30">
                          <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{item.step}</span>
                          </div>
                          <div>
                            <h5 className="text-sm font-semibold text-white mb-1">{item.title}</h5>
                            <p className="text-xs text-slate-400">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FAQ Items */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Frequently Asked Questions</h4>
                    <div className="space-y-3">
                      {[
                        { q: "Which type of Interview I can give?", a: "Yes, you can give any type of interview using this application. It supports all types of interviews including coding interviews, technical interviews, HR interviews, and more." },
                        { q: "Can I get the approach of the solution?", a: "Yes, our AI provides detailed solution approaches including problem analysis, algorithm design, step-by-step implementation, and complexity analysis." },
                        { q: "Can I use this for actual job interviews?", a: "Yes, this application is designed to be used for actual job interviews. It is undetectable and works seamlessly with popular interview platforms like Zoom, Google Meet, Microsoft Teams, and more." },
                        { q: "Will the application be visible while switching tabs?", a: "No, the application is designed to be undetectable and will not be visible while switching tabs, sharing your screen, or in the task manager, or on task bar." },
                        { q: "It's not working on my system, what should I do?", a: "Restart your system and try again. If it still doesn't work, please contact our support team for assistance." }
                      ].map((faq, index) => (
                        <div key={index} className="p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg border border-slate-600/30">
                          <h5 className="text-sm font-semibold text-white mb-2">{faq.q}</h5>
                          <p className="text-xs text-slate-400">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Keyboard Shortcuts Section */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-slate-50/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-black/20 rounded-3xl"></div>
            
            <div className="relative z-10 p-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Keyboard Shortcuts</h2>
                <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                  Master HireOn with these powerful keyboard shortcuts for lightning-fast workflow
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Screenshot & Processing */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <Code className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">📸 Screenshot & Processing</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg border border-slate-600/30">
                      <span className="text-slate-300">Take a screenshot</span>
                      <kbd className="px-3 py-1 bg-slate-700 text-cyan-400 rounded-md text-sm font-mono">Cmd/Ctrl + G</kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg border border-slate-600/30">
                      <span className="text-slate-300">Process screenshots for coding </span>
                      <kbd className="px-3 py-1 bg-slate-700 text-cyan-400 rounded-md text-sm font-mono">Cmd/Ctrl + Enter</kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg border border-slate-600/30">
                      <span className="text-slate-300">Process screenshots for MCQ</span>
                      <kbd className="px-3 py-1 bg-slate-700 text-cyan-400 rounded-md text-sm font-mono">Option/Alt + Enter</kbd>
                    </div>
                  </div>
                </div>

                {/* Reset & Control */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">⚡ Reset & Control</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg border border-slate-600/30">
                      <span className="text-slate-300">Cancel requests and reset queues</span>
                      <kbd className="px-3 py-1 bg-slate-700 text-emerald-400 rounded-md text-sm font-mono">Cmd/Ctrl + R</kbd>
                    </div>
                  </div>
                </div>

                {/* Window Management */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Monitor className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">🪟 Window Management</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg border border-slate-600/30">
                      <span className="text-slate-300">Toggle main window (show/hide)</span>
                      <kbd className="px-3 py-1 bg-slate-700 text-violet-400 rounded-md text-sm font-mono">Cmd/Ctrl + B</kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg border border-slate-600/30">
                      <span className="text-slate-300">Move window left</span>
                      <kbd className="px-3 py-1 bg-slate-700 text-violet-400 rounded-md text-sm font-mono">Cmd/Ctrl + ←</kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg border border-slate-600/30">
                      <span className="text-slate-300">Move window right</span>
                      <kbd className="px-3 py-1 bg-slate-700 text-violet-400 rounded-md text-sm font-mono">Cmd/Ctrl + →</kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg border border-slate-600/30">
                      <span className="text-slate-300">Move window up</span>
                      <kbd className="px-3 py-1 bg-slate-700 text-violet-400 rounded-md text-sm font-mono">Cmd/Ctrl + ↑</kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg border border-slate-600/30">
                      <span className="text-slate-300">Move window down</span>
                      <kbd className="px-3 py-1 bg-slate-700 text-violet-400 rounded-md text-sm font-mono">Cmd/Ctrl + ↓</kbd>
                    </div>
                  </div>
                </div>

                {/* Audio Transcription */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">🎤 Audio Transcription</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg border border-slate-600/30">
                      <span className="text-slate-300">Start audio transcription/listening</span>
                      <kbd className="px-3 py-1 bg-slate-700 text-rose-400 rounded-md text-sm font-mono">Cmd/Ctrl + K</kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg border border-slate-600/30">
                      <span className="text-slate-300">Stop audio transcription</span>
                      <kbd className="px-3 py-1 bg-slate-700 text-rose-400 rounded-md text-sm font-mono">Cmd/Ctrl + D</kbd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Summary */}
              <div className="mt-12 p-8 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-2xl border border-slate-600/50">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">📋 Usage Summary</h3>
            
                                  <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-500/30">
                    <p className="text-amber-300 text-sm text-center">
                      💡 All these shortcuts work globally (even when the app is in the background) and are automatically unregistered when the app quits.
                    </p>
                  </div>
                  
                  {/* Auto-Dock Quit Feature */}
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border-2 border-green-500/40 shadow-lg">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-green-400">🚀 Auto-Dock Quit Feature</h4>
                    </div>
                    <div className="text-center">
                      <p className="text-green-300 text-lg font-semibold mb-2">
                        Instantly Disappears from Dock After Launch
                      </p>
                      <p className="text-green-200 text-sm">
                        HireOn automatically quits from the dock immediately after launching, ensuring complete stealth mode. 
                        The app continues running in the background without any visible indicators, making it completely undetectable 
                        during interviews and screen sharing sessions.
                      </p>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ CTA Section */}
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-slate-50/5 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-black/20 rounded-3xl"></div>
            
            <div className="relative z-10 p-12">
              <h2 className="text-4xl font-bold text-white mb-6">Need Help?</h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Get answers to common questions and learn how to verify if HireOn works on your system
              </p>
              
              <Button 
                onClick={() => setShowFAQ(!showFAQ)}
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold py-6 px-12 text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Code className="h-6 w-6 mr-3" />
                FAQ & Help Center
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-20 mt-20 border-t border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur-xl"></div>

          <div className="relative z-10 px-8 py-16">
            <div className="max-w-6xl mx-auto">
              {/* Main Footer Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
                {/* Company Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                    
                      <Target className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                      HireOn
                    </h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    HireOn is your ultimate placement tool providing an invisible, undetectable solution across 
                    all major interview platforms with AI-powered assistance.
                  </p>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">100% Undetectable & Secure</span>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-6">
                  <h4 className="text-xl font-semibold text-white">Quick Links</h4>
                  <div className="space-y-3">
                    <Link to="/auth" className="block text-slate-300 hover:text-cyan-400 transition-colors">
                      Get Started
                    </Link>
                    <Link to="/download" className="block text-slate-300 hover:text-cyan-400 transition-colors">
                      Download App
                    </Link>
                    <Link to="/pricing" className="block text-slate-300 hover:text-cyan-400 transition-colors">
                      Pricing Plans
                    </Link>
                    <button 
                      onClick={() => setShowRefundPolicy(!showRefundPolicy)}
                      className="block text-slate-300 hover:text-cyan-400 transition-colors text-left"
                    >
                      Refund Policy
                    </button>
                  </div>
                </div>

                {/* Contact & Social */}
                <div className="space-y-6">
                  <h4 className="text-xl font-semibold text-white">Connect With Us</h4>
                  <div className="flex gap-4">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        className="w-12 h-12 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl flex items-center justify-center border border-slate-600/50 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm"
                        title={social.label}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">support@hireon.ex</span>
                    </div>
                    
                  </div>
                </div>
              </div>

              {/* Refund Policy Section */}
              {showRefundPolicy && (
                <div className="mb-12 p-8 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-3xl border border-slate-600/50 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">Refund Policy</h3>
                    <button 
                      onClick={() => setShowRefundPolicy(false)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <ChevronUp className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="space-y-4 text-slate-300 leading-relaxed">
                    <p>
                      We are committed to providing a high-quality, undetectable interview browser experience. 
                      Our product is designed to be invisible on the taskbar, running tab, and even when sharing 
                      your entire screen or using task manager. You have access to all major AI models and platforms, 
                      and our tool is compatible with top interview platforms like Zoom, Leetcode, and Hackerrank.
                    </p>
                    <div className="space-y-3">
                      <p className="font-semibold text-white">Refund Conditions:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Refunds are only considered in cases of genuine technical failure where the Invisible Browser does not function as described and our support team is unable to resolve the issue.</li>
                        <li>Refund requests must be made within 3 days of purchase, with a clear description of the problem and supporting evidence (such as screenshots or error messages).</li>
                        <li>No refunds will be issued for reasons such as change of mind, unsupported platforms, or failure to use the product as intended.</li>
                        <li>We encourage you to try our free plan before purchasing a subscription to ensure compatibility and satisfaction.</li>
                      </ul>
                    </div>
                    <p>
                      For refund requests, please contact our support team at{' '}
                      <a href="mailto:support@hireon.ex" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                        support@hireon.ex
                      </a>
                    </p>
                    <p className="text-sm text-slate-400">
                      By purchasing, you agree to our terms and acknowledge that the Invisible Browser is intended for legitimate interview preparation and assistance only.
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Footer */}
              <div className="flex flex-col lg:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-700/50">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-slate-400">
                  <span className="text-sm">© 2025 HireOn. All rights reserved.</span>
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    <span className="text-sm">Made in India with</span>
                    <Heart className="h-4 w-4 text-rose-400 fill-rose-400 animate-pulse" />
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
                  <button 
                    onClick={() => setShowPrivacyPolicy(true)}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Privacy Policy
                  </button>
                  <button 
                    onClick={() => setShowTermsOfService(true)}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Terms of Service
                  </button>
                  {/* <a href="/cookies" className="hover:text-cyan-400 transition-colors">Cookie Policy</a> */}
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={showPrivacyPolicy} 
        onClose={() => setShowPrivacyPolicy(false)} 
      />

      {/* Terms of Service Modal */}
      <TermsOfServiceModal 
        isOpen={showTermsOfService} 
        onClose={() => setShowTermsOfService(false)} 
      />
    </div>
  );
};

export default IntroPage;