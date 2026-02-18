import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
    region: process.env.S3_REGION!,
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
});

export async function getPresignedUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
        ContentType: contentType,
    });

    try {
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        return url;
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        throw new Error("Failed to generate upload URL");
    }
}

export async function deleteFileConfig(key: string) {
    const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
    });
    try {
        await s3.send(command);
    } catch (error) {
        console.error("Error deleting file:", error);
        throw new Error("Failed to delete file");
    }
}
