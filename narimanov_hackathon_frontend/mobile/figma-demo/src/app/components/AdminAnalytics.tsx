import { ArrowLeft, TrendingUp } from "lucide-react";
import { mockIssues, CATEGORY_LABELS, CATEGORY_ICONS } from "./mockData";

interface Props {
  onBack: () => void;
}

export function AdminAnalytics({ onBack }: Props) {
  const total = 47;
  const resolved = 31;
  const overdue = 4;
  const aiDetected = 12;
  const resolutionRate = Math.round((resolved / total) * 100);

  const categoryData = [
    { category: 'road', count: 16, pct: 34 },
    { category: 'lighting', count: 11, pct: 23 },
    { category: 'trash', count: 9, pct: 19 },
    { category: 'flooding', count: 6, pct: 13 },
    { category: 'infrastructure', count: 5, pct: 11 },
  ] as const;

  const locationData = [
    { name: 'Haji Murad St', count: 9 },
    { name: 'Ataturk Avenue', count: 8 },
    { name: 'Ziya Bunyadov Ave', count: 7 },
    { name: 'Mammad Araz St', count: 6 },
    { name: 'Ganjlik Ave', count: 5 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F5F7FB]">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #08122D 0%, #0B5CFF 80%)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Analytics</h1>
            <p className="text-white/60 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Narimanov District · May 2026</p>
          </div>
          <TrendingUp size={20} className="text-white/80 ml-auto" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Total Issues', value: total, color: '#0B5CFF', bg: '#EEF3FF' },
            { label: 'Resolved', value: resolved, color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Overdue', value: overdue, color: '#E53935', bg: '#FEF2F2' },
            { label: 'AI Detected', value: aiDetected, color: '#7C3AED', bg: '#EDE9FE' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="rounded-2xl p-4" style={{ background: bg }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '28px', color }}>{value}</p>
              <p className="text-gray-600 text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Resolution rate */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#08122D] text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Resolution Rate</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '22px', color: '#16A34A' }}>{resolutionRate}%</p>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${resolutionRate}%`, background: 'linear-gradient(90deg, #16A34A, #4ade80)' }}
            />
          </div>
          <p className="text-gray-400 text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            {resolved} of {total} issues resolved this month
          </p>
        </div>

        {/* Top categories */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <p className="text-[#08122D] text-sm mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Top Issue Categories</p>
          <div className="flex flex-col gap-3">
            {categoryData.map(({ category, count, pct }) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#08122D]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
                  </span>
                  <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#0B5CFF' }}>
                    {count}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0B5CFF, #60a5fa)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top locations */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <p className="text-[#08122D] text-sm mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Top Locations</p>
          <div className="flex flex-col gap-2">
            {locationData.map(({ name, count }, i) => (
              <div key={name} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0"
                  style={{ background: i === 0 ? '#0B5CFF' : '#E5E7EB', color: i === 0 ? 'white' : '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
                >
                  {i + 1}
                </div>
                <span className="flex-1 text-sm text-[#08122D]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{name}</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#08122D' }}>{count} issues</span>
              </div>
            ))}
          </div>
        </div>

        {/* Avg resolution time */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-[#08122D] text-sm mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Avg. Resolution Time</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Road', days: 4.2, color: '#0B5CFF' },
              { label: 'Lighting', days: 2.8, color: '#F97316' },
              { label: 'Trash', days: 1.5, color: '#16A34A' },
            ].map(({ label, days, color }) => (
              <div key={label} className="text-center p-3 rounded-xl" style={{ background: '#F5F7FB' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '20px', color }}>{days}d</p>
                <p className="text-gray-500 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
