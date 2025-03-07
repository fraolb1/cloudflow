import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/aws";
import { createFileRecord } from "@/actions/files";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const path = formData.get("path") as string;
    const ownerId = formData.get("ownerId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    const currentuser = await auth();
    const userId = currentuser?.user.id;

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    const key = `uploads/${ownerId}/${
      new Date().toISOString().split("T")[0]
    }/${Date.now()}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: bytes,
      ContentType: file.type,
      Metadata: {
        path,
        ownerId,
      },
    });

    await s3Client.send(command);

    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const fileType = file.type.split("/")[1] ?? "other";

    const fileData = {
      name: file.name,
      key: key,
      url: fileUrl,
      size: file.size,
      type: fileType,
      ownerId: userId || "",
    };

    await createFileRecord(fileData);

    return NextResponse.json({
      success: true,
      url: fileUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
