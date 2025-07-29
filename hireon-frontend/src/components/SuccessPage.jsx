import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Download, 
  Copy, 
  ExternalLink, 
  Smartphone,
  AlertCircle,
  Clock,
  Shield,
  Monitor,
  Apple
} from 'lucide-react';
import { api } from '../lib/api.js';

const SuccessPage = ({ onBack }) => {
  const { user } = useAuth();
  const [deepLink, setDeepLink] = useState('');
  const [fallbackDeepLink, setFallbackDeepLink] = useState('');
  const [developmentDeepLink, setDevelopmentDeepLink] = useState('');
  const [webFallbackUrl, setWebFallbackUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [downloadStarted, setDownloadStarted] = useState({ windows: false, mac: false });

  useEffect(() => {
    generateDeepLink();
  }, []);

  const generateDeepLink = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/api/generate-deep-link');
      if (response.data.success) {
        setDeepLink(response.data.deepLink);
        setFallbackDeepLink(response.data.fallbackDeepLink);
        setDevelopmentDeepLink(response.data.developmentDeepLink);
        setWebFallbackUrl(response.data.webFallbackUrl);
      } else {
        setError('Failed to generate deep link');
      }
    } catch (error) {
      console.error('Deep link generation error:', error);
      setError('Failed to generate deep link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(deepLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers or when clipboard permission is denied
        const textArea = document.createElement('textarea');
        textArea.value = deepLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Fallback copy failed:', err);
          // Show the link in an alert as last resort
          alert(`Copy this link manually:\n\n${deepLink}`);
        }
        
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      // Show the link in an alert as last resort
      alert(`Copy this link manually:\n\n${deepLink}`);
    }
  };

  const showManualRegistrationInstructions = () => {
    const devLink = developmentDeepLink || deepLink;
    const instructions = `
To open the HireOn app manually on macOS:

METHOD 1 - Terminal Command (Production):
1. Open Terminal
2. Run this command:
   open -a "HireOn" "${deepLink}"

METHOD 2 - Terminal Command (Development):
1. Open Terminal
2. Run this command:
   open -a "HireOn" "${devLink}"

METHOD 3 - Manual URL Scheme Registration:
1. Open Terminal
2. Run this command:
   defaults write com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers -array-add '{LSHandlerContentType=text/plain;LSHandlerRoleAll=com.hireon.app;}'

METHOD 4 - Copy and Paste:
1. Copy this deep link: ${deepLink}
2. Paste it in your browser's address bar
3. Press Enter

METHOD 5 - Development Version:
If you have a development version, try this link: ${devLink}

METHOD 6 - Web Version:
Use the web version instead of the desktop app

METHOD 7 - Download Official Installer:
Download the official installer from the download page to ensure proper URL scheme registration

Note: If the app was installed manually (not through the official installer), the URL scheme may not be registered with macOS.
    `;
    
    alert(instructions);
  };

  const showTerminalCommand = () => {
    const command = `open -a "HireOn" "${deepLink}"`;
    const fullInstructions = `
To open the HireOn app using Terminal:

1. Open Terminal (Applications > Utilities > Terminal)
2. Copy and paste this command:
   ${command}
3. Press Enter

If that doesn't work, try:
   open -a "HireOn.app" "${deepLink}"

Or if the app is in a different location:
   open -a "/Applications/HireOn.app" "${deepLink}"
    `;
    
    alert(fullInstructions);
  };

  const openDeepLink = () => {
    try {
      // Try the primary deep link first
      console.log('Attempting to open deep link:', deepLink);
    window.location.href = deepLink;
      
      // Set a timeout to try fallback schemes
      setTimeout(() => {
        // Try the fallback deep link if it exists
        if (fallbackDeepLink) {
          console.log('Trying fallback deep link:', fallbackDeepLink);
          window.location.href = fallbackDeepLink;
        }
        
        // Set another timeout to show the web fallback
        setTimeout(() => {
          // If deep links failed, show the web fallback option
          const shouldShowWebFallback = confirm(
            'The HireOn desktop app didn\'t open automatically.\n\n' +
            'This is likely because the app was installed manually and the URL scheme isn\'t registered.\n\n' +
            'Would you like to:\n' +
            '1. Copy the deep link to paste manually\n' +
            '2. Open the web version instead\n' +
            '3. Get help with manual registration\n' +
            '4. Download the official installer'
          );
          
          if (shouldShowWebFallback) {
            // Show options to the user
            const choice = prompt(
              'Choose an option:\n' +
              '1. Copy deep link\n' +
              '2. Open web version\n' +
              '3. Get registration help\n' +
              '4. Download installer\n\n' +
              'Enter 1, 2, 3, or 4:'
            );
            
            switch (choice) {
              case '1':
                copyToClipboard();
                break;
              case '2':
                if (webFallbackUrl) {
                  window.open(webFallbackUrl, '_blank');
                } else {
                  alert('Web fallback URL not available. Please copy the deep link manually.');
                  copyToClipboard();
                }
                break;
              case '3':
                showManualRegistrationInstructions();
                break;
              case '4':
                window.open('/download', '_blank');
                break;
              default:
                copyToClipboard();
            }
          }
        }, 2000);
      }, 2000);
    } catch (error) {
      console.error('Failed to open deep link:', error);
      alert('Failed to open the app. Please copy the link and paste it in your browser.');
    }
  };

  const downloadTokenFile = async () => {
    try {
      const response = await api.post('/api/generate-token-file');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hireon-auth-token.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Token file download error:', error);
      setError('Failed to download token file');
    }
  };

  const handleDesktopDownload = async (platform) => {
    try {
      // Use the same API base URL logic as the main API configuration
      const API_BASE_URL = localStorage.getItem('API_OVERRIDE') || 
                           import.meta.env.VITE_API_BASE_URL || 
                           'https://hireon-aiel.onrender.com';
      
      const downloadUrl = `${API_BASE_URL}/api/download/${platform}`;
      
      console.log(`Starting download for ${platform} from:`, downloadUrl);

      // Create a temporary anchor element for download
    const link = document.createElement('a');
      link.href = downloadUrl;
    link.download = platform === 'windows' ? 'HireOn-Setup.exe' : 'HireOn.dmg';
      link.target = '_blank'; // Open in new tab as fallback
      
      // Append to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Update UI state
    setDownloadStarted(prev => ({ ...prev, [platform]: true }));

    // Reset state after 3 seconds
    setTimeout(() => {
      setDownloadStarted(prev => ({ ...prev, [platform]: false }));
    }, 3000);

      // Track download event
      console.log(`Download requested for ${platform}`);
      
    } catch (error) {
      console.error('Download failed:', error);
      
      // Show user-friendly error message instead of redirecting to GitHub
      alert(`Sorry, the download is not available yet.\n\nPlease try:\n• Using the web version\n• Contacting us for early access\n• Checking back soon for the official release!`);
    }
  };

  const getSubscriptionBadge = () => {
    const plan = user?.subscription || user?.plan || 'free';
    const colors = {
      trial: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-black shadow-2xl shadow-amber-500/50',
      monthly: 'bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 text-black shadow-2xl shadow-cyan-500/50',
      annual: 'bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 text-black shadow-2xl shadow-purple-500/50',
      free: 'bg-gradient-to-r from-gray-300 via-slate-300 to-zinc-300 text-black shadow-2xl shadow-gray-500/50'
    };
    
    return (
      <Badge className={`${colors[plan] || colors.free} font-bold px-6 py-2 text-lg border-0 animate-pulse`}>
        ✨ {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
      </Badge>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-violet-400 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-40 left-32 w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-1000"></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-3xl space-y-10">
          {/* MASSIVE Success Header */}
          <div className="text-center relative">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/50 animate-pulse">
                <CheckCircle className="h-20 w-20 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/50 to-green-400/50 rounded-full blur-2xl animate-pulse"></div>
            </div>
            
            <h1 className="text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent mb-6 animate-pulse">
              PAYMENT SUCCESS!
            </h1>
            <p className="text-2xl text-gray-300 font-bold mb-4">🎉 Your subscription is now ACTIVE! 🎉</p>
            <p className="text-lg text-cyan-300 font-semibold">Launch your desktop app and unlock premium features</p>
          </div>

          {/* Premium Account Card */}
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 border-cyan-500/50 backdrop-blur-2xl shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-500 hover:scale-105 transform">
            <CardHeader className="pb-6">
              <CardTitle className="text-white flex items-center justify-between text-2xl font-bold">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  💎 Premium Account
                </span>
                {getSubscriptionBadge()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50">
                  <span className="text-white font-black text-2xl">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-xl">{user?.name}</p>
                  <p className="text-cyan-300 text-lg font-semibold">{user?.email}</p>
                </div>
              </div>
              
              {user?.expires && (
                <div className="flex items-center gap-3 text-lg bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl p-4 border border-violet-500/30 shadow-lg">
                  <Clock className="h-6 w-6 text-violet-400" />
                  <span className="text-violet-300 font-semibold">
                    ⏰ Expires: {new Date(user.expires * 1000).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Desktop App Connection */}
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 border-violet-500/50 backdrop-blur-2xl shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-500 hover:scale-105 transform">
            <CardHeader className="pb-6">
              <CardTitle className="text-white flex items-center gap-4 text-2xl font-bold">
                <div className="w-12 h-12 bg-gradient-to-r from-violet-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  🚀 Launch Desktop App
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {loading ? (
                <div className="text-center py-12">
                  <div className="relative mx-auto w-20 h-20 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-violet-500/30"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-400 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin delay-75"></div>
                  </div>
                  <p className="text-violet-300 text-2xl font-bold animate-pulse">⚡ Generating secure link...</p>
                </div>
              ) : error ? (
                <div className="flex items-center gap-4 text-red-400 bg-gradient-to-r from-red-500/20 to-pink-500/20 p-6 rounded-2xl border border-red-500/30 shadow-lg">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                  <span className="flex-1 text-lg font-semibold">🚨 {error}</span>
                  <Button 
                    variant="ghost" 
                    onClick={generateDeepLink}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 font-bold text-lg px-6 py-3"
                  >
                    🔄 Retry
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 p-4 rounded-2xl border border-emerald-500/30 shadow-lg">
                      <Shield className="h-6 w-6 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">🔒 Secure authentication link generated</span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-gray-900/50 to-black/50 p-6 rounded-2xl border border-gray-600/30 shadow-2xl">
                      <p className="text-gray-400 mb-3 font-bold text-sm">🔗 DEEP LINK URL:</p>
                      <p className="text-cyan-300 font-mono text-sm break-all bg-black/50 p-4 rounded-xl border border-cyan-500/30 shadow-inner">
                        {deepLink}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button 
                      onClick={openDeepLink}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300 transform hover:scale-105"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      🚀 Open App
                    </Button>
                    
                    <Button 
                      onClick={copyToClipboard}
                      className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-2xl shadow-violet-500/50 hover:shadow-violet-500/70 transition-all duration-300 transform hover:scale-105"
                    >
                      <Copy className="h-5 w-5 mr-2" />
                      {copied ? '✅ Copied!' : '📋 Copy Link'}
                    </Button>
                    
                    <Button 
                      onClick={downloadTokenFile}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-2xl shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300 transform hover:scale-105"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      💾 Download Token
                    </Button>
                  </div>

                  {/* Development Version Help */}
                  <div className="mt-6 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-500/30">
                    <h3 className="text-yellow-400 font-bold text-lg mb-3 flex items-center gap-2">
                      🛠️ Development Version Detected
                    </h3>
                    <p className="text-yellow-300 text-sm mb-4">
                      If you're using a development version of HireOn, try these options:
                    </p>
                    
                    <div className="space-y-3">
                      <Button 
                        onClick={() => {
                          if (developmentDeepLink) {
                            window.open(developmentDeepLink, '_blank');
                          } else {
                            alert('Development deep link not available. Please try the production link.');
                          }
                        }}
                        variant="outline"
                        className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 font-medium"
                      >
                        🔗 Try Development Deep Link
                      </Button>
                      
                      <Button 
                        onClick={() => {
                          const devLink = developmentDeepLink || deepLink;
                          navigator.clipboard.writeText(devLink);
                          alert('Development deep link copied to clipboard!');
                        }}
                        variant="outline"
                        className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/20 font-medium"
                      >
                        📋 Copy Development Link
                      </Button>
                    </div>
                  </div>

                  {/* Manual Registration Help */}
                  <div className="mt-6 text-center space-y-3">
                    <Button 
                      onClick={showTerminalCommand}
                      variant="outline"
                      className="border-green-500/50 text-green-400 hover:bg-green-500/20 font-medium"
                    >
                      💻 Open via Terminal
                    </Button>
                    
                    <Button 
                      onClick={showManualRegistrationInstructions}
                      variant="outline"
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 font-medium"
                    >
                      🔧 App Not Opening? Get Help
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Desktop App Download */}
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 border-emerald-500/50 backdrop-blur-2xl shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-500 hover:scale-105 transform">
            <CardHeader className="pb-6">
              <CardTitle className="text-white flex items-center gap-4 text-2xl font-bold">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  💻 Download Desktop App
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-emerald-300 text-lg font-semibold text-center">
                Get the full HireOn experience with our powerful desktop application
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Windows Download */}
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-6 rounded-2xl border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                      <Monitor className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl">Windows</h3>
                      <p className="text-blue-300 text-sm">Version 2.1.0 • 45.2 MB</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleDesktopDownload('windows')}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-6 rounded-xl shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300 transform hover:scale-105"
                    disabled={downloadStarted.windows}
                  >
                    {downloadStarted.windows ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Download Started!
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5 mr-2" />
                        Download for Windows
                      </>
                    )}
                  </Button>
                  
                  <p className="text-blue-300 text-xs mt-3 text-center">
                    Windows 10+ • Automatic installer
                  </p>
                </div>

                {/* macOS Download */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 rounded-2xl border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
                      <Apple className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl">macOS</h3>
                      <p className="text-purple-300 text-sm">Version 2.1.0 • 186 MB</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleDesktopDownload('mac')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 transform hover:scale-105"
                    disabled={downloadStarted.mac}
                  >
                    {downloadStarted.mac ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Download Started!
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5 mr-2" />
                        Download for macOS
                      </>
                    )}
                  </Button>
                  
                  <p className="text-purple-300 text-xs mt-3 text-center">
                    macOS 10.15+ • Universal binary
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 p-4 rounded-xl border border-emerald-500/30">
                
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 border-pink-500/50 backdrop-blur-2xl shadow-2xl shadow-pink-500/20 hover:shadow-pink-500/40 transition-all duration-500 hover:scale-105 transform">
            <CardHeader className="pb-6">
              <CardTitle className="text-white text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                📖 How to Use Your Premium Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300 transform hover:scale-105">
                  <p className="font-black text-white text-xl mb-3">🎯 Option 1: Direct Launch</p>
                  <p className="text-cyan-300 font-semibold">Click "Open App" to instantly launch HireOn desktop with your premium features activated.</p>
                </div>
                
                <div className="p-6 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl border border-violet-500/30 hover:border-violet-500/50 transition-all duration-300 transform hover:scale-105">
                  <p className="font-black text-white text-xl mb-3">📋 Option 2: Manual Copy</p>
                  <p className="text-violet-300 font-semibold">Copy the secure link and paste it anywhere to access your premium account.</p>
                </div>
                
                <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300 transform hover:scale-105">
                  <p className="font-black text-white text-xl mb-3">💻 Option 3: Download Desktop App</p>
                  <p className="text-emerald-300 font-semibold">Download and install the desktop application for the best experience with offline capabilities.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="text-center pt-8">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 transition-all duration-300 px-8 py-4 font-bold text-lg rounded-2xl"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;