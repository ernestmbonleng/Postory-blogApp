import { ImageResponse } from 'next/og'; 
import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

export default async function handler(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const title = searchParams.get("title") || "My website";

    const fontData = await fetch(
      new URL("/fonts/InterDisplay-Bold.ttf", origin)
    ).then((res) => {
      if (!res.ok) throw new Error("Font file not found in public/fonts/");
      return res.arrayBuffer();
    });

    return new ImageResponse(
      (
        <div tw="flex flex-col w-full h-full items-center justify-center bg-white">
          <div tw="bg-gray-50 flex w-full">
            <div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8">
              <h2 tw="flex flex-col text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 text-left">

                <span>{title}</span> 
                <span tw="text-indigo-600">Read the full story today.</span>
              </h2>
              <div tw="mt-8 flex md:mt-0">
                <div tw="flex rounded-md shadow">
                  <a tw="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white">
                    Read Post 🤘
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        emoji: "noto",
        fonts: [
          {
            name: "Inter",
            data: fontData,
            style: "normal",
            weight: 700,
          },
        ],
      }
    );
  } catch (e: any) {
    console.error(`OG Error: ${e.message}`);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}









