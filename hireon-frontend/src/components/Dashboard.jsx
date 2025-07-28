import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import PaymentModal from './PaymentModal';
import SuccessPage from './SuccessPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  LogOut, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users,
  Award,
  Zap,
  Smartphone,
  Star,
  PlayCircle,
  BookOpen,
  Crown,
  Upload,
  X,
  Building,
  Briefcase,
  FileText,
  Edit3,
  User,
  Calendar,
  StopCircle
} from 'lucide-react';

import { authAPI } from '../lib/api'; // Import authAPI for subscription checking
import { useRef } from 'react';


const Dashboard = () => {
  const { user, logout, loading, updateUser, setAuthToken } = useAuth(); // Added updateUser and setAuthToken
  const hasRefreshedRef = useRef(false);
  
  // Debug: Log user state changes
  useEffect(() => {
    console.log('Dashboard received user state:', user);
  }, [user]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionData, setSessionData] = useState({
    jobRole: '',
    jobCompany: '',
    resume: null
  });
  const [savedSessionData, setSavedSessionData] = useState(null); // New state to store saved session data

  // Force refresh user data on component mount to get latest expiry time
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        console.log('Refreshing user data on component mount...');
        const response = await authAPI.checkSubscription();
        if (response.success) {
          const { subscription, isVerified, expires, token } = response;
          
          const updatedUserData = {
            ...user,
            plan: subscription,
            verified: isVerified,
            expires: expires
          };
          
          console.log('Updated user data on mount:', {
            expires: expires ? new Date(expires * 1000).toISOString() : 'null',
            plan: subscription,
            verified: isVerified
          });
          
          updateUser(updatedUserData);
          
          if (token) {
            setAuthToken(token);
          }
        }
      } catch (error) {
        console.error('Failed to refresh user data on mount:', error);
      }
    };
    
    if (user && !hasRefreshedRef.current) {
      hasRefreshedRef.current = true;
      refreshUserData();
    }
  }, [user, setAuthToken, updateUser]); // Include all dependencies

  // Real-time subscription status checking
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const response = await authAPI.checkSubscription();
        if (response.success) {
          const { subscription, isVerified, expires, isExpired, token } = response;
          
          // Always update user state with latest data from backend
          const updatedUserData = {
            ...user,
            plan: subscription,
            verified: isVerified,
            expires: expires
          };
          
          // Check if any data has changed significantly (ignore small time differences)
          const hasSignificantChange = (
            subscription !== user?.plan || 
            isVerified !== user?.verified || 
            (user?.expires && Math.abs(expires - user.expires) > 60) // Only update if expiry differs by more than 60 seconds
          );
          
          if (hasSignificantChange && user) {
            console.log('Updating user state with new data:', {
              oldExpires: user?.expires ? new Date(user.expires * 1000).toISOString() : 'null',
              newExpires: expires ? new Date(expires * 1000).toISOString() : 'null',
              oldPlan: user?.plan,
              newPlan: subscription,
              oldVerified: user?.verified,
              newVerified: isVerified,
              timeDifference: user?.expires ? Math.abs(expires - user.expires) : 'N/A'
            });
            
            updateUser(updatedUserData);
            
            // Show notification if subscription expired
            if (isExpired && subscription === 'free') {
              console.log('Subscription expired - user downgraded to free');
              // You can add a toast notification here if you have a toast library
            }
          }
          
          // Update auth token if new one provided
          if (token) {
            setAuthToken(token);
          }
        }
      } catch (error) {
        console.error('Subscription status check failed:', error);
        // If token is invalid, redirect to login
        if (error.response?.status === 401) {
          logout();
        }
      }
    };
    
    // Check subscription status after a delay and then every 5 minutes
    const initialDelay = setTimeout(checkSubscriptionStatus, 10000); // 10 second delay
    const interval = setInterval(checkSubscriptionStatus, 5 * 60 * 1000); // 5 minutes
    
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [user?.plan, user?.verified, logout, setAuthToken, updateUser, user]); // Include all dependencies

  // Calculate subscription expiry
  useEffect(() => {
    if (user?.expires) {
      const updateTimeRemaining = () => {
        const now = Math.floor(Date.now() / 1000); // Current time in seconds
        const expiry = user.expires; // Already in seconds from backend
        const difference = expiry - now;

        console.log('Time calculation debug:', {
          now: new Date(now * 1000).toISOString(),
          expiry: new Date(expiry * 1000).toISOString(),
          difference: difference,
          differenceHours: Math.floor(difference / 3600),
          differenceDays: Math.floor(difference / (24 * 3600))
        });

        if (difference > 0) {
          const days = Math.floor(difference / (24 * 60 * 60));
          const hours = Math.floor((difference % (24 * 60 * 60)) / (60 * 60));
          const minutes = Math.floor((difference % (60 * 60)) / 60);
          
          if (days > 0) {
            setTimeRemaining(`${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`);
          } else if (hours > 0) {
            setTimeRemaining(`${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`);
          } else {
            setTimeRemaining(`${minutes} minute${minutes > 1 ? 's' : ''}`);
          }
        } else {
          setTimeRemaining('Expired');
        }
      };

      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

      return () => clearInterval(interval);
    } else {
      setTimeRemaining('');
    }
  }, [user?.expires]);

  const isSubscriptionExpired = () => {
    if (!user?.expires) return false;
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const expiry = user.expires; // Already in seconds from backend
    return now > expiry;
  };

  const getSubscriptionStatus = () => {
    if (!user?.verified) return 'free';
    if (isSubscriptionExpired()) return 'expired';
    return user.plan || 'free';
  };

  const subscriptionStatus = getSubscriptionStatus();

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleStartSession = () => {
    console.log('handleStartSession called');
    // Reset session data when opening modal
    setSessionData({
      jobRole: '',
      jobCompany: '',
      resume: null
    });
    setShowSessionModal(true);
    console.log('Modal should be open now');
  };

  const handleEditSession = () => {
    // Pre-populate modal with saved data
    setSessionData({
      jobRole: savedSessionData.jobRole,
      jobCompany: savedSessionData.jobCompany,
      resume: savedSessionData.resume
    });
    setShowSessionModal(true);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.type;
      const isValidType = fileType === 'application/pdf' || 
                         fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      if (isValidType) {
        setSessionData(prev => ({ ...prev, resume: file }));
      } else {
        alert('Please upload only PDF or DOCX files');
      }
    }
  };

  const handleSaveSession = () => {
    if (!sessionData.jobRole || !sessionData.jobCompany || !sessionData.resume) {
      alert('Please fill in all fields');
      return;
    }
    
    console.log('Session data saved:', sessionData);
    // Save the session data with timestamp
    const savedData = {
      ...sessionData,
      savedAt: new Date().toISOString()
    };
    setSavedSessionData(savedData);
    console.log('Saved session data:', savedData);
    setShowSessionModal(false);
    // Here you would typically save the session data to your backend
  };

  const handleStopSession = () => {
    setSavedSessionData(null);
  };

  const handleStartInterviewNow = () => {
    console.log('Starting interview session...');
    // Add your interview logic here
    alert('Interview session started!');
  };



  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Show success page if requested
  if (showSuccessPage) {
    return <SuccessPage onBack={() => setShowSuccessPage(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-slate-600/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                HireOn
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-purple-400/30">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                  {user.provider === 'google' && (
                    <p className="text-xs text-purple-400">Google Account</p>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={logout}
                className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subscription Status Banner */}
        {subscriptionStatus === 'free' && (
          <Card className="mb-8 border-2 border-dashed border-cyan-400/30 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg shadow-blue-500/40">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white">Unlock Premium Features</h3>
                    <p className="text-slate-300">
                      Get unlimited access to AI feedback, advanced analytics, and more
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleUpgrade('trial')}
                    variant="outline"
                    className="border-cyan-400/30 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60"
                  >
                    Try ₹99 Trial
                  </Button>
                  <Button 
                    onClick={() => handleUpgrade('monthly')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 shadow-lg"
                  >
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {subscriptionStatus === 'expired' && (
          <Card className="mb-8 border-2 border-red-400/30 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white">Subscription Expired</h3>
                    <p className="text-slate-300">
                      Your premium subscription has expired. Renew to continue accessing premium features.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleUpgrade('trial')}
                    variant="outline"
                    className="border-red-400/30 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60"
                  >
                    Try ₹99 Trial
                  </Button>
                  <Button 
                    onClick={() => handleUpgrade('monthly')}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 shadow-lg"
                  >
                    Renew Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {subscriptionStatus !== 'free' && subscriptionStatus !== 'expired' && (
          <Card className="mb-8 border-2 border-green-400/30 bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-white">
                      Premium Active
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                        {user?.plan?.toUpperCase()}
                      </Badge>
                    </h3>
                    <p className="text-slate-300">
                      {timeRemaining && timeRemaining !== 'Expired' ? (
                        <>Time remaining: {timeRemaining}</>
                      ) : (
                        'Subscription expired'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => handleUpgrade('annual')}
                    className="border-green-400/30 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60"
                  >
                    Extend
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-xl border-slate-600/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="h-5 w-5 text-cyan-400" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Ace your interview journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Button 
                    onClick={() => {
                      console.log('Start Interview clicked');
                      handleStartSession();
                    }}
                    className="h-24 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                    disabled={subscriptionStatus === 'free' || subscriptionStatus === 'expired'} // Temporarily disabled for testing
                  >
                    <div className="text-center">
                      <PlayCircle className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-base font-semibold">Start Session</div>
                      <div className="text-xs opacity-80">Crack your interview</div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-24 border-2 border-dashed border-cyan-400/30 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:border-cyan-400/50 transform hover:scale-105 transition-all duration-200"
                    onClick={handleStopSession}
                  >
                    <div className="text-center">
                      <StopCircle className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-base font-semibold">Stop Session</div>
                      <div className="text-xs opacity-80">All Set!</div>
                    </div>
                  </Button>
                </div>



                {/* Session Details Display */}
                {savedSessionData && (
                  <div className="mt-6">
                    <Card className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 backdrop-blur-sm border-2 border-blue-400/40 shadow-xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              <User className="h-5 w-5 text-blue-400" />
                            </div>
                            <span className="text-lg font-bold">Current Session Setup</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={handleEditSession}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-blue-400/30"
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-blue-400" />
                              <span className="text-sm font-medium text-gray-300">Job Role</span>
                            </div>
                            <div className="text-white font-semibold bg-white/10 px-4 py-3 rounded-lg border border-blue-400/20">
                              {savedSessionData.jobRole}
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-blue-400" />
                              <span className="text-sm font-medium text-gray-300">Company</span>
                            </div>
                            <div className="text-white font-semibold bg-white/10 px-4 py-3 rounded-lg border border-blue-400/20">
                              {savedSessionData.jobCompany}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-400" />
                            <span className="text-sm font-medium text-gray-300">Resume File</span>
                          </div>
                          <div className="flex items-center justify-between bg-white/10 px-4 py-3 rounded-lg border border-blue-400/20">
                            <span className="text-white font-semibold">
                              {savedSessionData.resume?.name || 'Resume file'}
                            </span>
                            <Badge className="bg-green-500/20 text-green-300 border-green-400/30 px-3 py-1">
                              ✓ Uploaded
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-400 pt-4 border-t border-white/10">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Session saved on {new Date(savedSessionData.savedAt).toLocaleDateString()} at {new Date(savedSessionData.savedAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="pt-4">
                          <Button 
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white py-3 shadow-lg text-lg font-semibold"
                            onClick={handleStartInterviewNow}
                          >
                            <PlayCircle className="h-5 w-5 mr-2" />
                            Start Interview Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Cards */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 text-white border-slate-600/50 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-cyan-400" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Current Plan</span>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {subscriptionStatus === 'free' ? 'Free' : 
                       subscriptionStatus === 'expired' ? 'Expired' : 
                       user?.plan?.toUpperCase() || 'FREE'}
                    </Badge>
                  </div>
                  
                  {subscriptionStatus !== 'free' && timeRemaining && (
                    <div className="flex items-center justify-between">
                      <span>Time Remaining</span>
                      <span className="text-sm">{timeRemaining}</span>
                    </div>
                  )}

                  {(subscriptionStatus === 'free' || subscriptionStatus === 'expired') && (
                    <div className="space-y-3 pt-2">
                      <Button 
                        onClick={() => handleUpgrade('trial')}
                        className="w-full bg-slate-700/60 hover:bg-slate-600/60 text-white border-slate-600/50"
                        size="sm"
                      >
                        Try ₹99 Trial
                      </Button>
                      <Button 
                        onClick={() => handleUpgrade('monthly')}
                        className="w-full bg-slate-700/60 hover:bg-slate-600/60 text-white border-slate-600/50"
                        size="sm"
                      >
                        Upgrade to Premium
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Desktop App Card */}
            <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 text-white border-slate-600/50 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-cyan-400" />
                  Desktop App
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-200 text-sm">
                    Access HireOn from your desktop for a better experience
                  </p>
                  
                  {subscriptionStatus !== 'free' && subscriptionStatus !== 'expired' ? (
                    <Button 
                      onClick={() => setShowSuccessPage(true)}
                      className="w-full bg-slate-700/60 hover:bg-slate-600/60 text-white border-slate-600/50"
                      size="sm"
                    >
                      Open Desktop App
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-slate-300 text-xs">
                        Premium subscription required
                      </p>
                      <Button 
                        onClick={() => handleUpgrade('trial')}
                        className="w-full bg-slate-700/60 hover:bg-slate-600/60 text-white border-slate-600/50"
                        size="sm"
                      >
                        Get Premium Access
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-xl border-slate-600/50 text-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-cyan-400" />
                  Start Interview Session
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowSessionModal(false)}
                    className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-cyan-400" />
                  Job Role
                </label>
                <input
                  type="text"
                  value={sessionData.jobRole}
                  onChange={(e) => setSessionData(prev => ({ ...prev, jobRole: e.target.value }))}
                  className="w-full p-3 bg-slate-800/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="e.g., Software Engineer, Data Scientist"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building className="h-4 w-4 text-cyan-400" />
                  Company
                </label>
                <input
                  type="text"
                  value={sessionData.jobCompany}
                  onChange={(e) => setSessionData(prev => ({ ...prev, jobCompany: e.target.value }))}
                  className="w-full p-3 bg-slate-800/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="e.g., Google, Microsoft, Amazon"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  Resume Upload
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="w-full p-3 bg-slate-800/60 border border-slate-600/50 rounded-lg text-white cursor-pointer hover:bg-slate-700/60 transition-colors flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {sessionData.resume ? sessionData.resume.name : 'Upload PDF or DOCX'}
                  </label>
                </div>
                <p className="text-xs text-slate-400">
                  Only PDF and DOCX files are allowed
                </p>
              </div>

              <Button 
                onClick={handleSaveSession}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white py-3 shadow-lg"
              >
                Save & Start Session
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedPlan={selectedPlan}
      />
      
      {/* Debug Button */}
      {/* Debug Button removed as per instructions */}
    </div>
  );
};

export default Dashboard;