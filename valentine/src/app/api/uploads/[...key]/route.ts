import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({
    region: process.env.S3_REGION!,
    endpoint: process.env.S3_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true, // Needed for MinIO/some S3 providers
});

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ key: string[] }> }
) {
    const { key: keyArray } = await params;
    const key = keyArray.join("/");

    if (!key) {
        return new NextResponse("Missing key", { status: 400 });
    }

    try {
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
        });

        const response = await s3.send(command);

        if (!response.Body) {
            return new NextResponse("File not found", { status: 404 });
        }

        // Convert stream to standard Web Response stream
        const stream = response.Body.transformToWebStream();

        return new NextResponse(stream, {
            headers: {
                "Content-Type": response.ContentType || "application/octet-stream",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error fetching file:", error);
        return new NextResponse("File not found", { status: 404 });
    }
}
