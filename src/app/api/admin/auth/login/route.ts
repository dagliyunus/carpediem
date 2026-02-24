import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateAdmin, createSessionToken, setAdminSessionCookie } from '@/lib/admin/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid credentials format.' }, { status: 400 });
  }

  const user = await authenticateAdmin(parsed.data.email, parsed.data.password);

  if (!user) {
    return NextResponse.json({ error: 'Login failed.' }, { status: 401 });
  }

  const token = createSessionToken(user.id, user.email);
  const res = NextResponse.json({ ok: true, user });

  setAdminSessionCookie(res, token);

  return res;
}
