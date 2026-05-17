import { NextRequest, NextResponse } from 'next/server';
import { createVisionService } from '@/app/lib/vision-service';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    // Basic URL validation
    try {
      const url = new URL(imageUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const visionService = createVisionService();
    const markdown = await visionService.analyzeImage(imageUrl);

    return NextResponse.json({ markdown });
  } catch (error: any) {
    console.error('Image analysis failed:', error);
    return NextResponse.json(
      { error: error.message || 'Image analysis failed' },
      { status: 500 }
    );
  }
}