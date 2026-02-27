import { NextRequest, NextResponse } from 'next/server';
import { notion2typst, getExtensionFromContentType } from '@nast/notion2typst';

export async function POST(request: NextRequest) {
  try {
    const { pageId } = await request.json();

    if (!pageId) {
      return NextResponse.json(
        { error: 'pageId is required' },
        { status: 400 }
      );
    }

    const notionToken = process.env.NOTION_TOKEN;
    if (!notionToken) {
      return NextResponse.json(
        { error: 'NOTION_TOKEN environment variable is not set' },
        { status: 500 }
      );
    }

    // Call notion2typst to convert the page
    const result = await notion2typst({
      notionToken,
      pageId,
      fetchImages: true,
    });

    // Convert images to base64 for JSON transport
    const imagesBase64 = result.images.map((image, index) => {
      const extension = getExtensionFromContentType(image.contentType);
      const filename = `image-${index + 1}${extension}`;
      
      // Convert ArrayBuffer to base64
      const base64 = Buffer.from(image.data).toString('base64');
      
      return {
        filename,
        contentType: image.contentType,
        data: base64,
      };
    });

    return NextResponse.json({
      typstCode: result.typstCode,
      images: imagesBase64,
    });

  } catch (error) {
    console.error('Error converting Notion page:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
