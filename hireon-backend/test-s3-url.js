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

async function testS3UrlGeneration() {
  console.log('🔍 Testing S3 URL Generation with Exact Parameters...\n');
  
  try {
    // Use the exact same parameters as the failing request
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: 'HireOn-1.0.0-arm64.dmg',
      ResponseContentDisposition: 'attachment; filename="HireOn-1.0.0-arm64.dmg"',
      ResponseContentType: 'application/x-apple-diskimage'
    });

    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600 
    });
    
    console.log('✅ S3 signed URL generated successfully');
    console.log('URL:', signedUrl);
    console.log('');
    
    // Test if the file actually exists in S3
    console.log('🔍 Testing if file exists in S3...');
    try {
      const headCommand = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: 'HireOn-1.0.0-arm64.dmg'
      });
      
      // This will throw an error if the file doesn't exist
      await s3Client.send(headCommand);
      console.log('✅ File exists in S3 bucket');
    } catch (headError) {
      console.log('❌ File does not exist in S3 bucket');
      console.log('Error:', headError.message);
      console.log('');
      console.log('🔧 Solution: Upload the file to S3 bucket first');
      console.log('Bucket:', S3_BUCKET_NAME);
      console.log('Key:', 'HireOn-1.0.0-arm64.dmg');
    }
    
  } catch (error) {
    console.error('❌ S3 URL generation failed:', error.message);
    console.error('Error details:', error);
  }
}

testS3UrlGeneration(); 