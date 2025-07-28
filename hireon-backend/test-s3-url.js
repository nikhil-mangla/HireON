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

async function generateSignedUrl(key, filename, contentType) {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${filename}"`,
      ResponseContentType: contentType
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error(`Error generating S3 signed URL for ${key}:`, error);
    return null;
  }
}

async function testS3Url() {
  console.log('🔍 Testing S3 signed URL generation...\n');
  
  const signedUrl = await generateSignedUrl(
    'HireOn-1.0.0-arm64.dmg',
    'HireOn-1.0.0-arm64.dmg',
    'application/x-apple-diskimage'
  );
  
  if (signedUrl) {
    console.log('✅ S3 signed URL generated successfully!');
    console.log('📥 Direct download URL:');
    console.log(signedUrl);
    console.log('\n💡 Copy this URL and paste it in your browser to test the download.');
  } else {
    console.log('❌ Failed to generate S3 signed URL');
  }
}

testS3Url().catch(console.error); 