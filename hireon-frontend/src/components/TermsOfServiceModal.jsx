import { X, FileText, Shield, AlertTriangle, Copyright, Mail, Scale } from 'lucide-react';

const TermsOfServiceModal = ({ isOpen, onClose }) => {
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
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/40">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Terms & Conditions</h2>
                <p className="text-slate-300 text-sm">Please read these terms carefully before using our service</p>
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
              <h3 className="text-2xl font-bold text-white mb-4">HireOn Terms of Service</h3>
              <p className="text-slate-300 leading-relaxed">
                By using HireOn, you agree to abide by all applicable laws and regulations. The Invisible Browser is intended solely for legitimate interview preparation and assistance.
              </p>
            </div>

            {/* Key Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Legitimate Use Only</h4>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  You must not use the application for any unlawful or unethical activities, including but not limited to cheating in assessments or violating the terms of third-party platforms.
                </p>
              </div>

              <div className="p-5 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">No Warranty</h4>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  The software is provided "as is" without warranty of any kind. We strive for compatibility and performance, but cannot guarantee uninterrupted or error-free operation on all systems.
                </p>
              </div>

              <div className="p-5 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Scale className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">User Responsibility</h4>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Users are responsible for ensuring that their use of the application complies with the policies of any interview or assessment platform.
                </p>
              </div>

              <div className="p-5 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Copyright className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Intellectual Property</h4>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  All content, branding, and intellectual property associated with HireOn remain the property of their respective owners.
                </p>
              </div>
            </div>

            {/* Important Notices */}
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/30">
                <h4 className="text-lg font-semibold text-amber-300 mb-3">Service Modifications</h4>
                <p className="text-slate-300 text-sm">
                  We reserve the right to modify or discontinue the service at any time without notice.
                </p>
              </div>

              <div className="p-5 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-xl border border-rose-500/30">
                <h4 className="text-lg font-semibold text-rose-300 mb-3">Account Suspension</h4>
                <p className="text-slate-300 text-sm">
                  Misuse of the application may result in suspension or termination of your access without refund.
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="p-6 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Questions About Terms?</h4>
                </div>
                <p className="text-slate-300 mb-3">
                  For questions regarding these terms, please contact us at:
                </p>
                <a 
                  href="mailto:support@hireon.ex" 
                  className="text-lg font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  support@hireon.ex
                </a>
              </div>
            </div>

            {/* Agreement Notice */}
            <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/30">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="h-3 w-3 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-emerald-300 mb-1">Agreement</h4>
                  <p className="text-slate-300 text-sm">
                    By using HireOn, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServiceModal; 