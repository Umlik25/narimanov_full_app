import { ArrowLeft, Search, MapPin, Clock, Ticket } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const TAP = { scale: 0.97 };
import { mockIssues, Issue, STATUS_COLORS, STATUS_LABELS, CATEGORY_ICONS, CATEGORY_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from "./mockData";

interface Props {
  onBack: () => void;
  onViewDetails: (issue: Issue) => void;
}

export function AdminAllIssues({ onBack, onViewDetails }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = mockIssues.filter(i => {
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col h-full bg-[#F5F7FB]">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #08122D 0%, #0B5CFF 100%)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.button whileTap={TAP} onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </motion.button>
          <h1 className="text-white text-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>All Issues</h1>
          <span className="ml-auto text-white/80 text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
            {filtered.length} total
          </span>
        </div>

        {/* Search */}
        <div className="flex items-center bg-white/20 rounded-2xl px-4 h-10 gap-2">
          <Search size={15} className="text-white/70" />
          <input
            className="flex-1 outline-none text-white text-sm placeholder-white/60 bg-transparent"
            style={{ fontFamily: 'Inter, sans-serif' }}
            placeholder="Search issues..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
        {['all', 'new', 'ai_review', 'assigned', 'in_progress', 'overdue', 'resolved'].map(s => (
          <motion.button
            key={s}
            whileTap={TAP}
            onClick={() => setFilterStatus(s)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs capitalize"
            style={{
              background: filterStatus === s ? '#0B5CFF' : 'white',
              color: filterStatus === s ? 'white' : '#08122D',
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}
          >
            {s === 'all' ? 'All' : STATUS_LABELS[s as any]}
          </motion.button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <div className="flex flex-col gap-3">
          {filtered.map((issue, i) => (
            <motion.button
              key={issue.id}
              onClick={() => onViewDetails(issue)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.035, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white rounded-2xl overflow-hidden shadow-sm text-left"
            >
              <div className="flex">
                <div className="w-20 h-20 flex-shrink-0 bg-gray-100">
                  <img src={issue.photo} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1706660143732-c1d14701114e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"; }} />
                </div>
                <div className="flex-1 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>{issue.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: STATUS_COLORS[issue.status], fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                      {STATUS_LABELS[issue.status]}
                    </span>
                  </div>
                  <p className="text-[#08122D] text-sm leading-tight mb-1.5" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    {issue.title}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: PRIORITY_COLORS[issue.priority], fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      {PRIORITY_LABELS[issue.priority]}
                    </span>
                    <span className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {CATEGORY_ICONS[issue.category]} {CATEGORY_LABELS[issue.category]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-green-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                      <Ticket size={11} />
                      +{issue.rewardPoints} pts
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 px-3 pb-2.5 text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="flex items-center gap-1"><MapPin size={11} />{issue.location}</span>
                <span className="flex items-center gap-1 ml-auto"><Clock size={11} />{issue.reportedAt}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
