require('dotenv').config();
const { S3Client, ListBucketsCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');

// Configure AWS S3 v3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'hireon-downloads';

async function testAWSCredentials() {
  console.log('🔍 Testing AWS Credentials and Bucket Access...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? `${process.env.AWS_ACCESS_KEY_ID.substring(0, 10)}...` : 'NOT SET');
  console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');
  console.log('AWS_REGION:', process.env.AWS_REGION || 'us-east-1');
  console.log('S3_BUCKET_NAME:', S3_BUCKET_NAME);
  console.log('');
  
  try {
    // Test 1: List all buckets (tests basic credential validity)
    console.log('1. Testing basic AWS credentials...');
    const listBucketsCommand = new ListBucketsCommand({});
    const bucketsResponse = await s3Client.send(listBucketsCommand);
    
    console.log('✅ AWS credentials are valid');
    console.log('Available buckets:');
    bucketsResponse.Buckets.forEach(bucket => {
      console.log(`   - ${bucket.Name} (created: ${bucket.CreationDate})`);
    });
    console.log('');
    
    // Test 2: Check if our specific bucket exists
    console.log('2. Testing access to specific bucket...');
    const headBucketCommand = new HeadBucketCommand({
      Bucket: S3_BUCKET_NAME
    });
    
    try {
      await s3Client.send(headBucketCommand);
      console.log(`✅ Bucket '${S3_BUCKET_NAME}' exists and is accessible`);
    } catch (headError) {
      if (headError.name === 'NotFound') {
        console.log(`❌ Bucket '${S3_BUCKET_NAME}' does not exist`);
        console.log('🔧 Solution: Create the bucket first');
      } else if (headError.name === 'Forbidden') {
        console.log(`❌ Access denied to bucket '${S3_BUCKET_NAME}'`);
        console.log('🔧 Solution: Check bucket permissions or use different credentials');
      } else {
        console.log(`❌ Error accessing bucket '${S3_BUCKET_NAME}':`, headError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ AWS credentials test failed:', error.message);
    
    if (error.name === 'InvalidAccessKeyId') {
      console.log('🔧 Solution: Check your AWS_ACCESS_KEY_ID');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.log('🔧 Solution: Check your AWS_SECRET_ACCESS_KEY');
    } else if (error.name === 'UnauthorizedOperation') {
      console.log('🔧 Solution: Check IAM permissions for S3 access');
    }
    
    console.log('');
    console.log('📝 Common fixes:');
    console.log('1. Verify AWS credentials are correct');
    console.log('2. Ensure credentials have S3 permissions');
    console.log('3. Check if the bucket exists');
    console.log('4. Verify the region is correct');
  }
}

testAWSCredentials(); 