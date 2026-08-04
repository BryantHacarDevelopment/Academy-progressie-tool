import { supabase } from '../supabaseClient';
import { average, roundOne } from './format';

function requireSupabase() {
  if (!supabase) {
    throw new Error('De verbinding met Supabase is niet beschikbaar.');
  }
  return supabase;
}

export async function getCurrentProfile(userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, role, branch, active')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;

if (!data) return null;

return {
  ...data,
  role: String(data.role || '').trim().toLowerCase(),
};
}

export async function listProfiles() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, email, role, branch, active, created_at')
    .order('full_name');

  if (error) throw error;
  return data ?? [];
}

export async function updateProfile(profileId, values) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .update(values)
    .eq('id', profileId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createUserAccount(payload) {
  const client = requireSupabase();
  const { data, error } = await client.functions.invoke('admin-create-user', {
    body: payload,
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function listModules() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('modules')
    .select('id, code, title, description, order_index, module_items(id, code, title, description, order_index)')
    .order('order_index', { ascending: true })
    .order('order_index', { foreignTable: 'module_items', ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function listCompetencies() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('competencies')
    .select('id, code, title, description, order_index')
    .order('order_index');

  if (error) throw error;
  return data ?? [];
}

export async function listVisibleStudents() {
  const client = requireSupabase();

  const [studentsResult, assignmentsResult, itemProgressResult, competencyProgressResult] = await Promise.all([
    client
      .from('students')
      .select('*')
      .eq('active', true)
      .order('full_name'),
    client
      .from('student_assignments')
      .select('student_id, assignment_role, profile:profiles!student_assignments_profile_id_fkey(id, full_name, role, branch)'),
    client
      .from('student_item_progress')
      .select('student_id, score, updated_at'),
    client
      .from('student_competency_progress')
      .select('student_id, score, updated_at'),
  ]);

  if (studentsResult.error) throw studentsResult.error;
  if (assignmentsResult.error) throw assignmentsResult.error;
  if (itemProgressResult.error) throw itemProgressResult.error;
  if (competencyProgressResult.error) throw competencyProgressResult.error;

  const assignments = assignmentsResult.data ?? [];
  const itemProgress = itemProgressResult.data ?? [];
  const competencyProgress = competencyProgressResult.data ?? [];

  return (studentsResult.data ?? []).map((student) => {
    const studentAssignments = assignments.filter((assignment) => assignment.student_id === student.id);
    const teachers = studentAssignments
      .filter((assignment) => assignment.assignment_role === 'teacher')
      .map((assignment) => assignment.profile)
      .filter(Boolean);
    const managers = studentAssignments
      .filter((assignment) => assignment.assignment_role === 'manager')
      .map((assignment) => assignment.profile)
      .filter(Boolean);

    const studentItemProgress = itemProgress.filter((entry) => entry.student_id === student.id);
    const studentCompetencyProgress = competencyProgress.filter((entry) => entry.student_id === student.id);
    const latestDates = [
      ...studentItemProgress.map((entry) => entry.updated_at),
      ...studentCompetencyProgress.map((entry) => entry.updated_at),
    ].filter(Boolean).sort();

    return {
      ...student,
      teachers,
      managers,
      teacherNames: teachers.map((profile) => profile.full_name).join(', ') || 'Niet toegewezen',
      managerNames: managers.map((profile) => profile.full_name).join(', ') || 'Niet toegewezen',
      technicalAverage: roundOne(average(studentItemProgress.map((entry) => entry.score))),
      competencyAverage: roundOne(average(studentCompetencyProgress.map((entry) => entry.score))),
      lastUpdated: latestDates.at(-1) ?? student.updated_at ?? student.created_at,
      assessedItemCount: studentItemProgress.length,
      assessedCompetencyCount: studentCompetencyProgress.length,
    };
  });
}

export async function getStudentDetail(studentId) {
  const client = requireSupabase();

  const [
    studentResult,
    modulesResult,
    competenciesResult,
    itemProgressResult,
    competencyProgressResult,
    moduleNotesResult,
    itemNotesResult,
    reportsResult,
  ] = await Promise.all([
    client.from('students').select('*').eq('id', studentId).single(),
    listModules(),
    listCompetencies(),
    client
      .from('student_item_progress')
      .select('*')
      .eq('student_id', studentId),
    client
      .from('student_competency_progress')
      .select('*')
      .eq('student_id', studentId),
    client
      .from('student_module_notes')
      .select('*, author:profiles!student_module_notes_created_by_fkey(full_name, role)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false }),
    client
      .from('student_item_notes')
      .select('*, author:profiles!student_item_notes_created_by_fkey(full_name, role)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false }),
    client
      .from('monthly_reports')
      .select('*, author:profiles!monthly_reports_created_by_fkey(full_name), monthly_item_snapshots(*), monthly_competency_snapshots(*)')
      .eq('student_id', studentId)
      .order('report_month', { ascending: false }),
  ]);

  if (studentResult.error) throw studentResult.error;
  if (itemProgressResult.error) throw itemProgressResult.error;
  if (competencyProgressResult.error) throw competencyProgressResult.error;
  if (moduleNotesResult.error) throw moduleNotesResult.error;
  if (itemNotesResult.error) throw itemNotesResult.error;
  if (reportsResult.error) throw reportsResult.error;

  const assignmentsResult = await client
    .from('student_assignments')
    .select('assignment_role, profile:profiles!student_assignments_profile_id_fkey(id, full_name, role, branch)')
    .eq('student_id', studentId);

  if (assignmentsResult.error) throw assignmentsResult.error;

  return {
    student: studentResult.data,
    modules: modulesResult,
    competencies: competenciesResult,
    itemProgress: itemProgressResult.data ?? [],
    competencyProgress: competencyProgressResult.data ?? [],
    moduleNotes: moduleNotesResult.data ?? [],
    itemNotes: itemNotesResult.data ?? [],
    reports: reportsResult.data ?? [],
    assignments: assignmentsResult.data ?? [],
  };
}

export async function saveItemProgress(studentId, entries, userId) {
  if (!entries.length) return [];
  const client = requireSupabase();
  const rows = entries.map((entry) => ({
    student_id: studentId,
    module_item_id: entry.moduleItemId,
    score: entry.score,
    comment: entry.comment?.trim() || null,
    updated_by: userId,
  }));

  const { data, error } = await client
    .from('student_item_progress')
    .upsert(rows, { onConflict: 'student_id,module_item_id' })
    .select();

  if (error) throw error;
  return data ?? [];
}

export async function saveCompetencyProgress(studentId, entries, userId) {
  if (!entries.length) return [];
  const client = requireSupabase();
  const rows = entries.map((entry) => ({
    student_id: studentId,
    competency_id: entry.competencyId,
    score: entry.score,
    comment: entry.comment?.trim() || null,
    updated_by: userId,
  }));

  const { data, error } = await client
    .from('student_competency_progress')
    .upsert(rows, { onConflict: 'student_id,competency_id' })
    .select();

  if (error) throw error;
  return data ?? [];
}

export async function addModuleNote(studentId, moduleId, body, userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('student_module_notes')
    .insert({
      student_id: studentId,
      module_id: moduleId,
      body: body.trim(),
      created_by: userId,
    })
    .select('*, author:profiles!student_module_notes_created_by_fkey(full_name, role)')
    .single();

  if (error) throw error;
  return data;
}

export async function addItemNote(studentId, moduleItemId, body, userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('student_item_notes')
    .insert({
      student_id: studentId,
      module_item_id: moduleItemId,
      body: body.trim(),
      created_by: userId,
    })
    .select('*, author:profiles!student_item_notes_created_by_fkey(full_name, role)')
    .single();

  if (error) throw error;
  return data;
}

export async function createMonthlyReport({ studentId, month, summary, status }) {
  const client = requireSupabase();
  const { data, error } = await client.rpc('create_monthly_report', {
    p_student_id: studentId,
    p_report_month: month,
    p_summary: summary?.trim() || null,
    p_status: status,
  });

  if (error) throw error;
  return data;
}

export async function saveStudent({ student, managerIds, teacherIds, currentUserId }) {
  const client = requireSupabase();
  let savedStudent;

  const values = {
    full_name: student.full_name.trim(),
    branch: student.branch,
    start_date: student.start_date || null,
    expected_end_date: student.expected_end_date || null,
    status: student.status,
    photo_url: student.photo_url?.trim() || null,
    active: student.active ?? true,
  };

  if (student.id) {
    const { data, error } = await client
      .from('students')
      .update(values)
      .eq('id', student.id)
      .select()
      .single();
    if (error) throw error;
    savedStudent = data;
  } else {
    const { data, error } = await client
      .from('students')
      .insert({ ...values, created_by: currentUserId })
      .select()
      .single();
    if (error) throw error;
    savedStudent = data;
  }

  const { error: deleteError } = await client
    .from('student_assignments')
    .delete()
    .eq('student_id', savedStudent.id);
  if (deleteError) throw deleteError;

  const assignments = [
    ...teacherIds.map((profileId) => ({
      student_id: savedStudent.id,
      profile_id: profileId,
      assignment_role: 'teacher',
    })),
    ...managerIds.map((profileId) => ({
      student_id: savedStudent.id,
      profile_id: profileId,
      assignment_role: 'manager',
    })),
  ];

  if (assignments.length > 0) {
    const { error: assignmentError } = await client
      .from('student_assignments')
      .insert(assignments);
    if (assignmentError) throw assignmentError;
  }

  return savedStudent;
}

export async function archiveStudent(studentId) {
  const client = requireSupabase();
  const { error } = await client
    .from('students')
    .update({ active: false })
    .eq('id', studentId);

  if (error) throw error;
}

export async function getAnalyticsData() {
  const client = requireSupabase();

  const [students, modules, itemProgress, competencies, competencyProgress, reports] = await Promise.all([
    listVisibleStudents(),
    listModules(),
    client.from('student_item_progress').select('*'),
    listCompetencies(),
    client.from('student_competency_progress').select('*'),
    client.from('monthly_reports').select('id, student_id, report_month, status, summary, created_at').order('report_month'),
  ]);

  if (itemProgress.error) throw itemProgress.error;
  if (competencyProgress.error) throw competencyProgress.error;
  if (reports.error) throw reports.error;

  return {
    students,
    modules,
    itemProgress: itemProgress.data ?? [],
    competencies,
    competencyProgress: competencyProgress.data ?? [],
    reports: reports.data ?? [],
  };
}
