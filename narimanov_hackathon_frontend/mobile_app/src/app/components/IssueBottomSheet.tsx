import { X, MapPin, Clock, ChevronRight, User, Ticket } from "lucide-react";
import { motion } from "motion/react";
import { Issue, STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, CATEGORY_LABELS } from "./mockData";
import { CategoryIcon } from "./CategoryIcon";

interface Props {
  issue: Issue;
  onClose: () => void;
  onViewDetails: (issue: Issue) => void;
}

const SPRING = { type: "spring" as const, stiffness: 360, damping: 34, mass: 0.9 };
const TAP = { scale: 0.96 };

export function IssueBottomSheet({ issue, onClose, onViewDetails }: Props) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-50">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        className="absolute inset-0 -top-[100vh]"
        style={{ background: "rgba(8,18,45,0.35)", backdropFilter: "blur(2px)" }}
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={SPRING}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(_, info) => { if (info.offset.y > 100 || info.velocity.y > 500) onClose(); }}
        className="relative bg-white rounded-t-3xl shadow-2xl px-5 pt-3"
        style={{ paddingBottom: "var(--cg-bottom-gap)", boxShadow: '0 -4px 40px rgba(0,0,0,0.18)', willChange: "transform" }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F5F7FB]">
                <CategoryIcon category={issue.category} size={16} />
              </span>
              <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                {issue.id}
              </span>
            </div>
            <h3 className="text-[#08122D] leading-tight" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '17px' }}>
              {issue.title}
            </h3>
          </div>
          <motion.button whileTap={TAP} onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <X size={16} className="text-gray-600" />
          </motion.button>
        </div>

        {/* Photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl overflow-hidden mb-4 h-36 bg-gray-200"
        >
          <img
            src={issue.photo}
            alt={issue.title}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1706660143732-c1d14701114e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"; }}
          />
        </motion.div>

        {/* Badges row */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <span
            className="px-3 py-1 rounded-full text-white text-xs"
            style={{ backgroundColor: STATUS_COLORS[issue.status], fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            {STATUS_LABELS[issue.status]}
          </span>
          <span
            className="px-3 py-1 rounded-full text-white text-xs"
            style={{ backgroundColor: PRIORITY_COLORS[issue.priority], fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            {PRIORITY_LABELS[issue.priority]}
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            {CATEGORY_LABELS[issue.category]}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
            <Ticket size={12} />
            +{issue.rewardPoints} pts
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-2 mb-5">
          <div className="flex items-center gap-2 text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            <MapPin size={14} className="flex-shrink-0 text-gray-400" />
            {issue.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            <Clock size={14} className="flex-shrink-0 text-gray-400" />
            {issue.reportedAt}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            <User size={14} className="flex-shrink-0 text-gray-400" />
            Reported by {issue.reportedBy}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-5 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          {issue.description}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <motion.button
            whileTap={TAP}
            onClick={() => onViewDetails(issue)}
            className="flex items-center justify-between w-full py-3.5 px-5 rounded-2xl text-white"
            style={{ background: 'linear-gradient(135deg, #0B5CFF, #1a3a8f)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            View Details
            <ChevronRight size={18} />
          </motion.button>
          <div className="flex gap-3">
            <motion.button whileTap={TAP} className="flex-1 py-3 rounded-2xl bg-gray-100 text-[#08122D] text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Track Status
            </motion.button>
            <motion.button whileTap={TAP} className="flex-1 py-3 rounded-2xl bg-gray-100 text-[#08122D] text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Add Comment
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
