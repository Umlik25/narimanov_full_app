import { ArrowLeft, MapPin, Clock, MessageSquare, Camera, Map, Ticket } from "lucide-react";
import { Issue, STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, CATEGORY_LABELS } from "./mockData";
import { CategoryIcon } from "./CategoryIcon";

interface Props {
  issue: Issue;
  onBack: () => void;
}

export function UserReportDetails({ issue, onBack }: Props) {
  return (
    <div className="flex flex-col h-full bg-[#F5F7FB]">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #08122D 0%, #0B5CFF 100%)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-base" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
              Report Details
            </h1>
            <p className="text-white/60 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{issue.id}</p>
          </div>
          <span
            className="ml-auto px-3 py-1 rounded-full text-white text-xs"
            style={{ background: STATUS_COLORS[issue.status], fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            {STATUS_LABELS[issue.status]}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Photo */}
        <div className="h-48 bg-gray-200">
          <img src={issue.photo} alt={issue.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/icon.png"; }} />
        </div>

        <div className="px-5 py-5">
          {/* Title & badges */}
          <h2 className="text-[#08122D] mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '18px' }}>
            {issue.title}
          </h2>
          <div className="flex gap-2 flex-wrap mb-4">
            <span className="px-3 py-1 rounded-full text-white text-xs" style={{ background: PRIORITY_COLORS[issue.priority], fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              {PRIORITY_LABELS[issue.priority]} Priority
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              <CategoryIcon category={issue.category} size={13} />
              {CATEGORY_LABELS[issue.category]}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
              <Ticket size={12} />
              +{issue.rewardPoints} pts reward
            </span>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <p className="text-gray-500 text-xs mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>DESCRIPTION</p>
            <p className="text-[#08122D] text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{issue.description}</p>
          </div>

          {/* Info grid */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            {[
              { icon: <MapPin size={15} />, label: 'Location', value: issue.location },
              { icon: <Clock size={15} />, label: 'Reported', value: issue.reportedAt },
              ...(issue.deadline ? [{ icon: null, label: 'Deadline', value: issue.deadline }] : []),
              { icon: <Ticket size={15} />, label: 'Reward', value: `+${issue.rewardPoints} points when accepted` },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2 text-gray-500 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {icon && <span className="text-gray-400">{icon}</span>}
                  {label}
                </div>
                <span className="text-[#08122D] text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
            <p className="text-gray-500 text-xs mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>TIMELINE</p>
            <div className="relative pl-5">
              <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-200" />
              {issue.timeline.map((event, i) => (
                <div key={i} className="relative mb-4 last:mb-0">
                  <div
                    className="absolute -left-[17px] top-1 w-3 h-3 rounded-full border-2 border-white"
                    style={{ background: i === issue.timeline.length - 1 ? '#0B5CFF' : '#D1D5DB' }}
                  />
                  <p className="text-[#08122D] text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    {event.action}
                  </p>
                  <p className="text-gray-400 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {event.time} · {event.by}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-gray-200 text-[#08122D] text-sm shadow-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              <MessageSquare size={16} /> Comment
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-gray-200 text-[#08122D] text-sm shadow-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              <Camera size={16} /> Photo
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-gray-200 text-[#08122D] text-sm shadow-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              <Map size={16} /> Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
