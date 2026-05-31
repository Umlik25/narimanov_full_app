import { ArrowLeft, MapPin, Clock, User, Bot, Calendar, CheckCircle, XCircle, Play, RotateCcw } from "lucide-react";
import { Issue, STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, CATEGORY_ICONS, CATEGORY_LABELS } from "./mockData";

interface Props {
  issue: Issue;
  onBack: () => void;
}

export function AdminIssueDetails({ issue, onBack }: Props) {
  return (
    <div className="flex flex-col h-full bg-[#F5F7FB]">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #08122D 0%, #7C3AED 100%)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-base" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
              Issue Management
            </h1>
            <p className="text-white/60 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{issue.id}</p>
          </div>
          {issue.source === 'ai' && (
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
              <Bot size={13} className="text-white" />
              <span className="text-white text-xs" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>AI Detected</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Photo */}
        <div className="h-48 bg-gray-200">
          <img src={issue.photo} alt={issue.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1706660143732-c1d14701114e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"; }} />
        </div>

        <div className="px-5 py-5">
          <h2 className="text-[#08122D] mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '18px' }}>
            {issue.title}
          </h2>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap mb-4">
            <span className="px-3 py-1 rounded-full text-white text-xs" style={{ background: STATUS_COLORS[issue.status], fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              {STATUS_LABELS[issue.status]}
            </span>
            <span className="px-3 py-1 rounded-full text-white text-xs" style={{ background: PRIORITY_COLORS[issue.priority], fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              {PRIORITY_LABELS[issue.priority]}
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              {CATEGORY_ICONS[issue.category]} {CATEGORY_LABELS[issue.category]}
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs"
              style={{
                background: issue.source === 'ai' ? '#EDE9FE' : '#F0FDF4',
                color: issue.source === 'ai' ? '#7C3AED' : '#16A34A',
                fontFamily: 'Inter, sans-serif', fontWeight: 600,
              }}
            >
              Source: {issue.source === 'ai' ? 'AI Detection' : 'User Report'}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <p className="text-gray-500 text-xs mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>DESCRIPTION</p>
            <p className="text-[#08122D] text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{issue.description}</p>
          </div>

          {/* Info */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            {[
              { icon: <MapPin size={15} />, label: 'Location', value: issue.location },
              { icon: <Clock size={15} />, label: 'Reported', value: issue.reportedAt },
              { icon: <User size={15} />, label: 'Reported by', value: issue.reportedBy },
              ...(issue.assignedTo ? [{ icon: <User size={15} />, label: 'Assigned to', value: issue.assignedTo }] : []),
              ...(issue.deadline ? [{ icon: <Calendar size={15} />, label: 'Deadline', value: issue.deadline }] : []),
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2 text-gray-500 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <span className="text-gray-400">{icon}</span>
                  {label}
                </div>
                <span className="text-[#08122D] text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Admin actions */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <p className="text-gray-500 text-xs mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>ASSIGN DEPARTMENT</p>
            <div className="flex flex-col gap-2">
              {['Road Repair Department', 'Electricity Department', 'Sanitation Department', 'Infrastructure Department'].map(dept => (
                <button
                  key={dept}
                  className="flex items-center justify-between py-3 px-4 rounded-xl border border-gray-200 text-left"
                  style={{
                    background: issue.assignedTo === dept ? '#EEF3FF' : 'white',
                    borderColor: issue.assignedTo === dept ? '#0B5CFF' : '#E5E7EB',
                  }}
                >
                  <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: issue.assignedTo === dept ? 600 : 400, color: issue.assignedTo === dept ? '#0B5CFF' : '#08122D' }}>
                    {dept}
                  </span>
                  {issue.assignedTo === dept && <CheckCircle size={16} className="text-[#0B5CFF]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
            <p className="text-gray-500 text-xs mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>AUDIT TRAIL</p>
            <div className="relative pl-5">
              <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-200" />
              {issue.timeline.map((event, i) => (
                <div key={i} className="relative mb-4 last:mb-0">
                  <div className="absolute -left-[17px] top-1 w-3 h-3 rounded-full border-2 border-white"
                    style={{ background: i === issue.timeline.length - 1 ? '#7C3AED' : '#D1D5DB' }} />
                  <p className="text-[#08122D] text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{event.action}</p>
                  <p className="text-gray-400 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{event.time} · {event.by}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white" style={{ background: '#F97316', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              <User size={16} /> Assign
            </button>
            <button className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white" style={{ background: '#0B5CFF', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              <Play size={16} /> Start
            </button>
            <button className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white" style={{ background: '#16A34A', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              <CheckCircle size={16} /> Resolve
            </button>
            <button className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white" style={{ background: '#E53935', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              <XCircle size={16} /> Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
