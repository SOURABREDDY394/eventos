import { useState } from 'react';
import { useParams } from 'react-router';
import { DashboardLayout } from '@/components/DashboardLayout';
import store from '@/data/store';
import { CheckCircle, Clock, ClipboardList, Plus, Users, XCircle } from 'lucide-react';
import type { VolunteerApplication } from '@/types';

function statusClass(status: string) {
  if (status === 'approved' || status === 'completed') return 'bg-emerald-500/20 text-emerald-400';
  if (status === 'rejected') return 'bg-red-500/20 text-red-400';
  if (status === 'in_progress') return 'bg-blue-500/20 text-blue-400';
  return 'bg-amber-500/20 text-amber-400';
}

export default function EventVolunteers() {
  const { id } = useParams<{ id: string }>();
  const event = store.getEventById(id || '');
  const [version, setVersion] = useState(0);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskRole, setTaskRole] = useState('Registration Desk');
  const [taskStart, setTaskStart] = useState('');
  const [taskEnd, setTaskEnd] = useState('');
  const [taskHours, setTaskHours] = useState('');
  const [skillsEarned, setSkillsEarned] = useState('');
  const [assignTo, setAssignTo] = useState('');

  if (!event) return <DashboardLayout title="Volunteers"><p className="text-white/40">Event not found</p></DashboardLayout>;

  const applications = store.getEventVolunteerApplications(event.id);
  const tasks = store.getEventVolunteerTasks(event.id);
  const pendingApps = applications.filter(app => app.status === 'pending');
  const approvedApps = applications.filter(app => app.status === 'approved');
  const rejectedApps = applications.filter(app => app.status === 'rejected');

  const updateAppStatus = (appId: string, status: VolunteerApplication['status']) => {
    store.updateVolunteerApplication(appId, { status });
    setVersion(version + 1);
  };

  const openTaskForm = () => {
    if (showTaskForm) {
      setShowTaskForm(false);
      return;
    }

    const firstApproved = approvedApps[0];
    if (firstApproved) {
      const role = firstApproved.role_requested || firstApproved.role?.role_name || 'Volunteer';
      const skills = firstApproved.skills || [];
      setTaskTitle(`${role} Support`);
      setTaskDesc(`Support ${event.title} as ${role}.`);
      setTaskRole(role);
      setTaskHours('2');
      setSkillsEarned(skills.join(', '));
      setAssignTo(firstApproved.volunteer_id);
    }
    setShowTaskForm(true);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    store.createVolunteerTask({
      event_id: event.id,
      volunteer_id: assignTo,
      assigned_to: assignTo,
      title: taskTitle,
      description: taskDesc,
      task_role: taskRole,
      start_time: taskStart,
      end_time: taskEnd,
      status: 'assigned',
      hours: parseFloat(taskHours) || 0,
      skills_earned: skillsEarned.split(',').map(skill => skill.trim()).filter(Boolean),
      skills_gained: skillsEarned.split(',').map(skill => skill.trim()).filter(Boolean),
    });
    setShowTaskForm(false);
    setTaskTitle('');
    setTaskDesc('');
    setTaskRole('Registration Desk');
    setTaskStart('');
    setTaskEnd('');
    setTaskHours('');
    setSkillsEarned('');
    setAssignTo('');
    setVersion(version + 1);
  };

  const renderApplication = (app: VolunteerApplication, showActions = false) => (
    <div key={app.id} className="glass-card rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-purple-300">{app.volunteer?.full_name?.[0] || '?'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{app.volunteer?.full_name || 'Volunteer'}</p>
          <p className="text-xs text-white/35 mt-1">{app.role_requested || app.role?.role_name || 'General Volunteer'}</p>
          <p className="text-[10px] text-white/25 mt-1">Applied {new Date(app.applied_at).toLocaleDateString()}</p>
          {(app.skills || []).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {app.skills?.map(skill => <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300">{skill}</span>)}
            </div>
          )}
          {app.reason && <p className="text-xs text-white/35 mt-2">{app.reason}</p>}
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${statusClass(app.status)}`}>{app.status}</span>
      </div>
      {showActions && (
        <div className="flex gap-2 mt-4 ml-[52px]">
          <button onClick={() => updateAppStatus(app.id, 'approved')} className="text-xs px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Approve
          </button>
          <button onClick={() => updateAppStatus(app.id, 'rejected')} className="text-xs px-3 py-1.5 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout title="Volunteers">
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8">
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-white mb-3">Pending Applications ({pendingApps.length})</h2>
            {pendingApps.length === 0 ? (
              <div className="glass-card rounded-xl p-6 text-center"><p className="text-sm text-white/30">No pending volunteer applications</p></div>
            ) : (
              <div className="space-y-3">{pendingApps.map(app => renderApplication(app, true))}</div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-white mb-3">Approved Volunteers ({approvedApps.length})</h2>
            {approvedApps.length === 0 ? (
              <div className="glass-card rounded-xl p-6 text-center"><p className="text-sm text-white/30">No approved volunteers yet</p></div>
            ) : (
              <div className="space-y-3">{approvedApps.map(app => renderApplication(app))}</div>
            )}
          </section>

          {rejectedApps.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-white mb-3">Rejected Volunteers ({rejectedApps.length})</h2>
              <div className="space-y-3">{rejectedApps.map(app => renderApplication(app))}</div>
            </section>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Volunteer Tasks ({tasks.length})</h2>
            <button onClick={openTaskForm} className="text-[10px] px-2 py-1 rounded bg-[#E49B3A]/20 text-[#E49B3A] hover:bg-[#E49B3A]/30 transition-colors flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add Task
            </button>
          </div>

          {showTaskForm && (
            <form onSubmit={handleCreateTask} className="glass-card rounded-xl p-4 mb-4 space-y-3">
              <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required placeholder="Task title"
                className="w-full bg-white/5 border border-white/10 rounded py-2 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E49B3A]/50" />
              <input value={taskRole} onChange={e => setTaskRole(e.target.value)} required placeholder="Task role"
                className="w-full bg-white/5 border border-white/10 rounded py-2 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E49B3A]/50" />
              <textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Description" rows={3}
                className="w-full bg-white/5 border border-white/10 rounded py-2 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E49B3A]/50 resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <input value={taskStart} onChange={e => setTaskStart(e.target.value)} placeholder="Start time"
                  className="bg-white/5 border border-white/10 rounded py-2 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E49B3A]/50" />
                <input value={taskEnd} onChange={e => setTaskEnd(e.target.value)} placeholder="End time"
                  className="bg-white/5 border border-white/10 rounded py-2 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E49B3A]/50" />
              </div>
              <div className="grid grid-cols-[0.7fr_1.3fr] gap-2">
                <input type="number" value={taskHours} onChange={e => setTaskHours(e.target.value)} required placeholder="Hours"
                  className="bg-white/5 border border-white/10 rounded py-2 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E49B3A]/50" />
                <input value={skillsEarned} onChange={e => setSkillsEarned(e.target.value)} placeholder="Skills earned, comma separated"
                  className="bg-white/5 border border-white/10 rounded py-2 px-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E49B3A]/50" />
              </div>
              <select value={assignTo} onChange={e => setAssignTo(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-[#E49B3A]/50">
                <option value="" className="bg-[#1a1a1a]">Assign to approved volunteer</option>
                {approvedApps.map(app => (
                  <option key={app.id} value={app.volunteer_id} className="bg-[#1a1a1a]">
                    {app.volunteer?.full_name || app.volunteer_id} - {app.role_requested || 'Volunteer'}
                  </option>
                ))}
              </select>
              <button type="submit" className="gold-btn text-xs">Create Task</button>
            </form>
          )}

          {tasks.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <ClipboardList className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-sm text-white/30">No volunteer tasks yet. Approve a volunteer and assign the first task.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {['assigned', 'in_progress', 'completed'].map((status) => (
                <div key={status}>
                  <div className="flex items-center gap-1 mb-2">
                    {status === 'assigned' && <Clock className="w-3 h-3 text-amber-400" />}
                    {status === 'in_progress' && <Users className="w-3 h-3 text-blue-400" />}
                    {status === 'completed' && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                    <p className="text-[10px] font-medium text-white/50 uppercase">{status.replace('_', ' ')}</p>
                  </div>
                  <div className="space-y-2">
                    {tasks.filter(task => task.status === status).map((task) => (
                      <div key={task.id} className="glass-card rounded-lg p-2">
                        <p className="text-[11px] font-medium text-white">{task.title}</p>
                        <p className="text-[9px] text-white/30 mt-0.5">{task.task_role}</p>
                        {task.assignee && <p className="text-[9px] text-white/30 mt-0.5">{task.assignee.full_name}</p>}
                        {task.hours > 0 && <p className="text-[9px] text-white/20">{task.hours}h</p>}
                      </div>
                    ))}
                    {tasks.filter(task => task.status === status).length === 0 && <p className="text-[9px] text-white/20 text-center py-2">None</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
