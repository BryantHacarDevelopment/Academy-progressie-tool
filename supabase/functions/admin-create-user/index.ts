import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const authorization = request.headers.get('Authorization');

    if (!supabaseUrl || !serviceRoleKey || !authorization) {
      throw new Error('Serverconfiguratie of autorisatie ontbreekt.');
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = authorization.replace('Bearer ', '');
    const { data: userData, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Ongeldige sessie.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: callerProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, active')
      .eq('id', userData.user.id)
      .single();

    if (profileError || callerProfile?.role !== 'admin' || !callerProfile.active) {
      return new Response(JSON.stringify({ error: 'Alleen een actieve beheerder mag gebruikers aanmaken.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const fullName = String(body.fullName ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const role = String(body.role ?? 'manager');
    const branch = String(body.branch ?? '');

    if (!fullName || !email || password.length < 8) {
      throw new Error('Naam, e-mailadres en een wachtwoord van minimaal 8 tekens zijn verplicht.');
    }

    if (!['admin', 'teacher', 'manager'].includes(role)) {
      throw new Error('Ongeldige rol.');
    }

    if (!['Amsterdam', 'Utrecht', 'Moordrecht'].includes(branch)) {
      throw new Error('Ongeldige vestiging.');
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

    if (createError) throw createError;

    const { error: upsertError } = await adminClient.from('profiles').upsert({
      id: created.user.id,
      full_name: fullName,
      email,
      role,
      branch,
      active: true,
    });

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ userId: created.user.id, email }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Onbekende fout.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
