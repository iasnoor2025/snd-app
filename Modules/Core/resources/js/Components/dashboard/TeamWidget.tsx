import React, { useMemo, useState } from 'react';

interface TeamMember {
  name: string;
  role: string;
  status: string;
  avatar?: string;
}

interface TeamWidgetProps {
  team: TeamMember[];
}

const statusColor = (status: string) => {
  if (status === 'Active') return 'bg-emerald-800 text-emerald-200';
  if (status === 'On Leave') return 'bg-yellow-800 text-yellow-200';
  return 'bg-cyan-800 text-cyan-200';
};

const roleColor = (role: string) => {
  if (role === 'Foreman') return 'text-blue-300';
  if (role === 'Engineer') return 'text-cyan-200';
  if (role === 'Laborer') return 'text-emerald-200';
  if (role === 'Safety Officer') return 'text-yellow-200';
  if (role === 'Electrician') return 'text-purple-200';
  return 'text-cyan-100';
};

const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

const uniqueRoles = (team: TeamMember[]) => Array.from(new Set(team.map((m) => m.role)));
const uniqueStatuses = (team: TeamMember[]) => Array.from(new Set(team.map((m) => m.status)));

const TeamWidget: React.FC<TeamWidgetProps> = ({ team }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    return team.filter((m) =>
      (!search || m.name.toLowerCase().includes(search.toLowerCase())) &&
      (!roleFilter || m.role === roleFilter) &&
      (!statusFilter || m.status === statusFilter)
    );
  }, [team, search, roleFilter, statusFilter]);

  // Grid for small teams
  if (team.length <= 10) {
    return (
      <div className="backdrop-blur-lg bg-white/10 border border-cyan-400/40 rounded-2xl shadow-xl p-6 flex flex-col items-start relative w-full" style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)' }}>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full blur-xl opacity-40" />
        <div className="mb-4 text-lg font-semibold text-cyan-100">Team</div>
        <div className="mb-4 flex gap-2 w-full">
          <input className="rounded bg-cyan-900/40 px-2 py-1 text-cyan-100 w-full" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="rounded bg-cyan-900/40 px-2 py-1 text-cyan-100" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {uniqueRoles(team).map(r => <option key={r}>{r}</option>)}
          </select>
          <select className="rounded bg-cyan-900/40 px-2 py-1 text-cyan-100" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            {uniqueStatuses(team).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {filtered.map((member, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-cyan-900/40 rounded-xl p-3 border border-cyan-700/30">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-cyan-700 flex items-center justify-center text-xl font-bold text-cyan-100">{getInitials(member.name)}</div>
              )}
              <div className="flex-1">
                <div className="text-white font-bold text-base mb-1">{member.name}</div>
                <div className={`text-sm mb-1 ${roleColor(member.role)}`}>{member.role}</div>
                <div className={`text-xs font-semibold ${statusColor(member.status)}`}>{member.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Table for large teams
  return (
    <div className="backdrop-blur-lg bg-white/10 border border-cyan-400/40 rounded-2xl shadow-xl p-6 flex flex-col items-start relative w-full overflow-x-auto" style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)' }}>
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full blur-xl opacity-40" />
      <div className="mb-4 text-lg font-semibold text-cyan-100">Team</div>
      <div className="mb-4 flex gap-2 w-full min-w-[600px]">
        <input className="rounded bg-cyan-900/40 px-2 py-1 text-cyan-100 w-full" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="rounded bg-cyan-900/40 px-2 py-1 text-cyan-100" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {uniqueRoles(team).map(r => <option key={r}>{r}</option>)}
        </select>
        <select className="rounded bg-cyan-900/40 px-2 py-1 text-cyan-100" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {uniqueStatuses(team).map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr>
            <th className="text-left text-xs text-cyan-200 font-semibold py-2">Avatar</th>
            <th className="text-left text-xs text-cyan-200 font-semibold py-2">Name</th>
            <th className="text-left text-xs text-cyan-200 font-semibold py-2">Role</th>
            <th className="text-left text-xs text-cyan-200 font-semibold py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((member, idx) => (
            <tr key={idx} className="border-b border-cyan-800/40">
              <td className="py-2">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center text-base font-bold text-cyan-100">{getInitials(member.name)}</div>
                )}
              </td>
              <td className="text-cyan-100 font-medium py-2">{member.name}</td>
              <td className={`py-2 ${roleColor(member.role)}`}>{member.role}</td>
              <td className={`py-2 ${statusColor(member.status)}`}>{member.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamWidget;
