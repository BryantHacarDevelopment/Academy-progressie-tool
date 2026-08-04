import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Alleen POST is toegestaan.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authorization = request.headers.get('Authorization');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'De Edge Function mist Supabase-instellingen.' }, 500);
  }

  if (!authorization) {
    return json({ error: 'Je bent niet ingelogd.' }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return json({ error: 'Je inlogsessie is ongeldig. Log opnieuw in.' }, 401);
  }

  const { data: requesterProfile, error: requesterError } = await adminClient
    .from('profiles')
    .select('role, active')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (requesterError || !requesterProfile) {
    return json({ error: 'Je gebruikersprofiel kon niet worden gecontroleerd.' }, 403);
  }

  if (!requesterProfile.active || requesterProfile.role !== 'admin') {
    return json({ error: 'Alleen een beheerder mag gebruikers aanmaken.' }, 403);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'De verzonden gegevens zijn niet leesbaar.' }, 400);
  }

  const fullName = String(payload.fullName ?? '').trim();
  const email = String(payload.email ?? '').trim().toLowerCase();
  const password = String(payload.password ?? '');
  const role = String(payload.role ?? '');
  const branch = String(payload.branch ?? '');

  if (!fullName || !email || !password || !role || !branch) {
    return json({ error: 'Vul naam, e-mailadres, wachtwoord, rol en vestiging in.' }, 400);
  }

  if (!['admin', 'teacher', 'manager'].includes(role)) {
    return json({ error: 'Ongeldige rol.' }, 400);
  }

  if (!['Amsterdam', 'Utrecht', 'Moordrecht'].includes(branch)) {
    return json({ error: 'Ongeldige vestiging.' }, 400);
  }

  if (password.length < 8) {
    return json({ error: 'Het tijdelijke wachtwoord moet minimaal 8 tekens hebben.' }, 400);
  }

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role,
      branch,
    },
  });

  if (createError) {
    const message = createError.message?.toLowerCase().includes('already')
      ? 'Er bestaat al een account met dit e-mailadres.'
      : createError.message;
    return json({ error: message }, 400);
  }

  if (!created.user) {
    return json({ error: 'Het account kon niet worden aangemaakt.' }, 500);
  }

  const { error: profileError } = await adminClient.from('profiles').upsert({
    id: created.user.id,
    full_name: fullName,
    email,
    role,
    branch,
    active: true,
  });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    return json({ error: `Profiel opslaan mislukt: ${profileError.message}` }, 500);
  }

  return json({
    user: {
      id: created.user.id,
      email,
      fullName,
      role,
      branch,
    },
  }, 201);
});
