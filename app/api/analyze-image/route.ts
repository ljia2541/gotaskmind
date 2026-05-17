import { NextRequest, NextResponse } from 'next/server';
import { createVisionService } from '@/app/lib/vision-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, imageBase64 } = body;

    // Build the image source for the vision model
    let imageSource: string;

    if (imageBase64) {
      // Validate base64 size (max ~5MB base64 = ~6.7MB string)
      if (imageBase64.length > 7_000_000) {
        return NextResponse.json({ error: 'Image too large (max 5MB)' }, { status: 400 });
      }
      // Use data URI for base64 images
      imageSource = `data:image/jpeg;base64,${imageBase64}`;
    } else if (imageUrl && typeof imageUrl === 'string') {
      // Basic URL validation
      try {
        const url = new URL(imageUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
      }
      imageSource = imageUrl;
    } else {
      return NextResponse.json({ error: 'imageUrl or imageBase64 is required' }, { status: 400 });
    }

    const visionService = createVisionService();
    const markdown = await visionService.analyzeImage(imageSource);

    return NextResponse.json({ markdown });
  } catch (error: any) {
    console.error('Image analysis failed:', error);
    return NextResponse.json(
      { error: error.message || 'Image analysis failed' },
      { status: 500 }
    );
  }
}