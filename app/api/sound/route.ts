import { NextRequest } from "next/server";
import { createReadStream } from "fs";
import { join } from "path";
import { stat } from "fs/promises";

export async function GET(request: NextRequest) {
  const soundPath = join(process.cwd(), "sounds", "FluidR3_GM.sf2");

  try {
    const stats = await stat(soundPath);

    const headers = new Headers();
    headers.set("Content-Type", "application/octet-stream");
    headers.set("Content-Length", stats.size.toString());
    headers.set("Content-Disposition", "attachment; filename=FluidR3_GM.sf2");

    const stream = createReadStream(soundPath);

    return new Response(stream as any, {
      headers,
    });
  } catch (error) {
    return new Response("Sound file not found", { status: 404 });
  }
}
