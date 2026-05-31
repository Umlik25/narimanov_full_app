import { useMemo, useState } from "react";
import { ArrowLeft, Menu, MapPin, Ticket } from "lucide-react";
import { motion } from "motion/react";
import { Issue, STATUS_COLORS, STATUS_LABELS, CATEGORY_LABELS } from "./mockData";
import { CategoryIcon } from "./CategoryIcon";

const TAP = { scale: 0.97 };
type ReportFilter = 'active' | 'all' | 'closed';

interface Props {
  issues?: Issue[];
  onBack: () => void;
  onViewDetails: (issue: Issue) => void;
  onMenu: () => void;
}

export function MyReportsScreen({ issues: liveIssues, onBack, onViewDetails, onMenu }: Props) {
  const [filter, setFilter] = useState<ReportFilter>('active');
  const issues = useMemo(() => {
    return (liveIssues || [])
      .filter(issue => issue.source !== 'ai')
      .sort((a, b) => getIssueSortValue(b) - getIssueSortValue(a));
  }, [liveIssues]);
  const activeIssues = issues.filter(issue => !isClosedIssue(issue));
  const closedIssues = issues.filter(isClosedIssue);
  const visibleIssues = filter === 'all' ? issues : filter === 'closed' ? closedIssues : activeIssues;
  const inProgressCount = issues.filter(issue => issue.status === 'in_progress').length;
  const resolvedCount = issues.filter(issue => issue.status === 'resolved').length;

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
          <motion.button whileTap={TAP} onClick={onMenu} className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
            <Menu size={22} className="text-white" />
          </motion.button>
        </div>

        {/* Stats row */}
        <div className="flex gap-3">
          {[
            { label: 'Total', value: issues.length, color: 'white' },
            { label: 'In Progress', value: inProgressCount, color: '#F97316' },
            { label: 'Resolved', value: resolvedCount, color: '#16A34A' },
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
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { id: 'active' as const, label: 'Active', value: activeIssues.length },
            { id: 'all' as const, label: 'All', value: issues.length },
            { id: 'closed' as const, label: 'Closed', value: closedIssues.length },
          ].map(({ id, label, value }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className="rounded-full py-2.5 text-xs transition-colors"
              style={{
                background: filter === id ? '#0B5CFF' : '#FFFFFF',
                color: filter === id ? '#FFFFFF' : '#08122D',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 850,
                boxShadow: filter === id ? '0 6px 16px rgba(11,92,255,0.22)' : '0 1px 5px rgba(8,18,45,0.06)',
              }}
            >
              {label} <span style={{ opacity: 0.72 }}>{value}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {!visibleIssues.length && (
            <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
              <p className="text-[#08122D] text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                {filter === 'active' ? 'No active reports' : filter === 'closed' ? 'No closed reports' : 'No reports yet'}
              </p>
              <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                {filter === 'all' ? 'Submitted reports from the backend will appear here.' : 'Switch filters to see other reports.'}
              </p>
            </div>
          )}
          {visibleIssues.map((issue) => (
            <motion.button
              key={issue.id}
              onClick={() => onViewDetails(issue)}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white rounded-2xl overflow-hidden shadow-sm text-left"
            >
              <div className="flex">
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100">
                  <img src={issue.photo} alt={issue.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/icon.png"; }} />
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
                    <span className="inline-flex items-center gap-1.5 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <CategoryIcon category={issue.category} size={13} />
                      {CATEGORY_LABELS[issue.category]}
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

function isClosedIssue(issue: Issue) {
  return issue.status === 'resolved' || issue.status === 'rejected';
}

function getIssueSortValue(issue: Issue) {
  const idValue = issue.backendId ?? Number(issue.id.replace(/\D/g, ''));
  if (Number.isFinite(idValue) && idValue > 0) return idValue * 1_000_000_000;

  const dateValue = Date.parse(issue.reportedAt);
  return Number.isNaN(dateValue) ? 0 : dateValue;
}
