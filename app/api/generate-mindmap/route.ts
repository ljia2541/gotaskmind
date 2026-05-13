import { NextRequest, NextResponse } from 'next/server';
import { createMindMapService } from '@/app/lib/mindmap-service';

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    if (topic.length > 2000) {
      return NextResponse.json({ error: 'Topic too long (max 2000 characters)' }, { status: 400 });
    }

    const service = createMindMapService();
    const markdown = await service.generateMindMap(topic.trim());

    return NextResponse.json({ markdown });
  } catch (error: any) {
    console.error('Mind map generation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
