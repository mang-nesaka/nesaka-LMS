import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { avatarUrl: true },
  });
  const avatar = profile?.avatarUrl;
  if (!avatar) return new NextResponse('Not found', { status: 404 });

  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(avatar);
  if (!match || avatar.length > 1_400_000) {
    return new NextResponse('Invalid avatar data', { status: 500 });
  }

  const bytes = Buffer.from(match[2], 'base64');
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': `image/${match[1]}`,
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
