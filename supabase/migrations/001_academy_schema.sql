-- Hacar Academy progressieportaal
-- Voer dit bestand eenmalig uit in Supabase > SQL Editor.

create extension if not exists pgcrypto;

DO $$ BEGIN
  create type public.user_role as enum ('admin', 'teacher', 'manager');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.branch_name as enum ('Amsterdam', 'Utrecht', 'Moordrecht');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  create type public.student_status as enum ('op_schema', 'loopt_voor', 'aandacht_nodig', 'gepauzeerd', 'afgerond');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique,
  role public.user_role not null default 'manager',
  branch public.branch_name,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  photo_url text,
  branch public.branch_name not null,
  start_date date,
  expected_end_date date,
  status public.student_status not null default 'op_schema',
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  assignment_role public.user_role not null,
  created_at timestamptz not null default now(),
  constraint student_assignment_role_check check (assignment_role in ('teacher', 'manager')),
  constraint student_assignments_unique unique (student_id, profile_id, assignment_role)
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  order_index integer not null,
  active boolean not null default true
);

create table if not exists public.module_items (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  code text not null unique,
  title text not null,
  description text,
  order_index integer not null,
  active boolean not null default true
);

create table if not exists public.competencies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  order_index integer not null,
  active boolean not null default true
);

create table if not exists public.student_item_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  module_item_id uuid not null references public.module_items(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  comment text,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_item_progress_unique unique (student_id, module_item_id)
);

create table if not exists public.student_competency_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  competency_id uuid not null references public.competencies(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  comment text,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_competency_progress_unique unique (student_id, competency_id)
);

create table if not exists public.student_module_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.student_item_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  module_item_id uuid not null references public.module_items(id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  report_month date not null,
  status public.student_status not null,
  summary text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monthly_reports_unique unique (student_id, report_month),
  constraint report_month_first_day check (report_month = date_trunc('month', report_month)::date)
);

create table if not exists public.monthly_item_snapshots (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.monthly_reports(id) on delete cascade,
  module_item_id uuid not null references public.module_items(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  comment text,
  constraint monthly_item_snapshots_unique unique (report_id, module_item_id)
);

create table if not exists public.monthly_competency_snapshots (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.monthly_reports(id) on delete cascade,
  competency_id uuid not null references public.competencies(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  comment text,
  constraint monthly_competency_snapshots_unique unique (report_id, competency_id)
);

create index if not exists idx_students_branch on public.students(branch);
create index if not exists idx_assignments_profile on public.student_assignments(profile_id);
create index if not exists idx_item_progress_student on public.student_item_progress(student_id);
create index if not exists idx_comp_progress_student on public.student_competency_progress(student_id);
create index if not exists idx_reports_student_month on public.monthly_reports(student_id, report_month desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
DROP TRIGGER IF EXISTS students_set_updated_at ON public.students;
create trigger students_set_updated_at before update on public.students for each row execute function public.set_updated_at();
DROP TRIGGER IF EXISTS item_progress_set_updated_at ON public.student_item_progress;
create trigger item_progress_set_updated_at before update on public.student_item_progress for each row execute function public.set_updated_at();
DROP TRIGGER IF EXISTS competency_progress_set_updated_at ON public.student_competency_progress;
create trigger competency_progress_set_updated_at before update on public.student_competency_progress for each row execute function public.set_updated_at();
DROP TRIGGER IF EXISTS monthly_reports_set_updated_at ON public.monthly_reports;
create trigger monthly_reports_set_updated_at before update on public.monthly_reports for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, branch)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'manager'::public.user_role),
    case
      when new.raw_user_meta_data ->> 'branch' in ('Amsterdam', 'Utrecht', 'Moordrecht')
        then (new.raw_user_meta_data ->> 'branch')::public.branch_name
      else null
    end
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email;
  return new;
end;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
create trigger on_auth_user_created
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_new_auth_user();

-- Maak profielen voor accounts die al bestonden voordat deze trigger werd geplaatst.
insert into public.profiles (id, full_name, email)
select
  id,
  coalesce(nullif(raw_user_meta_data ->> 'full_name', ''), split_part(email, '@', 1)),
  email
from auth.users
on conflict (id) do nothing;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and active = true;
$$;

create or replace function public.current_user_branch()
returns public.branch_name
language sql
stable
security definer
set search_path = public
as $$
  select branch from public.profiles where id = auth.uid() and active = true;
$$;

create or replace function public.can_view_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when public.current_user_role() = 'admin' then true
    when public.current_user_role() = 'manager' then exists (
      select 1
      from public.students s
      where s.id = p_student_id
        and (
          s.branch = public.current_user_branch()
          or exists (
            select 1 from public.student_assignments a
            where a.student_id = s.id
              and a.profile_id = auth.uid()
              and a.assignment_role = 'manager'
          )
        )
    )
    when public.current_user_role() = 'teacher' then exists (
      select 1 from public.student_assignments a
      where a.student_id = p_student_id
        and a.profile_id = auth.uid()
        and a.assignment_role = 'teacher'
    )
    else false
  end;
$$;

create or replace function public.can_edit_student_progress(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when public.current_user_role() = 'admin' then true
    when public.current_user_role() = 'teacher' then exists (
      select 1 from public.student_assignments a
      where a.student_id = p_student_id
        and a.profile_id = auth.uid()
        and a.assignment_role = 'teacher'
    )
    else false
  end;
$$;

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.student_assignments enable row level security;
alter table public.modules enable row level security;
alter table public.module_items enable row level security;
alter table public.competencies enable row level security;
alter table public.student_item_progress enable row level security;
alter table public.student_competency_progress enable row level security;
alter table public.student_module_notes enable row level security;
alter table public.student_item_notes enable row level security;
alter table public.monthly_reports enable row level security;
alter table public.monthly_item_snapshots enable row level security;
alter table public.monthly_competency_snapshots enable row level security;

-- Oude policies met dezelfde namen veilig verwijderen.
drop policy if exists profiles_read_authenticated on public.profiles;
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_read_authenticated on public.profiles for select to authenticated using (true);
create policy profiles_admin_update on public.profiles for update to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists students_read_visible on public.students;
drop policy if exists students_admin_insert on public.students;
drop policy if exists students_admin_update on public.students;
drop policy if exists students_admin_delete on public.students;
create policy students_read_visible on public.students for select to authenticated using (public.can_view_student(id));
create policy students_admin_insert on public.students for insert to authenticated with check (public.current_user_role() = 'admin');
create policy students_admin_update on public.students for update to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy students_admin_delete on public.students for delete to authenticated using (public.current_user_role() = 'admin');

drop policy if exists assignments_read_visible on public.student_assignments;
drop policy if exists assignments_admin_all on public.student_assignments;
create policy assignments_read_visible on public.student_assignments for select to authenticated using (public.can_view_student(student_id));
create policy assignments_admin_all on public.student_assignments for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists modules_read on public.modules;
drop policy if exists modules_admin_all on public.modules;
create policy modules_read on public.modules for select to authenticated using (active = true or public.current_user_role() = 'admin');
create policy modules_admin_all on public.modules for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists module_items_read on public.module_items;
drop policy if exists module_items_admin_all on public.module_items;
create policy module_items_read on public.module_items for select to authenticated using (active = true or public.current_user_role() = 'admin');
create policy module_items_admin_all on public.module_items for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists competencies_read on public.competencies;
drop policy if exists competencies_admin_all on public.competencies;
create policy competencies_read on public.competencies for select to authenticated using (active = true or public.current_user_role() = 'admin');
create policy competencies_admin_all on public.competencies for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

drop policy if exists item_progress_read on public.student_item_progress;
drop policy if exists item_progress_insert on public.student_item_progress;
drop policy if exists item_progress_update on public.student_item_progress;
create policy item_progress_read on public.student_item_progress for select to authenticated using (public.can_view_student(student_id));
create policy item_progress_insert on public.student_item_progress for insert to authenticated with check (public.can_edit_student_progress(student_id));
create policy item_progress_update on public.student_item_progress for update to authenticated using (public.can_edit_student_progress(student_id)) with check (public.can_edit_student_progress(student_id));

drop policy if exists competency_progress_read on public.student_competency_progress;
drop policy if exists competency_progress_insert on public.student_competency_progress;
drop policy if exists competency_progress_update on public.student_competency_progress;
create policy competency_progress_read on public.student_competency_progress for select to authenticated using (public.can_view_student(student_id));
create policy competency_progress_insert on public.student_competency_progress for insert to authenticated with check (public.can_edit_student_progress(student_id));
create policy competency_progress_update on public.student_competency_progress for update to authenticated using (public.can_edit_student_progress(student_id)) with check (public.can_edit_student_progress(student_id));

drop policy if exists module_notes_read on public.student_module_notes;
drop policy if exists module_notes_insert on public.student_module_notes;
create policy module_notes_read on public.student_module_notes for select to authenticated using (public.can_view_student(student_id));
create policy module_notes_insert on public.student_module_notes for insert to authenticated with check (public.can_edit_student_progress(student_id));

drop policy if exists item_notes_read on public.student_item_notes;
drop policy if exists item_notes_insert on public.student_item_notes;
create policy item_notes_read on public.student_item_notes for select to authenticated using (public.can_view_student(student_id));
create policy item_notes_insert on public.student_item_notes for insert to authenticated with check (public.can_edit_student_progress(student_id));

drop policy if exists monthly_reports_read on public.monthly_reports;
drop policy if exists monthly_reports_write on public.monthly_reports;
create policy monthly_reports_read on public.monthly_reports for select to authenticated using (public.can_view_student(student_id));
create policy monthly_reports_write on public.monthly_reports for all to authenticated using (public.can_edit_student_progress(student_id)) with check (public.can_edit_student_progress(student_id));

drop policy if exists monthly_items_read on public.monthly_item_snapshots;
create policy monthly_items_read on public.monthly_item_snapshots for select to authenticated using (
  exists (select 1 from public.monthly_reports r where r.id = report_id and public.can_view_student(r.student_id))
);

drop policy if exists monthly_competencies_read on public.monthly_competency_snapshots;
create policy monthly_competencies_read on public.monthly_competency_snapshots for select to authenticated using (
  exists (select 1 from public.monthly_reports r where r.id = report_id and public.can_view_student(r.student_id))
);

create or replace function public.create_monthly_report(
  p_student_id uuid,
  p_report_month date,
  p_summary text,
  p_status public.student_status
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report_id uuid;
  v_month date := date_trunc('month', p_report_month)::date;
begin
  if not public.can_edit_student_progress(p_student_id) then
    raise exception 'Je hebt geen rechten om een maandrapport voor deze leerling te maken.';
  end if;

  insert into public.monthly_reports (student_id, report_month, summary, status, created_by)
  values (p_student_id, v_month, nullif(trim(p_summary), ''), p_status, auth.uid())
  on conflict (student_id, report_month)
  do update set
    summary = excluded.summary,
    status = excluded.status,
    created_by = auth.uid(),
    updated_at = now()
  returning id into v_report_id;

  delete from public.monthly_item_snapshots where report_id = v_report_id;
  insert into public.monthly_item_snapshots (report_id, module_item_id, score, comment)
  select v_report_id, module_item_id, score, comment
  from public.student_item_progress
  where student_id = p_student_id;

  delete from public.monthly_competency_snapshots where report_id = v_report_id;
  insert into public.monthly_competency_snapshots (report_id, competency_id, score, comment)
  select v_report_id, competency_id, score, comment
  from public.student_competency_progress
  where student_id = p_student_id;

  update public.students set status = p_status where id = p_student_id;

  return v_report_id;
end;
$$;

grant execute on function public.create_monthly_report(uuid, date, text, public.student_status) to authenticated;

-- API-rechten; Row Level Security bepaalt welke rijen werkelijk toegankelijk zijn.
grant usage on schema public to authenticated;
grant select on public.profiles, public.students, public.student_assignments, public.modules, public.module_items, public.competencies, public.student_item_progress, public.student_competency_progress, public.student_module_notes, public.student_item_notes, public.monthly_reports, public.monthly_item_snapshots, public.monthly_competency_snapshots to authenticated;
grant insert, update on public.student_item_progress, public.student_competency_progress to authenticated;
grant insert on public.student_module_notes, public.student_item_notes to authenticated;
grant insert, update, delete on public.students, public.student_assignments to authenticated;
grant update on public.profiles to authenticated;
grant insert, update, delete on public.modules, public.module_items, public.competencies to authenticated;
grant insert, update, delete on public.monthly_reports to authenticated;

-- MODULES EN ONDERDELEN

insert into public.modules (code, title, description, order_index) values ('M01', '1. Persoonlijke veiligheid', 'Veilig werken, risico’s herkennen en correct handelen bij incidenten.', 1) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M01.01', 'PBM’s correct selecteren en gebruiken', 'Gebruikt passende persoonlijke beschermingsmiddelen voor de werkzaamheden.', 1 from public.modules where code='M01' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M01.02', 'Installatie spanningsloos maken', 'Schakelt uit, beveiligt tegen wederinschakelen en markeert de werksituatie.', 2 from public.modules where code='M01' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M01.03', 'Spanningsloosheid controleren', 'Controleert met passend meetgereedschap of veilig gewerkt kan worden.', 3 from public.modules where code='M01' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M01.04', 'Elektrische gevaren herkennen', 'Herkent risico’s zoals schok, kortsluiting, boogvorming en brand.', 4 from public.modules where code='M01' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M01.05', 'LMRA uitvoeren', 'Voert vóór aanvang een Last Minute Risico Analyse uit.', 5 from public.modules where code='M01' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M01.06', 'Gereedschap en meetmiddelen vooraf controleren', 'Controleert staat, isolatie, keuring en geschiktheid.', 6 from public.modules where code='M01' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M01.07', 'Werkplek afzetten en onbevoegden weren', 'Zorgt voor een veilige afstand, afzetting en waarschuwingen.', 7 from public.modules where code='M01' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M01.08', 'Veilig samenwerken en communiceren', 'Maakt duidelijke afspraken bij gezamenlijke werkzaamheden.', 8 from public.modules where code='M01' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M01.09', 'Handelen bij elektrische schok of brand', 'Schakelt veilig af, verleent hulp en alarmeert waar nodig.', 9 from public.modules where code='M01' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M01.10', 'Handelen bij geraakte gas- of waterleiding', 'Beperkt schade en meldt het incident volgens de procedure.', 10 from public.modules where code='M01' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;

insert into public.modules (code, title, description, order_index) values ('M02', '2. Elektrotechniek basisvaardigheden', 'Dagelijks gebruik van meetapparatuur, gereedschappen en materialen.', 2) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M02.01', 'Multimeter gebruiken', 'Meet spanning, stroom, weerstand en continuïteit op correcte wijze.', 1 from public.modules where code='M02' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M02.02', 'Duspol of spanningstester gebruiken', 'Controleert veilig de aanwezigheid of afwezigheid van spanning.', 2 from public.modules where code='M02' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M02.03', 'Ampèretang gebruiken', 'Meet stroom rondom één geleider en kiest de juiste meetstand.', 3 from public.modules where code='M02' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M02.04', 'Installatietester gebruiken', 'Voert basismetingen aan installaties uit volgens instructie.', 4 from public.modules where code='M02' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M02.05', 'Aardlektester gebruiken', 'Test uitschakelstroom, uitschakeltijd en correcte aansluiting.', 5 from public.modules where code='M02' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M02.06', 'Isolatieweerstand meten met megger', 'Meet tussen fase, nul en aarde en interpreteert de basisuitkomst.', 6 from public.modules where code='M02' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M02.07', 'Handgereedschap correct gebruiken', 'Gebruikt schroevendraaiers, tangen, striptangen en krimptangen veilig.', 7 from public.modules where code='M02' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M02.08', 'Elektrisch gereedschap correct gebruiken', 'Gebruikt boor-, frees- en zaaggereedschap veilig en passend.', 8 from public.modules where code='M02' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M02.09', 'Kabels en draadsoorten herkennen', 'Herkent veelgebruikte kabels, doorsneden, kleuren en toepassingen.', 9 from public.modules where code='M02' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M02.10', 'Bevestigings- en verbindingsmateriaal toepassen', 'Kiest en gebruikt lasdoppen, klemmen, zadels en kabelbinders correct.', 10 from public.modules where code='M02' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;

insert into public.modules (code, title, description, order_index) values ('M03', '3. Leiding- en draadwerk', 'Leidingen, dozen en bedrading veilig, netjes en volgens regelgeving monteren.', 3) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M03.01', 'Inbouw of opbouw kiezen', 'Maakt een passende keuze op basis van situatie, veiligheid en afwerking.', 1 from public.modules where code='M03' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M03.02', 'Buissoort en diameter kiezen', 'Kiest gladde, slagvaste of flexibele buis en een passende diameter.', 2 from public.modules where code='M03' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M03.03', 'Leidingtracé voorbereiden', 'Plant een logisch en uitvoerbaar tracé met correcte bochten en doorvoeren.', 3 from public.modules where code='M03' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M03.04', 'Mantelbuis monteren en bevestigen', 'Monteert buis recht, stevig en met passende bevestigingsafstand.', 4 from public.modules where code='M03' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M03.05', 'Inbouwdozen plaatsen', 'Plaatst dozen op de juiste positie, diepte en hoogte.', 5 from public.modules where code='M03' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M03.06', 'Las- en kabeldozen toepassen', 'Kiest de juiste doos voor aftakkingen, binnen- of buitentoepassing.', 6 from public.modules where code='M03' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M03.07', 'Draden gelijktijdig trekken', 'Trekt installatiedraden zonder aanwezige draden te beschadigen.', 7 from public.modules where code='M03' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M03.08', 'Maximale buisvulling bewaken', 'Houdt rekening met buistype, diameter en draaddikte.', 8 from public.modules where code='M03' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M03.09', 'Draad strippen en verbindingen maken', 'Maakt betrouwbare verbindingen zonder koper of isolatie te beschadigen.', 9 from public.modules where code='M03' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M03.10', 'Brandwerende doorvoeren correct afwerken', 'Herkent en herstelt brandwerende scheidingen volgens instructie.', 10 from public.modules where code='M03' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M03.11', 'Leiding- en draadwerk visueel controleren', 'Controleert netheid, bevestiging, kleurgebruik en mechanische bescherming.', 11 from public.modules where code='M03' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;

insert into public.modules (code, title, description, order_index) values ('M04', '4. Wisselspanning en gelijkspanning', 'Basiskennis van AC en DC, kenmerken, toepassingen en omzetting.', 4) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M04.01', 'Wisselspanning uitleggen', 'Legt richting, frequentie, sinusvorm en toepassing van AC uit.', 1 from public.modules where code='M04' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M04.02', 'Gelijkspanning uitleggen', 'Legt vaste polariteit en toepassing van DC uit.', 2 from public.modules where code='M04' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M04.03', 'AC en DC herkennen in praktijksituaties', 'Herkent het spanningssysteem aan bron, component of toepassing.', 3 from public.modules where code='M04' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M04.04', 'Polariteit bij DC bewaken', 'Sluit plus en min correct aan en voorkomt ompoling.', 4 from public.modules where code='M04' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M04.05', 'Frequentie en netspanning benoemen', 'Kent de relevante basiswaarden van het Nederlandse laagspanningsnet.', 5 from public.modules where code='M04' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M04.06', 'Omzetting AC naar DC herkennen', 'Herkent transformator, gelijkrichter en voeding in een installatie.', 6 from public.modules where code='M04' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M04.07', 'Veilig meten aan AC en DC', 'Kiest meetstand, bereik en aansluitpunten correct.', 7 from public.modules where code='M04' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;

insert into public.modules (code, title, description, order_index) values ('M05', '5. Elektrische grootheden en formules', 'Rekenen met spanning, stroom, weerstand, vermogen en energie.', 5) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M05.01', 'Spanning, stroom en weerstand benoemen', 'Kent symbolen, eenheden en betekenis van U, I en R.', 1 from public.modules where code='M05' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M05.02', 'Wet van Ohm toepassen', 'Berekent U, I of R in eenvoudige situaties.', 2 from public.modules where code='M05' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M05.03', 'Vermogen berekenen', 'Past P = U × I toe en rekent formules om.', 3 from public.modules where code='M05' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M05.04', 'Energieverbruik berekenen', 'Berekent kWh op basis van vermogen en gebruiksduur.', 4 from public.modules where code='M05' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M05.05', 'Serie- en parallelwaarden berekenen', 'Berekent eenvoudige vervangingsweerstanden en stromen.', 5 from public.modules where code='M05' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M05.06', 'Meetwaarde vergelijken met berekening', 'Beoordeelt of een gemeten waarde logisch en plausibel is.', 6 from public.modules where code='M05' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M05.07', 'Belasting van groep of automaat beoordelen', 'Verbindt vermogen en stroom met een veilige belasting.', 7 from public.modules where code='M05' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;

insert into public.modules (code, title, description, order_index) values ('M06', '6. Schakelingen, schema’s en symbolen', 'Elektrische schakelingen begrijpen, opbouwen, lezen en controleren.', 6) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M06.01', 'Serieschakeling opbouwen en uitleggen', 'Bouwt een eenvoudige serieschakeling en benoemt het gedrag.', 1 from public.modules where code='M06' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M06.02', 'Parallelschakeling opbouwen en uitleggen', 'Bouwt een eenvoudige parallelschakeling en benoemt het gedrag.', 2 from public.modules where code='M06' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M06.03', 'Enkelpolige schakeling aansluiten', 'Sluit een basis lichtschakeling correct aan.', 3 from public.modules where code='M06' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M06.04', 'Wisselschakeling aansluiten', 'Sluit een lampbediening vanaf twee plaatsen correct aan.', 4 from public.modules where code='M06' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M06.05', 'Kruisschakeling herkennen of aansluiten', 'Herkent de functie en kan deze met begeleiding realiseren.', 5 from public.modules where code='M06' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M06.06', 'Schema’s lezen', 'Volgt een stroomkring en koppelt schema aan de praktijksituatie.', 6 from public.modules where code='M06' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M06.07', 'Elektrotechnische symbolen herkennen', 'Herkent veelgebruikte symbolen voor schakelaars, lichtpunten en beveiligingen.', 7 from public.modules where code='M06' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M06.08', 'Bedradingsfouten opsporen', 'Controleert systematisch verbindingen en signaleert afwijkingen.', 8 from public.modules where code='M06' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M06.09', 'Schakeling testen en in bedrijf stellen', 'Voert visuele controle en functionele test veilig uit.', 9 from public.modules where code='M06' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;

insert into public.modules (code, title, description, order_index) values ('M07', '7. Aarding, aardlekschakelaars en normen', 'Aardingsvoorzieningen, aanvullende bescherming en basisregels uit NEN 1010/NEN 3140.', 7) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M07.01', 'Doel van aarding uitleggen', 'Legt uit hoe aarding personen en installaties beschermt.', 1 from public.modules where code='M07' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M07.02', 'Aardrail, aardpen en CAP herkennen', 'Herkent de belangrijkste onderdelen van de aardingsvoorziening.', 2 from public.modules where code='M07' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M07.03', 'Beschermingsleiding correct aansluiten', 'Past geel-groen correct toe en maakt betrouwbare verbindingen.', 3 from public.modules where code='M07' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M07.04', 'Vereffening herkennen en toepassen', 'Herkent verbindingen met metalen delen en centrale aardpunten.', 4 from public.modules where code='M07' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M07.05', 'Zone-indeling in natte ruimten toepassen', 'Houdt rekening met zones en toegestane apparatuur.', 5 from public.modules where code='M07' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M07.06', 'Aardlekschakelaar herkennen en uitleggen', 'Benoemt functie, testknop, nominale stroom en aanspreekwaarde.', 6 from public.modules where code='M07' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M07.07', 'Aardlekschakelaar testen', 'Voert functionele test en meting correct uit.', 7 from public.modules where code='M07' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M07.08', 'Aardings- en isolatiemetingen interpreteren', 'Herkent onveilige of afwijkende basisresultaten.', 8 from public.modules where code='M07' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M07.09', 'NEN 1010 en NEN 3140 in praktijk toepassen', 'Werkt volgens relevante instructies, verantwoordelijkheden en veiligheidsregels.', 9 from public.modules where code='M07' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;

insert into public.modules (code, title, description, order_index) values ('M08', '8. Rookmelders', 'Rookmelders selecteren, plaatsen, koppelen, testen en onderhouden.', 8) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M08.01', 'Wettelijke basis en toepassingsgebied herkennen', 'Weet waar rookmelders vereist of wenselijk zijn.', 1 from public.modules where code='M08' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M08.02', 'Juiste plaats aan plafond bepalen', 'Houdt rekening met afstand tot wand, hoek en obstakels.', 2 from public.modules where code='M08' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M08.03', 'Dode hoeken en tochtige plekken vermijden', 'Voorkomt ongunstige plaatsing bij roosters en luchtstromen.', 3 from public.modules where code='M08' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M08.04', 'Afstand tot keuken en badkamer beoordelen', 'Beperkt ongewenste meldingen door rook of stoom.', 4 from public.modules where code='M08' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M08.05', 'Rookmelder monteren', 'Monteert stevig, bereikbaar en volgens instructie.', 5 from public.modules where code='M08' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M08.06', 'Rookmelders koppelen', 'Realiseert of controleert bedrade of draadloze koppeling.', 6 from public.modules where code='M08' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M08.07', 'Rookmelder testen en registreren', 'Voert functietest uit en legt resultaat vast.', 7 from public.modules where code='M08' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M08.08', 'Batterij en levensduur controleren', 'Controleert voedingsbron, productiedatum en vervangingsmoment.', 8 from public.modules where code='M08' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M08.09', 'Bewoner of klant informeren', 'Geeft duidelijke uitleg over testen, onderhoud en signalen.', 9 from public.modules where code='M08' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;

insert into public.modules (code, title, description, order_index) values ('M09', '9. Noodverlichting', 'Functie, onderhoud, testen, registratie en rapportage van noodverlichting.', 9) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M09.01', 'Functie van noodverlichting uitleggen', 'Onderscheidt vluchtweg-, anti-paniek- en noodverlichting.', 1 from public.modules where code='M09' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M09.02', 'Armatuur en pictogram beoordelen', 'Controleert plaatsing, zichtbaarheid en juiste vluchtrichting.', 2 from public.modules where code='M09' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M09.03', 'Periodiek onderhoud uitvoeren', 'Controleert armatuur, lichtbron, behuizing en aansluitingen.', 3 from public.modules where code='M09' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M09.04', 'Accu of batterij beoordelen', 'Controleert leeftijd, conditie, laadtijd en autonome brandduur.', 4 from public.modules where code='M09' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M09.05', 'Functionele test uitvoeren', 'Simuleert netuitval en controleert correcte omschakeling.', 5 from public.modules where code='M09' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M09.06', 'Automatisch testsysteem uitlezen', 'Herkent meldingen en legt storingen vast.', 6 from public.modules where code='M09' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M09.07', 'Logboek correct invullen', 'Registreert locatie, testdatum, resultaat en vervolgactie.', 7 from public.modules where code='M09' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M09.08', 'Afwijkingen rapporteren en opvolgen', 'Omschrijft hersteladvies en communiceert urgentie.', 8 from public.modules where code='M09' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;

insert into public.modules (code, title, description, order_index) values ('M10', '10. Verlichting', 'Verschillende soorten verlichting veilig installeren, aansluiten en testen.', 10) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M10.01', 'Lichtbron en armatuurtype herkennen', 'Herkent LED, conventionele en geïntegreerde armaturen.', 1 from public.modules where code='M10' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M10.02', 'Geschikt armatuur selecteren', 'Houdt rekening met ruimte, IP-klasse, lichtkleur en toepassing.', 2 from public.modules where code='M10' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M10.03', 'Montageplaats en bevestiging bepalen', 'Monteert stevig, recht en onderhoudbaar.', 3 from public.modules where code='M10' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M10.04', 'Armatuur elektrisch aansluiten', 'Sluit fase, nul, aarde en eventuele schakeldraad correct aan.', 4 from public.modules where code='M10' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M10.05', 'Driver, transformator of voorschakelapparaat herkennen', 'Herkent functie en controleert compatibiliteit.', 5 from public.modules where code='M10' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M10.06', 'Schakeling en bediening controleren', 'Test schakelaar, sensor, dimmer of tijdsturing.', 6 from public.modules where code='M10' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M10.07', 'Storing aan verlichting analyseren', 'Controleert voeding, verbindingen, component en lichtbron.', 7 from public.modules where code='M10' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M10.08', 'Installatie functioneel opleveren', 'Voert controle uit en laat werkplek veilig en netjes achter.', 8 from public.modules where code='M10' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;

insert into public.modules (code, title, description, order_index) values ('M11', '11. Groepenkasten', 'Samenstelling, bedrading, controle en basisuitbreidingen van groepenkasten.', 11) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M11.01', 'Hoofdschakelaar herkennen en uitleggen', 'Benoemt positie, functie en bediening.', 1 from public.modules where code='M11' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M11.02', 'Aardlekschakelaar herkennen en uitleggen', 'Benoemt functie, test en aangesloten eindgroepen.', 2 from public.modules where code='M11' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M11.03', 'Installatieautomaat herkennen en selecteren', 'Herkent karakteristiek, nominale stroom en polental.', 3 from public.modules where code='M11' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M11.04', 'Kookgroep of krachtgroep herkennen', 'Herkent gekoppelde groepen en meerfasige toepassingen.', 4 from public.modules where code='M11' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M11.05', 'Beltrafo en overige modules herkennen', 'Herkent hulponderdelen en aanvullende componenten.', 5 from public.modules where code='M11' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M11.06', 'Groepenkast logisch indelen', 'Plaatst componenten overzichtelijk en houdt rekening met warmte en ruimte.', 6 from public.modules where code='M11' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M11.07', 'Componenten monteren op DIN-rail', 'Monteert stevig en volgens fabrikantvoorschrift.', 7 from public.modules where code='M11' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M11.08', 'Interne bedrading aanbrengen', 'Bedraadt correct, netjes, met passende doorsnede en adereindhulzen.', 8 from public.modules where code='M11' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M11.09', 'Groepen en componenten labelen', 'Maakt een begrijpelijke en volledige groepsverklaring.', 9 from public.modules where code='M11' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M11.10', 'Visuele en mechanische controle uitvoeren', 'Controleert aandraaimoment, blank koper, kleurgebruik en netheid.', 10 from public.modules where code='M11' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M11.11', 'Metingen en functionele test uitvoeren', 'Voert vereiste basiscontroles uit voor ingebruikname.', 11 from public.modules where code='M11' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M11.12', 'Overspanningsbeveiliging herkennen', 'Benoemt functie en basisplaatsing van SPD-componenten.', 12 from public.modules where code='M11' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M11.13', 'Belasting en leidinglengte beoordelen', 'Houdt rekening met beveiliging, doorsnede, spanningsval en toepassing.', 13 from public.modules where code='M11' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;

insert into public.modules (code, title, description, order_index) values ('M12', '12. Bel- en deuropenerinstallaties', 'Laagspanningsbel, transformator, drukker en deuropener aansluiten en storingen zoeken.', 12) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M12.01', 'Onderdelen van belinstallatie herkennen', 'Herkent beltrafo, drukker, gong, voeding en bekabeling.', 1 from public.modules where code='M12' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M12.02', 'Beltransformator veilig aansluiten', 'Sluit primaire en secundaire zijde correct en gescheiden aan.', 2 from public.modules where code='M12' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M12.03', 'Beldrukker en signaalgever aansluiten', 'Realiseert een eenvoudige belkring.', 3 from public.modules where code='M12' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M12.04', 'Deuropener aansluiten', 'Sluit deuropener en bediening volgens schema aan.', 4 from public.modules where code='M12' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M12.05', 'Spanning en signaal meten', 'Meet laagspanning en controleert onderbrekingen.', 5 from public.modules where code='M12' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M12.06', 'Storing systematisch opsporen', 'Controleert voeding, drukker, verbindingen en eindcomponent.', 6 from public.modules where code='M12' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M12.07', 'Installatie testen en uitleg geven', 'Test bereik en werking en informeert gebruiker.', 7 from public.modules where code='M12' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;

insert into public.modules (code, title, description, order_index) values ('M13', '13. UTP en data', 'Databekabeling kiezen, aanleggen, afmonteren en testen.', 13) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M13.01', 'UTP/STP en categorieën herkennen', 'Herkent Cat5e, Cat6, Cat6a en afscherming.', 1 from public.modules where code='M13' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M13.02', 'Passende kabel kiezen', 'Kiest op basis van snelheid, afstand en omgeving.', 2 from public.modules where code='M13' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M13.03', 'Datakabel correct aanleggen', 'Voorkomt knikken, beschadiging en ongewenste nabijheid van vermogenskabels.', 3 from public.modules where code='M13' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M13.04', 'T568A en T568B herkennen', 'Kent aderparen en past één gekozen standaard consequent toe.', 4 from public.modules where code='M13' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M13.05', 'RJ45-connector afmonteren', 'Stript, ordent en krimpt zonder aderparen onnodig te ontwisten.', 5 from public.modules where code='M13' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M13.06', 'Wandcontactdoos of patchpanel afmonteren', 'Monteert aderparen volgens kleurcode en fabrikantvoorschrift.', 6 from public.modules where code='M13' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M13.07', 'UTP-kabel testen', 'Controleert continuïteit, aderparen en foutmeldingen.', 7 from public.modules where code='M13' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M13.08', 'Meetresultaat registreren', 'Legt locatie, poort en testresultaat duidelijk vast.', 8 from public.modules where code='M13' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;

insert into public.modules (code, title, description, order_index) values ('M14', '14. Relais- en schakelingen', 'Relais, spoel, contacten en gestuurde vermogenskringen begrijpen en aansluiten.', 14) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M14.01', 'Doel en werking van een relais uitleggen', 'Legt uit hoe een stuurkring een gescheiden contact bedient.', 1 from public.modules where code='M14' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M14.02', 'Spoelspanning herkennen', 'Selecteert en sluit een passende AC- of DC-spoel aan.', 2 from public.modules where code='M14' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M14.03', 'NO-, NC- en wisselcontact herkennen', 'Leest contactaanduidingen en bepaalt rust- en werkstand.', 3 from public.modules where code='M14' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M14.04', 'Potentiaalvrij contact toepassen', 'Gebruikt een relaiscontact zonder ongewenste elektrische koppeling.', 4 from public.modules where code='M14' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M14.05', 'Stuur- en hoofdstroomkring lezen', 'Volgt schema en onderscheidt besturing van belasting.', 5 from public.modules where code='M14' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M14.06', 'Relais schakeling opbouwen', 'Bedraadt spoel en contacten correct volgens schema.', 6 from public.modules where code='M14' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M14.07', 'Tijdklok of schemerschakelaar als sturing toepassen', 'Stuurt een grotere belasting via relais of contactor.', 7 from public.modules where code='M14' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M14.08', 'Relaiscontact op schakelvermogen beoordelen', 'Voorkomt overbelasting van tijdklok, relais of stuurcomponent.', 8 from public.modules where code='M14' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M14.09', 'Relaisstoring meten en analyseren', 'Controleert stuurspanning, spoel en contactovergang.', 9 from public.modules where code='M14' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.module_items (module_id, code, title, description, order_index) select id, 'M14.10', 'Schakeling testen en veilig opleveren', 'Controleert logica, scheiding, beveiliging en werking.', 10 from public.modules where code='M14' on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;

-- SOFT-SKILL COMPETENTIES
insert into public.competencies (code, title, description, order_index) values ('C01', 'Veiligheidsbewustzijn', 'Herkent risico’s, voert een LMRA uit en kiest steeds voor een veilige werkwijze.', 1) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.competencies (code, title, description, order_index) values ('C02', 'Leervermogen', 'Neemt uitleg op, stelt vragen en past nieuwe kennis zichtbaar toe.', 2) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.competencies (code, title, description, order_index) values ('C03', 'Zelfstandigheid', 'Voert passende werkzaamheden uit zonder voortdurende aansturing.', 3) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.competencies (code, title, description, order_index) values ('C04', 'Nauwkeurigheid en kwaliteit', 'Werkt netjes, controleert eigen werk en voorkomt herstelwerk.', 4) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.competencies (code, title, description, order_index) values ('C05', 'Probleemoplossend vermogen', 'Analyseert storingen stap voor stap en kiest een logische vervolgstap.', 5) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.competencies (code, title, description, order_index) values ('C06', 'Samenwerken', 'Werkt constructief samen, stemt af en helpt collega’s waar passend.', 6) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.competencies (code, title, description, order_index) values ('C07', 'Communicatieve vaardigheden', 'Communiceert duidelijk met collega’s, klanten en leidinggevenden.', 7) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.competencies (code, title, description, order_index) values ('C08', 'Plannen en organiseren', 'Bereidt werk, materialen, volgorde en tijd realistisch voor.', 8) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.competencies (code, title, description, order_index) values ('C09', 'Verantwoordelijkheidsgevoel', 'Neemt eigenaarschap voor veiligheid, kwaliteit, afspraken en resultaat.', 9) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.competencies (code, title, description, order_index) values ('C10', 'Initiatief tonen', 'Ziet werk, denkt vooruit en vraagt tijdig om passende vervolgopdrachten.', 10) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.competencies (code, title, description, order_index) values ('C11', 'Klantgerichtheid', 'Gaat respectvol om met bewoners en klanten en houdt rekening met de omgeving.', 11) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.competencies (code, title, description, order_index) values ('C12', 'Professionele werkhouding', 'Toont inzet, verzorgd gedrag, discipline en respect voor mensen en middelen.', 12) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.competencies (code, title, description, order_index) values ('C13', 'Afspraken en tijd nakomen', 'Komt op tijd, houdt zich aan afspraken en meldt afwijkingen vroegtijdig.', 13) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.competencies (code, title, description, order_index) values ('C14', 'Omgaan met feedback', 'Luistert naar feedback, reageert professioneel en laat verbetering zien.', 14) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;
insert into public.competencies (code, title, description, order_index) values ('C15', 'Administratieve discipline', 'Vult werkbonnen en registraties volledig, juist en tijdig in.', 15) on conflict (code) do update set title=excluded.title, description=excluded.description, order_index=excluded.order_index, active=true;

-- Na uitvoering: maak het eerste beheeraccount admin. Vervang het e-mailadres hieronder.
-- update public.profiles set role = 'admin', full_name = 'Naam beheerder', branch = 'Amsterdam' where email = 'jouw-email@hacar.nl';
