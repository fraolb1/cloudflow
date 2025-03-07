import { s3Client } from "@/lib/aws";
import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const bucketName = process.env.AWS_S3_BUCKET;

  if (!bucketName) {
    return NextResponse.json({ message: "Bucket name not configured" });
  }

  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
    });

    const listedObjects = await s3Client.send(listCommand);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return NextResponse.json({ message: "No objects to delete" });
    }

    const deleteObjects = listedObjects.Contents.map((object) => ({
      Key: object.Key!,
    }));

    const batchSize = 1000;
    for (let i = 0; i < deleteObjects.length; i += batchSize) {
      const batch = deleteObjects.slice(i, i + batchSize);

      const deleteCommand = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: batch,
          Quiet: false,
        },
      });

      await s3Client.send(deleteCommand);
    }

    console.log("success");

    return NextResponse.json({
      message: `Successfully deleted ${deleteObjects.length} objects`,
    });
  } catch (error) {
    console.error("Error deleting objects:", error);
    return NextResponse.json({
      message: "Error deleting objects",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
