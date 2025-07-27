import { X, Shield, Mail, Lock, Eye, Database } from 'lucide-react';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl border border-slate-600/50 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 border-b border-slate-600/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
                <p className="text-slate-300 text-sm">Your privacy and data security are our top priorities</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl flex items-center justify-center border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700/60 transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-8">
            {/* Introduction */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">HireOn Privacy Commitment</h3>
              <p className="text-slate-300 leading-relaxed">
                HireOn values your privacy. We collect only the minimum information necessary to provide and improve our services, such as your email address and subscription details. We do not sell or share your personal data with third parties except as required by law or to process payments securely.
              </p>
            </div>

            {/* Key Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Database className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Data Storage & Usage</h4>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  All user data is stored securely and used solely for account management, support, and service improvement.
                </p>
              </div>

              <div className="p-5 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Payment Security</h4>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  We use third-party payment processors (such as Razorpay) to handle transactions; your payment information is never stored on our servers.
                </p>
              </div>

              <div className="p-5 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Eye className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Usage Analytics</h4>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  We may use anonymized usage data to enhance product features and user experience.
                </p>
              </div>

              <div className="p-5 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Data Control</h4>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  You may contact us at any time to request deletion of your account and associated data.
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="p-6 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Contact Us</h4>
                </div>
                <p className="text-slate-300 mb-3">
                  For privacy-related inquiries, please email us at:
                </p>
                <a 
                  href="mailto:support@hireon.ex" 
                  className="text-lg font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  support@hireon.ex
                </a>
              </div>
            </div>

            {/* User Rights */}
            <div className="p-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/30">
              <h4 className="text-lg font-semibold text-amber-300 mb-3">Your Rights</h4>
              <div className="space-y-2 text-slate-300 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Right to access your personal data</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Right to correct inaccurate data</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Right to delete your account and data</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Right to opt-out of marketing communications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal; 