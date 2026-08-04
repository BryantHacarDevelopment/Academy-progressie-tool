-- VERVANG hieronder alleen het e-mailadres en eventueel de naam/vestiging.
-- Gebruik hetzelfde e-mailadres als waarmee je inlogt.

update public.profiles
set
  full_name = 'Bryant van Dammen',
  role = 'admin',
  branch = 'Amsterdam',
  active = true
where lower(email) = lower('VUL-HIER-JE-E-MAILADRES-IN');

-- Controle: hieronder hoort daarna precies jouw profiel te verschijnen.
select id, full_name, email, role, branch, active
from public.profiles
where lower(email) = lower('VUL-HIER-JE-E-MAILADRES-IN');
