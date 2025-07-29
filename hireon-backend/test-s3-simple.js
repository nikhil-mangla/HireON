require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'hireon-downloads';

async function testS3Access() {
  console.log('🔍 Testing S3 Access...\n');
  
  try {
    // Test 1: List buckets
    console.log('1. Testing bucket access...');
    const buckets = await s3.listBuckets().promise();
    console.log('✅ Buckets accessible:', buckets.Buckets.map(b => b.Name));
    
    // Test 2: List objects in our bucket
    console.log('\n2. Testing object listing...');
    const objects = await s3.listObjectsV2({
      Bucket: S3_BUCKET_NAME,
      MaxKeys: 10
    }).promise();
    
    console.log('✅ Objects in bucket:');
    if (objects.Contents && objects.Contents.length > 0) {
      objects.Contents.forEach(obj => {
        console.log(`   📄 ${obj.Key} (${(obj.Size / 1024 / 1024).toFixed(2)} MB)`);
      });
    } else {
      console.log('   No objects found');
    }
    
    // Test 3: Generate signed URL
    console.log('\n3. Testing signed URL generation...');
    const signedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: S3_BUCKET_NAME,
      Key: 'HireOn-1.0.0-arm64.dmg',
      Expires: 3600,
      ResponseContentDisposition: 'attachment; filename="HireOn-1.0.0-arm64.dmg"',
      ResponseContentType: 'application/x-apple-diskimage'
    });
    
    console.log('✅ Signed URL generated successfully!');
    console.log('URL:', signedUrl);
    
  } catch (error) {
    console.error('❌ S3 access failed:', error.message);
    console.error('Error code:', error.code);
  }
}

testS3Access(); 