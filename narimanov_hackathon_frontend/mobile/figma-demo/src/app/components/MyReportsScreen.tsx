import { ArrowLeft, Menu, MapPin, Ticket } from "lucide-react";
import { motion } from "motion/react";
import { mockMyIssues, mockIssues, Issue, STATUS_COLORS, STATUS_LABELS, CATEGORY_ICONS, CATEGORY_LABELS } from "./mockData";

const TAP = { scale: 0.97 };

interface Props {
  onBack: () => void;
  onViewDetails: (issue: Issue) => void;
  onMenu: () => void;
}

export function MyReportsScreen({ onBack, onViewDetails, onMenu }: Props) {
  const issues = [...mockMyIssues, ...mockIssues.slice(0, 2)];

  return (
    <div className="flex flex-col h-full bg-[#F5F7FB]">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #08122D 0%, #0B5CFF 100%)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.button whileTap={TAP} onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </motion.button>
            <h1 className="text-white text-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
              My Reports
            </h1>
          </div>
          <motion.button whileTap={TAP} onClick={onMenu} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <Menu size={18} className="text-white" />
          </motion.button>
        </div>

        {/* Stats row */}
        <div className="flex gap-3">
          {[
            { label: 'Total', value: issues.length, color: 'white' },
            { label: 'In Progress', value: 2, color: '#F97316' },
            { label: 'Resolved', value: 1, color: '#16A34A' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex-1 bg-white/15 rounded-2xl px-3 py-2.5 text-center">
              <p className="text-white text-xl" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color }}>{value}</p>
              <p className="text-white/70 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-3">
          {issues.map((issue, i) => (
            <motion.button
              key={issue.id}
              onClick={() => onViewDetails(issue)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white rounded-2xl overflow-hidden shadow-sm text-left"
            >
              <div className="flex">
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100">
                  <img src={issue.photo} alt={issue.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1706660143732-c1d14701114e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"; }} />
                </div>
                <div className="flex-1 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      {issue.id}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full text-white"
                      style={{ background: STATUS_COLORS[issue.status], fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                    >
                      {STATUS_LABELS[issue.status]}
                    </span>
                  </div>
                  <p className="text-[#08122D] text-sm leading-tight mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    {issue.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-1.5">
                    <MapPin size={11} />
                    <span style={{ fontFamily: 'Inter, sans-serif' }}>{issue.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {issue.reportedAt}
                    </span>
                    <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {CATEGORY_ICONS[issue.category]} {CATEGORY_LABELS[issue.category]}
                    </span>
                  </div>
                  <div
                    className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-[11px]"
                    style={{ background: '#ECFDF3', color: '#16A34A', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
                  >
                    <Ticket size={11} />
                    Earn +{issue.rewardPoints} pts
                  </div>
                </div>
              </div>
              <div
                className="mx-3 mb-3 py-2 rounded-xl text-center text-xs"
                style={{
                  background: '#EEF3FF',
                  color: '#0B5CFF',
                  fontFamily: 'Inter, sans-serif', fontWeight: 600,
                }}
              >
                Track Progress →
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
