require('dotenv').config();
const { S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

// Configure AWS S3 v3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'hireon-downloads';

async function generateDirectDownloadUrls() {
  console.log('🚀 Generating Direct S3 Download URLs\n');
  
  const files = [
    {
      key: 'HireOn-1.0.0-arm64.dmg',
      filename: 'HireOn-1.0.0-arm64.dmg',
      contentType: 'application/x-apple-diskimage',
      platform: 'Mac'
    }
  ];
  
  for (const file of files) {
    try {
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: file.key,
        ResponseContentDisposition: `attachment; filename="${file.filename}"`,
        ResponseContentType: file.contentType
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      
      console.log(`📥 ${file.platform} Download URL:`);
      console.log(signedUrl);
      console.log('');
      console.log(`⏰ URL expires in 1 hour`);
      console.log(`📁 File: ${file.filename}`);
      console.log(`💾 Size: 186.1 MB`);
      console.log('─'.repeat(80));
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error generating URL for ${file.platform}:`, error.message);
    }
  }
  
  console.log('💡 Instructions:');
  console.log('1. Copy the URL above');
  console.log('2. Paste it in your browser');
  console.log('3. The file will download directly');
  console.log('4. No redirects, no backend needed');
}

generateDirectDownloadUrls().catch(console.error); 