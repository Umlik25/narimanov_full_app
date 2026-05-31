import { useState } from "react";
import { ArrowLeft, CheckCircle2, Gift, HelpCircle, Headphones, ShoppingBag, Smartphone, Ticket, Wifi, X } from "lucide-react";
import { motion } from "motion/react";

const TAP = { scale: 0.97 };

const rewards = [
  { tag: "Phone", title: "Smartphone", cost: 50, icon: <Smartphone size={34} />, color: "#0B5CFF" },
  { tag: "Audio", title: "Earbuds", cost: 30, icon: <Headphones size={34} />, color: "#16A34A" },
  { tag: "Data", title: "10 GB Pack", cost: 8, icon: <Wifi size={34} />, color: "#F97316" },
  { tag: "Shop", title: "Voucher", cost: 12, icon: <ShoppingBag size={34} />, color: "#7C3AED" },
];

const steps = [
  ["Report", "Submit useful reports"],
  ["Accepted", "Verified by ops"],
  ["Coupons", "100 pts = 1"],
  ["Redeem", "Choose a reward"],
];

export function RewardsScreen({ onBack }: { onBack: () => void }) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#F5F7FB]">
      <div className="flex-shrink-0 px-5 pt-12 pb-5 bg-white">
        <div className="flex items-center justify-between">
          <motion.button whileTap={TAP} onClick={onBack} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
            <ArrowLeft size={18} className="text-[#08122D]" />
          </motion.button>
          <h1 className="text-[#08122D] text-lg" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>
            Rewards
          </h1>
          <motion.button whileTap={TAP} onClick={() => setShowHelp(true)} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
            <HelpCircle size={18} className="text-[#08122D]" />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl p-5 text-white shadow-lg overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #0B5CFF 0%, #071848 100%)" }}
        >
          <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-xs" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700 }}>Your score</p>
                <p className="text-5xl mt-2" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>750</p>
                <p className="text-white/70 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>250 points to next level</p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-xs" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700 }}>Level 3</p>
                <p className="text-[#7BF18D] text-lg mt-2" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>Active Helper</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-2">
                  <Ticket size={15} className="text-[#8BD3FF]" />
                  <span className="text-sm" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>7 coupons</span>
                </div>
              </div>
            </div>
            <div className="h-2 bg-white/15 rounded-full overflow-hidden mt-5">
              <div className="h-full rounded-full" style={{ width: "75%", background: "linear-gradient(90deg,#7BF18D,#59A8FF)" }} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                ["Points", "750"],
                ["Reports", "24"],
                ["Rank", "Top 18%"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white/10 px-3 py-2">
                  <p className="text-white/55 text-[10px]" style={{ fontFamily: "Inter, sans-serif" }}>{label}</p>
                  <p className="text-white text-sm" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex items-center justify-between mt-5 mb-3">
          <h2 className="text-[#08122D] text-sm" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>Redeem</h2>
          <span className="text-[#0B5CFF] text-xs" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>100 pts = 1 coupon</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {rewards.map((reward, i) => (
            <motion.button
              key={reward.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 + i * 0.04, duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              whileTap={TAP}
              className="bg-white rounded-2xl p-4 text-left shadow-sm min-w-0"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full px-2 py-1 text-[10px] text-white" style={{ background: reward.color, fontFamily: "Inter, sans-serif", fontWeight: 800 }}>
                  {reward.tag}
                </span>
                <div style={{ color: reward.color }}>{reward.icon}</div>
              </div>
              <p className="text-[#08122D] text-sm truncate" style={{ fontFamily: "Inter, sans-serif", fontWeight: 850 }}>{reward.title}</p>
              <div className="mt-3 rounded-full bg-[#EEF3FF] text-[#0B5CFF] text-center py-2 text-xs" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>
                {reward.cost} coupons
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl mt-5 p-4 flex items-center gap-4"
          style={{ background: "linear-gradient(135deg,#F1EEFF,#FFFFFF)" }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#8B5CF6,#0B5CFF)" }}>
            <Gift size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-[#08122D] text-sm" style={{ fontFamily: "Inter, sans-serif", fontWeight: 850 }}>
              Help the district. Earn coupons.
            </p>
            <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
              Accepted reports turn into points.
            </p>
          </div>
        </motion.div>

        <div className="bg-white rounded-3xl mt-5 p-4 shadow-sm">
          <h2 className="text-[#08122D] text-sm mb-4" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>How it works</h2>
          <div className="grid grid-cols-4 gap-2 text-center">
            {steps.map(([title, text], i) => (
              <div key={title} className="min-w-0">
                <div className="w-10 h-10 mx-auto rounded-2xl bg-[#F3F4FF] flex items-center justify-center text-[#7C3AED] text-sm" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>
                  {i + 1}
                </div>
                <p className="text-[#08122D] text-[10px] mt-2 truncate" style={{ fontFamily: "Inter, sans-serif", fontWeight: 850 }}>{title}</p>
                <p className="text-gray-500 text-[9px] mt-1 leading-tight" style={{ fontFamily: "Inter, sans-serif" }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl mt-5 p-4 shadow-sm">
          <h2 className="text-[#08122D] text-sm mb-3" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>Recent activity</h2>
          {[
            ["Road report accepted", "+80 pts"],
            ["Flooding report resolved", "+120 pts"],
            ["Extra photo added", "+35 pts"],
          ].map(([label, points]) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 gap-3">
              <span className="text-gray-600 text-xs truncate" style={{ fontFamily: "Inter, sans-serif" }}>{label}</span>
              <span className="text-[#16A34A] text-xs flex-shrink-0" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>{points}</span>
            </div>
          ))}
        </div>
      </div>

      {showHelp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-[#08122D]/45 flex items-end px-4"
          onClick={() => setShowHelp(false)}
        >
          <motion.div
            initial={{ y: 28 }}
            animate={{ y: 0 }}
            className="bg-white rounded-3xl shadow-xl w-full p-5"
            style={{ marginBottom: "var(--cg-bottom-gap)", maxHeight: "calc(100% - var(--cg-safe-top) - var(--cg-bottom-gap) - 24px)", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-[#08122D] text-base" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>How rewards work</p>
                <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: "Inter, sans-serif" }}>Earn points from accepted city reports.</p>
              </div>
              <button onClick={() => setShowHelp(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <X size={17} className="text-[#08122D]" />
              </button>
            </div>

            {[
              ["Submit useful reports", "Clear photos and accurate locations receive points after review."],
              ["Collect coupons", "Every 100 points becomes 1 coupon you can redeem."],
              ["Redeem perks", "Use coupons for data packs, vouchers, and device rewards."],
            ].map(([title, text]) => (
              <div key={title} className="flex gap-3 py-3 border-t border-gray-100 first:border-t-0">
                <CheckCircle2 size={18} className="text-[#16A34A] mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[#08122D] text-sm" style={{ fontFamily: "Inter, sans-serif", fontWeight: 850 }}>{title}</p>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>{text}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
