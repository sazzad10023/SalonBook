const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey) {
    return jsonError(
      "Image upload is not configured. Please try again later.",
      500
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid upload request.", 400);
  }

  const image = formData.get("image");

  if (!(image instanceof File) || image.size === 0) {
    return jsonError("Please choose an image to upload.", 400);
  }

  if (!image.type.startsWith("image/")) {
    return jsonError("Only image files are allowed.", 400);
  }

  if (image.size > MAX_FILE_SIZE) {
    return jsonError("Image must be smaller than 10 MB.", 400);
  }

  try {
    const uploadBody = new FormData();
    uploadBody.append("image", image, image.name || "profile-image");

    const url = new URL(IMGBB_UPLOAD_URL);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url, {
      method: "POST",
      body: uploadBody,
      cache: "no-store",
    });

    const result = (await response.json().catch(() => null)) as {
      data?: { url?: string };
      error?: { message?: string };
    } | null;

    if (!response.ok || !result?.data?.url) {
      console.error("ImgBB upload failed", result?.error ?? response.statusText);
      return jsonError(
        result?.error?.message || "Could not upload your image.",
        response.ok ? 502 : 500
      );
    }

    return Response.json({ url: result.data.url });
  } catch (error) {
    console.error("ImgBB upload error", error);
    return jsonError("Could not upload your image.", 500);
  }
}
