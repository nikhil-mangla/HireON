import { useState, useEffect } from 'react';
import { X, Mail, CheckCircle, AlertCircle, Loader2, ArrowLeft, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authAPI } from '../lib/api';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(0);
  const [resetUrl, setResetUrl] = useState('');

  // Timer effect for cooldown
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const startTimer = () => {
    setCanResend(false);
    setTimer(30); // 30 second cooldown
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Sending forgot password request for:', email);
      const response = await authAPI.forgotPassword({ email });
      console.log('Forgot password response:', response);
      
      if (response.success) {
        setSuccess(true);
        startTimer(); // Start cooldown timer
        
        // Store reset URL if provided (for development/testing)
        if (response.resetUrl) {
          setResetUrl(response.resetUrl);
        }
      } else {
        setError(response.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message) {
        setError(`Network error: ${error.message}`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.forgotPassword({ email });
      
      if (response.success) {
        setError('');
        startTimer(); // Reset cooldown timer
      } else {
        setError(response.error || 'Failed to resend reset email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to resend reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setLoading(false);
    setSuccess(false);
    setError('');
    setCanResend(false);
    setTimer(0);
    setResetUrl('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      ></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-slate-600/50 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Reset Password</h2>
              <p className="text-sm text-slate-300">Enter your email to receive reset instructions</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-slate-700/60 rounded-lg flex items-center justify-center border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-600/60 transition-all duration-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-white text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-800/60 border border-slate-600/50 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                    required
                  />
                </div>
                <p className="text-xs text-slate-400">
                  We'll send you a link to reset your password
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-slate-600/50 text-slate-300 hover:bg-slate-700/60"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Check Your Email</h3>
                <p className="text-slate-300 text-sm">
                  We've sent password reset instructions to <span className="text-cyan-400 font-medium">{email}</span>
                </p>
              </div>

              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-slate-300">
                    <p className="font-medium text-cyan-300 mb-1">What to do next:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Check your email inbox (and spam folder)</li>
                      <li>• Click the reset link in the email</li>
                      <li>• Create a new password</li>
                      <li>• Sign in with your new password</li>
                    </ul>
                    {resetUrl && (
                      <div className="mt-3 pt-3 border-t border-cyan-500/20">
                        <p className="text-xs text-cyan-300 mb-2">
                          <strong>Development Mode:</strong> Email service not configured. Use this link to test:
                        </p>
                        <a 
                          href={resetUrl}
                          className="text-xs text-cyan-400 hover:text-cyan-300 break-all"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {resetUrl}
                        </a>
                      </div>
                    )}
                    {!canResend && timer > 0 && (
                      <div className="mt-3 pt-3 border-t border-cyan-500/20">
                        <p className="text-xs text-cyan-300">
                          <Clock className="h-3 w-3 inline mr-1" />
                          You can resend in {timer} seconds
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white"
                >
                  Back to Login
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={!canResend || loading}
                  className="flex-1 border-slate-600/50 text-slate-300 hover:bg-slate-700/60 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : !canResend ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      {timer}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resend Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal; 