require('dotenv').config();
const { S3Client, ListObjectsV2Command, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Configure AWS S3 v3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'hireon-downloads';

// File configurations
const files = [
  {
    localPath: './downloads/HireOn-1.0.0-arm64.dmg',
    s3Key: 'HireOn-1.0.0-arm64.dmg',
    contentType: 'application/x-apple-diskimage',
    filename: 'HireOn-1.0.0-arm64.dmg'
  },
  {
    localPath: './downloads/HireOn-Setup.exe',
    s3Key: 'HireOn-Setup.exe',
    contentType: 'application/vnd.microsoft.portable-executable',
    filename: 'HireOn-Setup.exe'
  }
];

async function uploadFileToS3(fileConfig) {
  try {
    // Check if file exists locally
    if (!fs.existsSync(fileConfig.localPath)) {
      console.log(`⚠️  File not found: ${fileConfig.localPath}`);
      return false;
    }

    // Read file
    const fileContent = fs.readFileSync(fileConfig.localPath);
    const fileStats = fs.statSync(fileConfig.localPath);
    
    console.log(`📁 Uploading ${fileConfig.filename} (${(fileStats.size / 1024 / 1024).toFixed(2)} MB)...`);

    // Upload to S3
    const uploadParams = {
      Bucket: S3_BUCKET_NAME,
      Key: fileConfig.s3Key,
      Body: fileContent,
      ContentType: fileConfig.contentType,
      ContentDisposition: `attachment; filename="${fileConfig.filename}"`,
      Metadata: {
        'original-filename': fileConfig.filename,
        'upload-date': new Date().toISOString()
      }
    };

    const command = new PutObjectCommand(uploadParams);
    const result = await s3Client.send(command);
    
    console.log(`✅ Successfully uploaded: ${fileConfig.filename}`);
    console.log(`   ETag: ${result.ETag}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error uploading ${fileConfig.filename}:`, error.message);
    return false;
  }
}

async function listS3Files() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      MaxKeys: 10
    });

    const data = await s3Client.send(command);
    
    console.log('\n📋 Files in S3 bucket:');
    if (data.Contents && data.Contents.length > 0) {
      data.Contents.forEach(file => {
        const sizeMB = (file.Size / 1024 / 1024).toFixed(2);
        console.log(`   📄 ${file.Key} (${sizeMB} MB) - Last modified: ${file.LastModified}`);
      });
    } else {
      console.log('   No files found in bucket');
    }
  } catch (error) {
    console.error('❌ Error listing S3 files:', error.message);
  }
}

async function testS3Connection() {
  try {
    console.log('🔍 Testing S3 connection...');
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      MaxKeys: 1
    });
    
    await s3Client.send(command);
    console.log('✅ S3 connection successful!');
    return true;
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 HireOn S3 Upload Utility (AWS SDK v3)');
  console.log('==========================================\n');

  // Check environment variables
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS credentials not found in environment variables');
    console.log('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file');
    return;
  }

  console.log(`📦 S3 Bucket: ${S3_BUCKET_NAME}`);
  console.log(`🌍 AWS Region: ${process.env.AWS_REGION || 'us-east-1'}\n`);

  // Test connection first
  const connectionOk = await testS3Connection();
  if (!connectionOk) {
    console.log('❌ Cannot proceed without S3 connection');
    return;
  }

  // List existing files
  await listS3Files();

  console.log('\n📤 Starting upload process...\n');

  // Upload each file
  let successCount = 0;
  for (const fileConfig of files) {
    const success = await uploadFileToS3(fileConfig);
    if (success) successCount++;
    console.log(''); // Add spacing
  }

  console.log('📊 Upload Summary:');
  console.log(`   ✅ Successfully uploaded: ${successCount}/${files.length} files`);

  if (successCount > 0) {
    console.log('\n🎉 Upload completed! Your files are now available for direct download.');
    console.log('💡 Test the download endpoint:');
    console.log(`   Mac: https://your-backend-url/api/download/mac?direct=true`);
    console.log(`   Windows: https://your-backend-url/api/download/windows?direct=true`);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { uploadFileToS3, listS3Files, testS3Connection }; 