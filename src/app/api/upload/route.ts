import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

// Log env var availability (not values!) at module load
console.log("[Upload API] Env check:", {
    hasEndpoint: !!process.env.S3_ENDPOINT,
    hasRegion: !!process.env.S3_REGION,
    hasAccessKey: !!process.env.S3_ACCESS_KEY_ID,
    hasSecretKey: !!process.env.S3_SECRET_ACCESS_KEY,
    hasBucket: !!process.env.S3_BUCKET_NAME,
    bucket: process.env.S3_BUCKET_NAME,
    endpoint: process.env.S3_ENDPOINT,
});

const s3 = new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Check env vars at runtime
        if (!process.env.S3_ENDPOINT || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY || !process.env.S3_BUCKET_NAME) {
            console.error("[Upload API] Missing S3 env vars:", {
                hasEndpoint: !!process.env.S3_ENDPOINT,
                hasAccessKey: !!process.env.S3_ACCESS_KEY_ID,
                hasSecretKey: !!process.env.S3_SECRET_ACCESS_KEY,
                hasBucket: !!process.env.S3_BUCKET_NAME,
            });
            return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
        }

        console.log(`[Upload API] Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);

        // Generate a unique key
        const key = `uploads/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        console.log(`[Upload API] Sending to R2: key=${key}, bucket=${process.env.S3_BUCKET_NAME}`);

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: key,
                Body: buffer,
                ContentType: file.type,
            })
        );

        console.log(`[Upload API] Upload successful: ${key}`);
        return NextResponse.json({ key });
    } catch (error: any) {
        console.error("[Upload API] Error:", {
            message: error?.message,
            name: error?.name,
            code: error?.$metadata?.httpStatusCode,
            requestId: error?.$metadata?.requestId,
            stack: error?.stack?.substring(0, 500),
        });
        return NextResponse.json(
            { error: "Upload failed", details: error?.message },
            { status: 500 }
        );
    }
}
