export const SCORE_OPTIONS = [
  { value: 1, label: 'Onvoldoende', shortLabel: 'Onvoldoende' },
  { value: 2, label: 'Basis', shortLabel: 'Basis' },
  { value: 3, label: 'Voldoende met begeleiding', shortLabel: 'Voldoende' },
  { value: 4, label: 'Goed en grotendeels zelfstandig', shortLabel: 'Goed' },
  { value: 5, label: 'Zelfstandig en gevorderd', shortLabel: 'Zelfstandig' },
];

export const BRANCHES = ['Amsterdam', 'Utrecht', 'Moordrecht'];

export const STUDENT_STATUS_OPTIONS = [
  { value: 'op_schema', label: 'Op schema' },
  { value: 'loopt_voor', label: 'Loopt voor' },
  { value: 'aandacht_nodig', label: 'Aandacht nodig' },
  { value: 'gepauzeerd', label: 'Gepauzeerd' },
  { value: 'afgerond', label: 'Afgerond' },
];

export const ROLE_LABELS = {
  admin: 'Beheerder',
  teacher: 'Docent',
  manager: 'Manager',
};

export function scoreLabel(score) {
  return SCORE_OPTIONS.find((option) => option.value === Number(score))?.label ?? 'Niet beoordeeld';
}

export function statusLabel(status) {
  return STUDENT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status ?? 'Onbekend';
}
