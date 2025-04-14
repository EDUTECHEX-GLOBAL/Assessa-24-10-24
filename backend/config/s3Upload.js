const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const uploadToS3 = (file) => {
  return new Promise((resolve, reject) => {
    const fileKey = `assessments/${uuidv4()}-${file.originalname}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      // No ACL — keeping it private
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.error("S3 Upload Error:", err);
        reject(err);
      } else {
        resolve({ key: fileKey }); // Return key instead of public URL
      }
    });
  });
};

module.exports = uploadToS3;
