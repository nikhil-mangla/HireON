require('dotenv').config();
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// Configure AWS S3 v3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'hireon-downloads';

async function listS3Files() {
  console.log('🔍 Listing files in S3 bucket...\n');
  console.log('Bucket:', S3_BUCKET_NAME);
  console.log('');
  
  try {
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      MaxKeys: 100
    });

    const response = await s3Client.send(command);
    
    if (response.Contents && response.Contents.length > 0) {
      console.log('✅ Files found in bucket:');
      console.log('');
      
      response.Contents.forEach((object, index) => {
        const sizeMB = (object.Size / 1024 / 1024).toFixed(2);
        const lastModified = object.LastModified ? object.LastModified.toISOString() : 'Unknown';
        
        console.log(`${index + 1}. ${object.Key}`);
        console.log(`   Size: ${sizeMB} MB`);
        console.log(`   Last Modified: ${lastModified}`);
        console.log('');
      });
    } else {
      console.log('❌ No files found in bucket');
      console.log('');
      console.log('🔧 Next steps:');
      console.log('1. Upload the HireOn app files to S3');
      console.log('2. Make sure the file names match what the backend expects');
      console.log('3. Test the download functionality again');
    }
    
  } catch (error) {
    console.error('❌ Failed to list S3 files:', error.message);
    console.error('Error details:', error);
  }
}

listS3Files(); 