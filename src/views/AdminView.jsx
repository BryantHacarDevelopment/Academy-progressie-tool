import React, { useEffect, useMemo, useState } from 'react';
import { Archive, Plus, RefreshCw, Save, UserPlus, Users } from 'lucide-react';
import { BRANCHES, ROLE_LABELS, STUDENT_STATUS_OPTIONS } from '../constants';
import {
  archiveStudent,
  createUserAccount,
  listProfiles,
  listVisibleStudents,
  saveStudent,
  updateProfile,
} from '../lib/api';
import ErrorPanel from '../components/ErrorPanel';
import LoadingPanel from '../components/LoadingPanel';
import StatusBadge from '../components/StatusBadge';

const emptyStudent = {
  id: null,
  full_name: '',
  branch: 'Amsterdam',
  start_date: '',
  expected_end_date: '',
  status: 'op_schema',
  photo_url: '',
  active: true,
};

const emptyUser = {
  fullName: '',
  email: '',
  password: '',
  role: 'manager',
  branch: 'Amsterdam',
};

export default function AdminView({ profile }) {
  const [tab, setTab] = useState('students');
  const [profiles, setProfiles] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [managerIds, setManagerIds] = useState([]);
  const [teacherIds, setTeacherIds] = useState([]);
  const [userForm, setUserForm] = useState(emptyUser);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [profileRows, studentRows] = await Promise.all([listProfiles(), listVisibleStudents()]);
      setProfiles(profileRows);
      setStudents(studentRows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Onbekende fout.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const managers = useMemo(() => profiles.filter((item) => item.role === 'manager' && item.active), [profiles]);
  const teachers = useMemo(() => profiles.filter((item) => item.role === 'teacher' && item.active), [profiles]);

  function editStudent(student) {
    setStudentForm({
      id: student.id,
      full_name: student.full_name,
      branch: student.branch,
      start_date: student.start_date ?? '',
      expected_end_date: student.expected_end_date ?? '',
      status: student.status,
      photo_url: student.photo_url ?? '',
      active: student.active,
    });
    setManagerIds(student.managers.map((item) => item.id));
    setTeacherIds(student.teachers.map((item) => item.id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetStudentForm() {
    setStudentForm(emptyStudent);
    setManagerIds([]);
    setTeacherIds([]);
  }

  async function handleSaveStudent(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await saveStudent({ student: studentForm, managerIds, teacherIds, currentUserId: profile.id });
      setNotice(studentForm.id ? 'Leerling is bijgewerkt.' : 'Leerling is toegevoegd.');
      resetStudentForm();
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Opslaan mislukt.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(studentId) {
    if (!window.confirm('Deze leerling archiveren?')) return;
    try {
      await archiveStudent(studentId);
      await load();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Archiveren mislukt.');
    }
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await createUserAccount(userForm);
      setNotice('Gebruikersaccount is aangemaakt en direct bevestigd.');
      setUserForm(emptyUser);
      await load();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? `${createError.message}. Controleer ook of de Supabase Edge Function admin-create-user is gedeployed.`
          : 'Gebruiker aanmaken mislukt.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleProfileChange(profileId, field, value) {
    setError('');
    try {
      await updateProfile(profileId, { [field]: value });
      await load();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Gebruiker bijwerken mislukt.');
    }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><LoadingPanel text="Beheeromgeving wordt geladen..." /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap justify-between gap-3 items-end">
        <div><h1 className="text-2xl font-bold">Beheer</h1><p className="text-sm text-slate-500 mt-1">Beheer leerlingen, rollen, vestigingen en koppelingen.</p></div>
        <button type="button" onClick={load} className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Vernieuwen</button>
      </div>

      {error && <ErrorPanel message={error} />}
      {notice && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm font-medium">{notice}</div>}

      <div className="bg-white border border-slate-200 rounded-xl p-2 flex gap-1">
        <button type="button" onClick={() => setTab('students')} className={`px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 ${tab === 'students' ? 'bg-[#36563D] text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Users className="w-4 h-4" /> Leerlingen</button>
        <button type="button" onClick={() => setTab('users')} className={`px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 ${tab === 'users' ? 'bg-[#36563D] text-white' : 'text-slate-600 hover:bg-slate-50'}`}><UserPlus className="w-4 h-4" /> Gebruikers</button>
      </div>

      {tab === 'students' && (
        <div className="grid grid-cols-1 xl:grid-cols-[390px_1fr] gap-5 items-start">
          <form onSubmit={handleSaveStudent} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 xl:sticky xl:top-24">
            <div className="flex justify-between items-center"><h2 className="font-bold text-lg">{studentForm.id ? 'Leerling wijzigen' : 'Nieuwe leerling'}</h2>{studentForm.id && <button type="button" onClick={resetStudentForm} className="text-xs font-bold text-[#36563D]">Annuleren</button>}</div>
            <div><label className="label">Volledige naam</label><input required value={studentForm.full_name} onChange={(event) => setStudentForm((current) => ({ ...current, full_name: event.target.value }))} className="input" /></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="label">Vestiging</label><select value={studentForm.branch} onChange={(event) => setStudentForm((current) => ({ ...current, branch: event.target.value }))} className="input">{BRANCHES.map((branch) => <option key={branch}>{branch}</option>)}</select></div><div><label className="label">Status</label><select value={studentForm.status} onChange={(event) => setStudentForm((current) => ({ ...current, status: event.target.value }))} className="input">{STUDENT_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="label">Startdatum</label><input type="date" value={studentForm.start_date} onChange={(event) => setStudentForm((current) => ({ ...current, start_date: event.target.value }))} className="input" /></div><div><label className="label">Verwachte einddatum</label><input type="date" value={studentForm.expected_end_date} onChange={(event) => setStudentForm((current) => ({ ...current, expected_end_date: event.target.value }))} className="input" /></div></div>
            <div><label className="label">Docent(en)</label><select multiple value={teacherIds} onChange={(event) => setTeacherIds([...event.target.selectedOptions].map((option) => option.value))} className="input min-h-28">{teachers.map((item) => <option key={item.id} value={item.id}>{item.full_name} · {item.branch}</option>)}</select><p className="help">Gebruik Ctrl om meerdere personen te selecteren.</p></div>
            <div><label className="label">Manager(s)</label><select multiple value={managerIds} onChange={(event) => setManagerIds([...event.target.selectedOptions].map((option) => option.value))} className="input min-h-28">{managers.map((item) => <option key={item.id} value={item.id}>{item.full_name} · {item.branch}</option>)}</select></div>
            <button type="submit" disabled={saving} className="w-full bg-[#36563D] text-white rounded-lg px-4 py-3 font-bold text-sm flex justify-center items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> {saving ? 'Opslaan...' : 'Leerling opslaan'}</button>
          </form>

          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100"><h2 className="font-bold text-lg">Actieve leerlingen</h2></div>
            <div className="overflow-x-auto"><table className="w-full text-sm min-w-[820px]"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Naam</th><th className="px-4 py-3">Vestiging</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Docent</th><th className="px-4 py-3">Manager</th><th className="px-4 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{students.map((student) => <tr key={student.id}><td className="px-4 py-4 font-bold">{student.full_name}</td><td className="px-4 py-4">{student.branch}</td><td className="px-4 py-4"><StatusBadge status={student.status} /></td><td className="px-4 py-4">{student.teacherNames}</td><td className="px-4 py-4">{student.managerNames}</td><td className="px-4 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => editStudent(student)} className="text-[#36563D] font-bold">Wijzigen</button><button type="button" onClick={() => handleArchive(student.id)} className="text-red-600" title="Archiveren"><Archive className="w-4 h-4" /></button></div></td></tr>)}</tbody></table></div>
          </section>
        </div>
      )}

      {tab === 'users' && (
        <div className="grid grid-cols-1 xl:grid-cols-[390px_1fr] gap-5 items-start">
          <form onSubmit={handleCreateUser} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 xl:sticky xl:top-24">
            <h2 className="font-bold text-lg">Nieuw account</h2>
            <div><label className="label">Naam</label><input required value={userForm.fullName} onChange={(event) => setUserForm((current) => ({ ...current, fullName: event.target.value }))} className="input" /></div>
            <div><label className="label">E-mailadres</label><input required type="email" value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} className="input" /></div>
            <div><label className="label">Tijdelijk wachtwoord</label><input required minLength={8} type="password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} className="input" /><p className="help">Minimaal 8 tekens. Deel het wachtwoord veilig.</p></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="label">Rol</label><select value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))} className="input"><option value="manager">Manager</option><option value="teacher">Docent</option><option value="admin">Beheerder</option></select></div><div><label className="label">Vestiging</label><select value={userForm.branch} onChange={(event) => setUserForm((current) => ({ ...current, branch: event.target.value }))} className="input">{BRANCHES.map((branch) => <option key={branch}>{branch}</option>)}</select></div></div>
            <button type="submit" disabled={saving} className="w-full bg-[#36563D] text-white rounded-lg px-4 py-3 font-bold text-sm flex justify-center items-center gap-2 disabled:opacity-50"><Plus className="w-4 h-4" /> Account aanmaken</button>
          </form>

          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100"><h2 className="font-bold text-lg">Gebruikers en rollen</h2></div>
            <div className="overflow-x-auto"><table className="w-full text-sm min-w-[780px]"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Naam</th><th className="px-4 py-3">E-mail</th><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Vestiging</th><th className="px-4 py-3">Actief</th></tr></thead><tbody className="divide-y divide-slate-100">{profiles.map((item) => <tr key={item.id}><td className="px-4 py-4 font-bold">{item.full_name}</td><td className="px-4 py-4">{item.email}</td><td className="px-4 py-4"><select value={item.role} onChange={(event) => handleProfileChange(item.id, 'role', event.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5">{Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td><td className="px-4 py-4"><select value={item.branch ?? ''} onChange={(event) => handleProfileChange(item.id, 'branch', event.target.value || null)} className="rounded-lg border border-slate-200 px-2 py-1.5"><option value="">Geen</option>{BRANCHES.map((branch) => <option key={branch}>{branch}</option>)}</select></td><td className="px-4 py-4"><input type="checkbox" checked={item.active} onChange={(event) => handleProfileChange(item.id, 'active', event.target.checked)} /></td></tr>)}</tbody></table></div>
          </section>
        </div>
      )}
    </div>
  );
}
