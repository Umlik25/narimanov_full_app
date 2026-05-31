import { useState } from "react";
import { ArrowLeft, Bot, CheckCircle, XCircle, GitMerge, MapPin, Clock } from "lucide-react";
import { mockAIDetections, AIDetection, PRIORITY_COLORS, PRIORITY_LABELS, CATEGORY_ICONS, CATEGORY_LABELS } from "./mockData";

interface Props {
  onBack: () => void;
}

export function AdminAIReview({ onBack }: Props) {
  const [detections, setDetections] = useState(mockAIDetections);
  const [actioned, setActioned] = useState<Record<string, 'approved' | 'rejected' | 'merged'>>({});

  const handleAction = (id: string, action: 'approved' | 'rejected' | 'merged') => {
    setActioned(prev => ({ ...prev, [id]: action }));
  };

  const pending = detections.filter(d => !actioned[d.id]);
  const done = detections.filter(d => actioned[d.id]);

  return (
    <div className="flex flex-col h-full bg-[#F5F7FB]">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #08122D 0%, #7C3AED 100%)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>AI Review</h1>
            <p className="text-white/60 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Computer Vision detections awaiting review</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          {[
            { label: 'Pending', value: pending.length, color: 'white' },
            { label: 'Approved', value: Object.values(actioned).filter(a => a === 'approved').length, color: '#86efac' },
            { label: 'Rejected', value: Object.values(actioned).filter(a => a === 'rejected').length, color: '#fca5a5' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex-1 bg-white/15 rounded-2xl px-3 py-2.5 text-center">
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '20px', color }}>{value}</p>
              <p className="text-white/70 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {pending.length > 0 && (
          <>
            <p className="text-gray-500 text-xs mb-3 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
              Pending Review ({pending.length})
            </p>
            <div className="flex flex-col gap-4 mb-6">
              {pending.map(detection => (
                <AIDetectionCard
                  key={detection.id}
                  detection={detection}
                  onAction={handleAction}
                />
              ))}
            </div>
          </>
        )}

        {done.length > 0 && (
          <>
            <p className="text-gray-500 text-xs mb-3 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
              Reviewed ({done.length})
            </p>
            <div className="flex flex-col gap-3">
              {done.map(detection => (
                <div key={detection.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm opacity-60">
                  <img src={detection.image} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" alt="" onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1706660143732-c1d14701114e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"; }} />
                  <div className="flex-1">
                    <p className="text-[#08122D] text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                      {CATEGORY_ICONS[detection.detectedCategory]} {CATEGORY_LABELS[detection.detectedCategory]}
                    </p>
                    <p className="text-gray-400 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{detection.id}</p>
                  </div>
                  <span
                    className="px-3 py-1.5 rounded-full text-xs text-white capitalize"
                    style={{
                      background: actioned[detection.id] === 'approved' ? '#16A34A' : actioned[detection.id] === 'merged' ? '#F97316' : '#9CA3AF',
                      fontFamily: 'Inter, sans-serif', fontWeight: 600,
                    }}
                  >
                    {actioned[detection.id]}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AIDetectionCard({ detection, onAction }: { detection: AIDetection; onAction: (id: string, action: 'approved' | 'rejected' | 'merged') => void }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {/* Image */}
      <div className="relative h-44">
        <img src={detection.image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1706660143732-c1d14701114e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Confidence badge */}
        <div
          className="absolute top-3 right-3 px-3 py-1.5 rounded-full flex items-center gap-1.5"
          style={{ background: 'rgba(124,58,237,0.9)', backdropFilter: 'blur(8px)' }}
        >
          <Bot size={12} className="text-white" />
          <span className="text-white text-xs" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
            {detection.confidence}%
          </span>
        </div>
        {/* Detection info on image */}
        <div className="absolute bottom-3 left-3">
          <p className="text-white text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
            {CATEGORY_ICONS[detection.detectedCategory]} {CATEGORY_LABELS[detection.detectedCategory]}
          </p>
          <p className="text-white/70 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{detection.id}</p>
        </div>
      </div>

      <div className="p-4">
        {/* Priority & meta */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <span
            className="px-2.5 py-1 rounded-full text-white text-xs"
            style={{ background: PRIORITY_COLORS[detection.priority], fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            {PRIORITY_LABELS[detection.priority]}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            <MapPin size={12} />
            {detection.location}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
          <Clock size={12} />
          Detected: {detection.detectedAt}
        </div>

        {/* Confidence bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>AI Confidence</span>
            <span className="text-purple-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>{detection.confidence}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${detection.confidence}%`, background: 'linear-gradient(90deg, #7C3AED, #a78bfa)' }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onAction(detection.id, 'approved')}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-white text-sm"
            style={{ background: '#16A34A', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            <CheckCircle size={15} /> Approve
          </button>
          <button
            onClick={() => onAction(detection.id, 'merged')}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-white text-sm"
            style={{ background: '#F97316', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            <GitMerge size={15} /> Merge
          </button>
          <button
            onClick={() => onAction(detection.id, 'rejected')}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-white text-sm"
            style={{ background: '#E53935', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            <XCircle size={15} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
}
