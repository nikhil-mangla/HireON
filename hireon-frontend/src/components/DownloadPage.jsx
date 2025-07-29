import { useState, useEffect } from 'react';
import { Download, Monitor, Apple, CheckCircle, Star, Users, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const DownloadPage = () => {
  const [downloadStarted, setDownloadStarted] = useState({ windows: false, mac: false });

  // Handle direct download parameter on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const platform = urlParams.get('platform');
    const isDirectDownload = urlParams.get('direct') === 'true';
    
    if (isDirectDownload && platform) {
      // Automatically trigger download for direct links
      console.log(`Direct download requested for ${platform}`);
      handleDownload(platform);
    }
  }, []);

  const handleDownload = async (platform) => {
    try {
      // Use the same API base URL logic as the main API configuration
      const API_BASE_URL = localStorage.getItem('API_OVERRIDE') || 
                           import.meta.env.VITE_API_BASE_URL || 
                           'https://hireon-aiel.onrender.com';

      const downloadUrl = `${API_BASE_URL}/api/download/${platform}?direct=true`;

      console.log(`Starting download for ${platform} from:`, downloadUrl);

      // Check if we have direct download parameter - now allow actual downloads
      const urlParams = new URLSearchParams(window.location.search);
      const isDirectDownload = urlParams.get('direct') === 'true';
      
      // For direct downloads, proceed with actual download instead of showing alert
      if (isDirectDownload) {
        console.log(`Proceeding with direct download for ${platform}`);
      }

      // Update UI state
      setDownloadStarted(prev => ({ ...prev, [platform]: true }));

      // Create a temporary anchor element for direct download
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Set the download attribute to force download instead of navigation
      link.setAttribute('download', platform === 'mac' ? 'HireOn-1.0.0-arm64.dmg' : 'HireOn-Setup.exe');
      
      // Do NOT set target="_blank" - this prevents redirects
      // link.target = '_blank'; <-- removed this line
      
      // Hide the link element
      link.style.display = 'none';
      
      // Append to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Direct download initiated for ${platform}`);

      // Reset state after 5 seconds
      setTimeout(() => {
        setDownloadStarted(prev => ({ ...prev, [platform]: false }));
      }, 5000);

      // Track download event
      console.log(`Download requested for ${platform}`);
      
    } catch (error) {
      console.error('Download failed:', error);
      
      // Show user-friendly error message
      alert(`Download failed. Please try again or contact support if the problem persists.\n\nError: ${error.message}`);
      
      // Reset state
      setDownloadStarted(prev => ({ ...prev, [platform]: false }));
    }
  };

  const features = [
    {
      icon: <Monitor className="h-6 w-6" />,
      title: "Cross-Platform",
      description: "Available for Windows and macOS (Coming Soon)"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Native performance with instant startup"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Your data stays on your device"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Offline Access",
      description: "Work without internet connection"
    }
  ];

  const stats = [
    { label: "Downloads", value: "50K+" },
    { label: "Rating", value: "4.9/5" },
    { label: "Users", value: "25K+" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg">
              <Monitor className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            HireOn Desktop
          </h1>
          
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Take your interview preparation to the next level with our powerful desktop application. 
            Native performance, offline capabilities, and exclusive features.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <Badge variant="secondary" className="mb-8">
            <Users className="h-4 w-4 mr-2" />
            Trusted by thousands of developers
          </Badge>
        </div>

        {/* Download Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Windows Download */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
            <CardHeader className="relative text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Monitor className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Windows
              </CardTitle>
              <CardDescription className="text-gray-600">
                For Windows 10 and later
              </CardDescription>
            </CardHeader>
            <CardContent className="relative text-center">
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">Version 1.0.0 • Coming Soon</div>
                <div className="text-xs text-gray-400">Compatible with Windows 10, 11</div>
              </div>
              
              <Button 
                onClick={() => handleDownload('windows')}
                className="w-full bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
                disabled={true}
              >
                <Download className="h-5 w-5 mr-2" />
                Coming Soon
              </Button>
              
              <div className="mt-4 text-xs text-gray-500">
                Automatic installer • No admin rights required
              </div>
            </CardContent>
          </Card>

          {/* macOS Download */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
            <CardHeader className="relative text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-purple-100 p-4 rounded-full">
                  <Apple className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                macOS
              </CardTitle>
              <CardDescription className="text-gray-600">
                For macOS 10.15 and later
              </CardDescription>
            </CardHeader>
            <CardContent className="relative text-center">
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">Version 1.0.0 • 186 MB</div>
                <div className="text-xs text-gray-400">Compatible with Apple Silicon (M1/M2/M3)</div>
              </div>
              
              <Button 
                onClick={() => handleDownload('mac')}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
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
              
              <div className="mt-4 text-xs text-gray-500">
                Universal binary • Drag & drop installation
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose HireOn Desktop?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-full">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* System Requirements */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-center text-gray-800">System Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Monitor className="h-5 w-5 mr-2" />
                    Windows
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Windows 10 (64-bit) or later</li>
                    <li>• 4 GB RAM minimum, 8 GB recommended</li>
                    <li>• 200 MB free disk space</li>
                    <li>• Internet connection for sync</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Apple className="h-5 w-5 mr-2" />
                    macOS
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• macOS 10.15 (Catalina) or later</li>
                    <li>• 4 GB RAM minimum, 8 GB recommended</li>
                    <li>• 200 MB free disk space</li>
                    <li>• Internet connection for sync</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Installation Instructions */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center text-gray-800">Installation Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Windows Installation</h4>
                  <ol className="text-sm text-gray-600 space-y-2">
                    <li>1. Download the installer file (.exe)</li>
                    <li>2. Run the installer as administrator</li>
                    <li>3. Follow the setup wizard</li>
                    <li>4. Launch HireOn from Start Menu</li>
                    <li>5. Sign in with your account</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">macOS Installation</h4>
                  <ol className="text-sm text-gray-600 space-y-2">
                    <li>1. Download the disk image (.dmg)</li>
                    <li>2. Open the downloaded file</li>
                    <li>3. Drag HireOn to Applications folder</li>
                    <li>4. Launch from Applications or Launchpad</li>
                    <li>5. Sign in with your account</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;



