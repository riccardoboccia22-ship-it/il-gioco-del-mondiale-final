import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usiamo la SERVICE_ROLE_KEY che ha i permessi di amministratore assoluto
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    const { userId, newPassword } = await req.json();

    // Aggiorna la password dell'utente
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}