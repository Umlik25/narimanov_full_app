import { type ReactNode, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, RotateCcw, Ticket, User, X } from "lucide-react";
import { mockTasks, Task, PRIORITY_COLORS, PRIORITY_LABELS } from "./mockData";

interface Props {
  onBack: () => void;
}

const STATUS_META: Record<Task['status'], { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#F97316', bg: '#FFF7ED' },
  in_progress: { label: 'In Progress', color: '#0B5CFF', bg: '#EEF3FF' },
  completed: { label: 'Completed', color: '#16A34A', bg: '#F0FDF4' },
  overdue: { label: 'Overdue', color: '#E53935', bg: '#FEF2F2' },
};

export function AdminOperations({ onBack }: Props) {
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [reassignTask, setReassignTask] = useState<Task | null>(null);
  const [selectedTeam, setSelectedTeam] = useState('');

  const grouped = {
    overdue: tasks.filter(t => t.status === 'overdue'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    pending: tasks.filter(t => t.status === 'pending'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(current => current.map(task => task.id === id ? { ...task, ...updates } : task));
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F7FB]">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #08122D 0%, #F97316 100%)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-white text-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
            Operations & Tasks
          </h1>
        </div>

        {/* Stats */}
        <div className="flex gap-2">
          {[
            { label: 'Total', value: tasks.length },
            { label: 'Active', value: grouped.in_progress.length, color: '#fde68a' },
            { label: 'Overdue', value: grouped.overdue.length, color: '#fca5a5' },
            { label: 'Done', value: grouped.completed.length, color: '#86efac' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex-1 bg-white/15 rounded-2xl px-2 py-2.5 text-center">
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '18px', color: color || 'white' }}>{value}</p>
              <p className="text-white/70 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {(['overdue', 'in_progress', 'pending', 'completed'] as const).map(status => {
          const tasks = grouped[status];
          if (!tasks.length) return null;
          const meta = STATUS_META[status];
          return (
            <div key={status} className="mb-5">
              <p className="text-xs mb-2 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: meta.color }}>
                {meta.label} ({tasks.length})
              </p>
              <div className="flex flex-col gap-3">
                {tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    meta={meta}
                    onOpen={() => setSelectedTask(task)}
                    onReassign={() => {
                      setSelectedTeam(task.responsible);
                      setReassignTask(task);
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskSheet onClose={() => setSelectedTask(null)} title={selectedTask.title} subtitle={`${selectedTask.id} · ${selectedTask.department}`}>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              ['Status', STATUS_META[selectedTask.status].label],
              ['Team', selectedTask.responsible],
              ['Deadline', selectedTask.deadline],
              ['Progress', `${selectedTask.progress}%`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-gray-50 p-3 min-w-0">
                <p className="text-gray-500 text-[10px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>{label}</p>
                <p className="text-[#08122D] text-xs truncate mt-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 850 }}>{value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-[#F5F8FF] p-3 flex gap-2">
            <CheckCircle2 size={17} className="text-[#0B5CFF] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Task opened for review. Admins can move work forward or close it when field proof is ready.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              onClick={() => {
                updateTask(selectedTask.id, { status: 'in_progress', progress: Math.max(selectedTask.progress, 45) });
                setSelectedTask(null);
              }}
              className="rounded-2xl bg-[#EEF3FF] py-3 text-sm text-[#0B5CFF]"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 850 }}
            >
              Start
            </button>
            <button
              onClick={() => {
                updateTask(selectedTask.id, { status: 'completed', progress: 100 });
                setSelectedTask(null);
              }}
              className="rounded-2xl bg-[#16A34A] py-3 text-sm text-white"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 850 }}
            >
              Resolve
            </button>
          </div>
        </TaskSheet>
      )}

      {reassignTask && (
        <TaskSheet onClose={() => setReassignTask(null)} title="Reassign task" subtitle={reassignTask.title}>
          {['Road Team A', 'Lighting Crew', 'Sanitation Team B', 'Emergency Response', 'Public Works Crew'].map(team => {
            const active = selectedTeam === team;
            return (
              <button
                key={team}
                onClick={() => setSelectedTeam(team)}
                className="w-full flex items-center justify-between rounded-2xl px-3 py-3 mb-2"
                style={{ background: active ? '#EEF3FF' : '#F6F7FA', color: '#08122D', fontFamily: 'Inter, sans-serif', fontWeight: 800 }}
              >
                <span className="truncate">{team}</span>
                {active && <CheckCircle2 size={17} className="text-[#0B5CFF] flex-shrink-0" />}
              </button>
            );
          })}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button onClick={() => setReassignTask(null)} className="rounded-2xl bg-gray-100 py-3 text-sm text-[#08122D]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 850 }}>
              Discard
            </button>
            <button
              onClick={() => {
                updateTask(reassignTask.id, { responsible: selectedTeam || reassignTask.responsible });
                setReassignTask(null);
              }}
              className="rounded-2xl bg-[#0B5CFF] py-3 text-sm text-white"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 850 }}
            >
              Confirm
            </button>
          </div>
        </TaskSheet>
      )}
    </div>
  );
}

function TaskCard({ task, meta, onOpen, onReassign }: { task: Task; meta: { label: string; color: string; bg: string }; onOpen: () => void; onReassign: () => void }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 pr-2">
          <p className="text-[#08122D] text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>{task.title}</p>
          <p className="text-gray-400 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{task.id}</p>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-xs flex-shrink-0"
          style={{ background: meta.bg, color: meta.color, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
        >
          {meta.label}
        </span>
      </div>

      {/* Dept & Priority */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
          {task.department}
        </span>
        <span className="px-2.5 py-1 rounded-full text-white text-xs" style={{ background: PRIORITY_COLORS[task.priority], fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
          <Ticket size={11} />
          User +{task.rewardPoints} pts
        </span>
      </div>

      {/* Responsible & Deadline */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
          <User size={12} />
          {task.responsible}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
          <Clock size={12} />
          {task.deadline}
        </div>
      </div>

      {/* Progress bar */}
      {task.status !== 'completed' && (
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Progress</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: meta.color }}>{task.progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${task.progress}%`, background: meta.color }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button onClick={onOpen} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-[#08122D] text-xs" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          Open Task
        </button>
        <button onClick={onReassign} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-[#08122D] text-xs" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          <RotateCcw size={12} className="inline mr-1" />Reassign
        </button>
      </div>
    </div>
  );
}

function TaskSheet({ children, onClose, subtitle, title }: { children: ReactNode; onClose: () => void; subtitle: string; title: string }) {
  return (
    <div className="absolute inset-0 z-50 bg-[#08122D]/45 flex items-end px-4" onClick={onClose}>
      <div
        className="w-full rounded-3xl bg-white shadow-xl p-5"
        style={{ marginBottom: 'var(--cg-bottom-gap)', maxHeight: 'calc(100% - var(--cg-safe-top) - var(--cg-bottom-gap) - 24px)', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="text-[#08122D] text-base leading-tight" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900 }}>{title}</p>
            <p className="text-gray-500 text-xs mt-1 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{subtitle}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <X size={17} className="text-[#08122D]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
