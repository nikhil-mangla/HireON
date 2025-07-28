# 📥 HireOn Desktop App Download Setup Guide

This guide explains how to set up direct downloads for the HireOn desktop application.

## 🎯 Current Status

The desktop app is currently in development. This setup provides multiple download methods for when the app is ready for release.

## 🚀 Download Methods

### Method 1: GitHub Releases (Recommended)
- **Pros**: Free, reliable, automatic versioning
- **Cons**: GitHub redirects to confirmation page
- **Setup**: Upload .dmg and .exe files to GitHub releases

### Method 2: Self-Hosted Files
- **Pros**: Direct downloads, full control
- **Cons**: Requires hosting infrastructure
- **Setup**: Upload files to your server/CDN

### Method 3: Cloud Storage (S3, Firebase, etc.)
- **Pros**: Scalable, reliable, direct downloads
- **Cons**: Additional cost
- **Setup**: Upload to cloud storage with public access

## 📁 File Structure

When you have the actual desktop app files, organize them like this:

```
hireon-backend/
├── downloads/
│   ├── HireOn-Setup.exe    # Windows installer
│   └── HireOn.dmg          # macOS disk image
└── server.js               # Backend with download endpoints
```

## 🔧 Implementation Details

### Frontend (DownloadPage.jsx)
- ✅ Direct download with `download` attribute
- ✅ Fallback to GitHub releases
- ✅ User-friendly instructions
- ✅ Mobile-responsive design

### Backend (server.js)
- ✅ `/api/download/:platform` endpoint
- ✅ Proper HTTP headers for downloads
- ✅ Support for local files and GitHub redirects
- ✅ Logging and error handling

## 📋 Setup Instructions

### Step 1: Prepare Your Files
1. Build your desktop app for Windows (.exe) and macOS (.dmg)
2. Ensure files are properly signed and notarized (especially for macOS)
3. Test the installers on clean systems

### Step 2: Choose Hosting Method

#### Option A: GitHub Releases
```bash
# Create a new release on GitHub
# Upload your .dmg and .exe files
# Update the URLs in DownloadPage.jsx
```

#### Option B: Self-Hosted
```bash
# Create downloads directory
mkdir -p hireon-backend/downloads

# Copy your files
cp HireOn-Setup.exe hireon-backend/downloads/
cp HireOn.dmg hireon-backend/downloads/

# Deploy to your server
```

#### Option C: Cloud Storage
```bash
# Upload to S3/Firebase/etc.
# Make files publicly accessible
# Update URLs in configuration
```

### Step 3: Update Configuration

#### Frontend Configuration (DownloadPage.jsx)
```javascript
const downloadConfig = {
  windows: {
    url: 'https://github.com/nikhil-mangla/HireON/releases/download/v1.0.0/HireOn-Setup.exe',
    filename: 'HireOn-Setup.exe',
    fallbackUrl: '/downloads/HireOn-Setup.exe'
  },
  mac: {
    url: 'https://github.com/nikhil-mangla/HireON/releases/download/v1.0.0/HireOn.dmg',
    filename: 'HireOn.dmg',
    fallbackUrl: '/downloads/HireOn.dmg'
  }
};
```

#### Backend Configuration (server.js)
```javascript
const downloadConfig = {
  windows: {
    filename: 'HireOn-Setup.exe',
    contentType: 'application/vnd.microsoft.portable-executable',
    githubUrl: 'https://github.com/nikhil-mangla/HireON/releases/download/v1.0.0/HireOn-Setup.exe',
    localPath: './downloads/HireOn-Setup.exe'
  },
  mac: {
    filename: 'HireOn.dmg',
    contentType: 'application/x-apple-diskimage',
    githubUrl: 'https://github.com/nikhil-mangla/HireON/releases/download/v1.0.0/HireOn.dmg',
    localPath: './downloads/HireOn.dmg'
  }
};
```

## 🔒 Security Considerations

### File Signing
- **Windows**: Sign your .exe with a valid certificate
- **macOS**: Sign and notarize your .dmg with Apple
- **Benefits**: Prevents security warnings, improves user trust

### HTTPS
- Always serve downloads over HTTPS
- Ensures file integrity and user security

### File Validation
- Implement checksums for file verification
- Provide SHA256 hashes for users to verify downloads

## 📊 Analytics & Monitoring

### Download Tracking
```javascript
// Log download attempts
logger.info(`Download requested for platform: ${platform}`);

// Track successful downloads
logger.info(`Direct download served for ${platform}: ${config.filename}`);
```

### User Analytics
- Track download success/failure rates
- Monitor platform preferences
- Identify common issues

## 🐛 Troubleshooting

### Common Issues

#### Downloads Don't Start
- Check file permissions on server
- Verify Content-Disposition headers
- Test with different browsers

#### GitHub Redirects
- GitHub always redirects for security
- Use direct CDN links if available
- Provide clear user instructions

#### File Size Issues
- Large files may timeout
- Consider chunked downloads
- Implement progress indicators

### Debug Commands
```bash
# Test download endpoint
curl -I https://your-domain.com/api/download/mac?direct=true

# Check file headers
curl -v https://your-domain.com/downloads/HireOn.dmg

# Verify file integrity
shasum -a 256 HireOn.dmg
```

## 🚀 Deployment Checklist

- [ ] Desktop app builds successfully
- [ ] Files are signed and notarized
- [ ] Download URLs are updated
- [ ] Backend endpoints are deployed
- [ ] Frontend is updated and deployed
- [ ] Download tracking is working
- [ ] Error handling is tested
- [ ] User instructions are clear

## 📞 Support

For issues with the download system:
1. Check server logs for errors
2. Verify file accessibility
3. Test with different browsers/devices
4. Contact the development team

---

**Note**: This setup supports both development (placeholder) and production (actual files) scenarios. The system gracefully handles missing files and provides user-friendly fallbacks. 