import imageCompression from "browser-image-compression";

export async function compressAndUploadImage(
  file: File,
  generateUploadUrl: () => Promise<string>
): Promise<Response> {
  try {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);

    const postUrl = await generateUploadUrl();

    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: compressedFile,
    });

    return result;
  } catch (error) {
    console.error("Error compressing or uploading image:", error);
    throw error;
  }
}
