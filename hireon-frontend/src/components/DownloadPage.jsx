import { useState } from 'react';
import { Download, Monitor, Apple, CheckCircle, Star, Users, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const DownloadPage = () => {
  const [downloadStarted, setDownloadStarted] = useState({ windows: false, mac: false });

  const handleDownload = async (platform) => {
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
      console.log(`Download started for ${platform}`);
      
    } catch (error) {
      console.error('Download failed:', error);
      
      // Fallback to direct GitHub URLs
      const fallbackUrls = {
        windows: 'https://github.com/nikhilmangla/hireon-desktop/releases/latest/download/HireOn-Setup.exe',
        mac: 'https://github.com/nikhilmangla/hireon-desktop/releases/latest/download/HireOn.dmg'
      };
      
      window.open(fallbackUrls[platform], '_blank');
    }
  };

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Native performance with instant startup and smooth interactions"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Your data stays local with end-to-end encryption"
    },
    {
      icon: <Monitor className="h-6 w-6" />,
      title: "Offline Ready",
      description: "Practice interviews even without internet connection"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Premium Features",
      description: "Access exclusive desktop-only features and shortcuts"
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
                <div className="text-sm text-gray-500 mb-2">Version 2.1.0 • 45.2 MB</div>
                <div className="text-xs text-gray-400">Compatible with Windows 10, 11</div>
              </div>
              
              <Button 
                onClick={() => handleDownload('windows')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
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
                <div className="text-sm text-gray-500 mb-2">Version 2.1.0 • 52.8 MB</div>
                <div className="text-xs text-gray-400">Compatible with Intel & Apple Silicon</div>
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



