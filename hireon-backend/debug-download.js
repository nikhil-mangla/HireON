require('dotenv').config();
const { S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

// Configure AWS S3 v3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'hireon-downloads';

async function debugDownload() {
  console.log('🔍 Debugging Download Endpoint...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
  console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');
  console.log('AWS_REGION:', process.env.AWS_REGION);
  console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);
  console.log('');
  
  // Check local file
  const localPath = './downloads/HireOn-1.0.0-arm64.dmg';
  console.log('📁 Local File Check:');
  console.log('Local path:', localPath);
  console.log('File exists:', fs.existsSync(localPath));
  if (fs.existsSync(localPath)) {
    const stats = fs.statSync(localPath);
    console.log('File size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
  }
  console.log('');
  
  // Test S3 connection
  console.log('☁️ S3 Connection Test:');
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: 'HireOn-1.0.0-arm64.dmg'
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600,
      ResponseContentDisposition: 'attachment; filename="HireOn-1.0.0-arm64.dmg"',
      ResponseContentType: 'application/x-apple-diskimage'
    });
    
    console.log('✅ S3 signed URL generated successfully');
    console.log('URL length:', signedUrl.length, 'characters');
    console.log('URL starts with:', signedUrl.substring(0, 50) + '...');
  } catch (error) {
    console.log('❌ S3 connection failed:', error.message);
  }
  console.log('');
  
  // Simulate the backend logic
  console.log('🔄 Simulating Backend Logic:');
  
  // Step 1: Try S3
  console.log('1. Trying S3 signed URL...');
  try {
    const s3Command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: 'HireOn-1.0.0-arm64.dmg',
      ResponseContentDisposition: 'attachment; filename="HireOn-1.0.0-arm64.dmg"',
      ResponseContentType: 'application/x-apple-diskimage'
    });
    
    const s3Url = await getSignedUrl(s3Client, s3Command, { expiresIn: 3600 });
    console.log('   ✅ S3 URL generated, should redirect to:', s3Url.substring(0, 50) + '...');
  } catch (s3Error) {
    console.log('   ❌ S3 failed:', s3Error.message);
  }
  
  // Step 2: Check local file
  console.log('2. Checking local file...');
  if (fs.existsSync(localPath)) {
    console.log('   ✅ Local file exists, would serve directly');
  } else {
    console.log('   ❌ Local file not found');
  }
  
  // Step 3: GitHub fallback
  console.log('3. GitHub fallback would be tried last');
  
  console.log('\n🎯 Expected Behavior:');
  console.log('- If S3 works: Redirect to S3 URL (302)');
  console.log('- If S3 fails but local exists: Serve file directly (200)');
  console.log('- If both fail: Try GitHub or show error (404/500)');
}

debugDownload().catch(console.error); 