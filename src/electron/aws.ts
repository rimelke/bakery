import fs from 'fs'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

export async function uploadToS3(localFile: string, key: string) {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  })

  const stream = fs.createReadStream(localFile)

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET!,
      Key: key,
      Body: stream
    })
  )
}
