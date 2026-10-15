import { ImageResponse } from 'next/og';
import { NextRequest } from "next/server";


export const config = {
  runtime: "edge",
};

export default async function handler(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    

    const title = searchParams.get("title") || "Wordoo Blog";
    const author = searchParams.get("author") || "Wordoo Creator";
    const image = searchParams.get("image");


    const fontData = await fetch(
      new URL("/fonts/InterDisplay-Bold.ttf", origin)
    ).then((res) => res.arrayBuffer()).catch(() => null);

    return new ImageResponse(
      (
        <div tw="flex flex-col w-full h-full items-center justify-center bg-white p-20">
 
          <div tw="absolute top-0 left-0 w-full h-2 bg-indigo-600 flex" />
          
          <div tw="flex flex-col w-full h-full justify-between">
            <div tw="flex flex-col">

              <div tw="flex items-center mb-8">
                <span tw="text-4xl font-black tracking-tighter text-gray-900">
                  WORD<span tw="text-indigo-600">oo</span>
                </span>
              </div>

              <h1 tw="text-7xl font-bold tracking-tight text-gray-900 leading-none mb-4">
                {title}
              </h1>
              
              <p tw="text-3xl text-indigo-600 font-medium">
                Read the full story today.
              </p>
            </div>

            <div tw="flex items-center justify-between w-full border-t border-gray-100 pt-10">
              <div tw="flex items-center">
                {image ? (
                  <img
                    src={image}
                    tw="w-20 h-20 rounded-full mr-4 border-4 border-gray-50"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div tw="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                     <span tw="text-indigo-600 text-2xl font-bold">{author[0]}</span>
                  </div>
                )}
                <div tw="flex flex-col">
                  <span tw="text-gray-500 text-xl uppercase tracking-widest font-bold">Curated by</span>
                  <span tw="text-gray-900 text-2xl font-black">{author}</span>
                </div>
              </div>

              <div tw="flex bg-indigo-600 rounded-2xl px-8 py-4 shadow-lg">
                <span tw="text-white text-xl font-bold">Read Post </span>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fontData ? [
          {
            name: "Inter",
            data: fontData,
            style: "normal",
            weight: 700,
          },
        ] : [],
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image`, { status: 500 });
  }
}