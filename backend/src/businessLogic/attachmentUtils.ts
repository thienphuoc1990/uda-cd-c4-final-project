import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

// @ts-ignore
const _XAWS = AWSXRay.captureAWS(AWS);
const s3 = new AWS.S3({
    signatureVersion: 'v4'
});
const bucketName = process.env.ATTACHMENT_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;


export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string> {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: `${userId}-${todoId}`,
        Expires: parseInt(urlExpiration),
    })
}