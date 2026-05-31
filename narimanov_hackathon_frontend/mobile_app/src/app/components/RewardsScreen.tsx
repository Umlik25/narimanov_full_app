import { type ReactNode, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  Gift,
  HelpCircle,
  Headphones,
  ShoppingBag,
  Smartphone,
  Ticket,
  Wifi,
  X,
} from "lucide-react";

const TAP = { scale: 0.97 };

type Reward = {
  id: string;
  tag: string;
  title: string;
  cost: number;
  icon: ReactNode;
  color: string;
  description: string;
  stock: number;
};

type Activity = {
  id: string;
  label: string;
  value: string;
  tone: "gain" | "spend";
};

const rewards: Reward[] = [
  {
    id: "phone",
    tag: "Phone",
    title: "Smartphone",
    cost: 50,
    icon: <Smartphone size={34} />,
    color: "#0B5CFF",
    description: "Reserved for top contributors with a long record of accepted reports.",
    stock: 1,
  },
  {
    id: "audio",
    tag: "Audio",
    title: "Earbuds",
    cost: 30,
    icon: <Headphones size={34} />,
    color: "#16A34A",
    description: "Wireless earbuds for active citizens who keep reporting verified issues.",
    stock: 3,
  },
  {
    id: "data",
    tag: "Data",
    title: "10 GB Pack",
    cost: 8,
    icon: <Wifi size={34} />,
    color: "#F97316",
    description: "Mobile internet pack. The code appears instantly after redemption.",
    stock: 12,
  },
  {
    id: "shop",
    tag: "Shop",
    title: "Voucher",
    cost: 12,
    icon: <ShoppingBag size={34} />,
    color: "#7C3AED",
    description: "Partner store voucher for everyday purchases in the district.",
    stock: 7,
  },
];

const steps = [
  ["Report", "Submit useful reports"],
  ["Accepted", "Verified by ops"],
  ["Coupons", "100 pts = 1"],
  ["Redeem", "Choose a reward"],
];

const initialActivity: Activity[] = [
  { id: "accepted-road", label: "Road report accepted", value: "+80 pts", tone: "gain" },
  { id: "resolved-flooding", label: "Flooding report resolved", value: "+120 pts", tone: "gain" },
  { id: "photo-added", label: "Extra photo added", value: "+35 pts", tone: "gain" },
];

const makeCode = (reward: Reward) => `${reward.tag.toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

export function RewardsScreen({ onBack }: { onBack: () => void }) {
  const [showHelp, setShowHelp] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeemed, setRedeemed] = useState<Array<{ id: string; reward: Reward; code: string }>>([]);
  const [activity, setActivity] = useState<Activity[]>(initialActivity);
  const [view, setView] = useState<"all" | "available" | "claimed">("all");

  const earnedPoints = 1850;
  const spentCoupons = redeemed.reduce((total, item) => total + item.reward.cost, 0);
  const coupons = Math.max(0, Math.floor(earnedPoints / 100) - spentCoupons);
  const pointsToNextCoupon = 100 - (earnedPoints % 100 || 100);
  const levelProgress = Math.min(100, (earnedPoints % 1000) / 10);

  const visibleRewards = useMemo(() => {
    if (view === "available") {
      return rewards.filter((reward) => reward.stock > redeemed.filter((item) => item.reward.id === reward.id).length && reward.cost <= coupons);
    }
    return rewards;
  }, [coupons, redeemed, view]);

  const activeRewardRedemptions = selectedReward
    ? redeemed.filter((item) => item.reward.id === selectedReward.id).length
    : 0;
  const selectedInStock = selectedReward ? selectedReward.stock > activeRewardRedemptions : false;
  const canRedeemSelected = Boolean(selectedReward && selectedInStock && coupons >= selectedReward.cost);

  const redeemReward = () => {
    if (!selectedReward || !canRedeemSelected) return;

    const code = makeCode(selectedReward);
    setRedeemed((current) => [{ id: code, reward: selectedReward, code }, ...current]);
    setActivity((current) => [
      {
        id: `redeemed-${code}`,
        label: `${selectedReward.title} redeemed`,
        value: `-${selectedReward.cost} coupons`,
        tone: "spend",
      },
      ...current,
    ]);
    setSelectedReward(null);
    setView("claimed");
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F7FB]">
      <div className="flex-shrink-0 px-5 pt-12 pb-5 bg-white">
        <div className="flex items-center justify-between">
          <motion.button whileTap={TAP} onClick={onBack} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center" aria-label="Back">
            <ArrowLeft size={18} className="text-[#08122D]" />
          </motion.button>
          <h1 className="text-[#08122D] text-lg" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>
            Rewards
          </h1>
          <motion.button whileTap={TAP} onClick={() => setShowHelp(true)} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center" aria-label="Rewards help">
            <HelpCircle size={18} className="text-[#08122D]" />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <motion.div
          className="rounded-3xl p-5 text-white shadow-lg overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #0B5CFF 0%, #071848 100%)" }}
        >
          <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-xs" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700 }}>Your score</p>
                <p className="text-5xl mt-2" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>{earnedPoints}</p>
                <p className="text-white/70 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>{pointsToNextCoupon} points to next coupon</p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-xs" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700 }}>Level 4</p>
                <p className="text-[#7BF18D] text-lg mt-2" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>Active Helper</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-2">
                  <Ticket size={15} className="text-[#8BD3FF]" />
                  <span className="text-sm" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>{coupons} coupons</span>
                </div>
              </div>
            </div>
            <div className="h-2 bg-white/15 rounded-full overflow-hidden mt-5">
              <div className="h-full rounded-full" style={{ width: `${levelProgress}%`, background: "linear-gradient(90deg,#7BF18D,#59A8FF)" }} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                ["Points", String(earnedPoints)],
                ["Redeemed", String(redeemed.length)],
                ["Rank", "Top 12%"],
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

        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            ["all", "All"],
            ["available", "Available"],
            ["claimed", "My codes"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setView(id as "all" | "available" | "claimed")}
              className="rounded-full py-2 text-xs transition-colors"
              style={{
                background: view === id ? "#0B5CFF" : "#FFFFFF",
                color: view === id ? "#FFFFFF" : "#08122D",
                fontFamily: "Inter, sans-serif",
                fontWeight: 850,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {view !== "claimed" ? (
          <div className="grid grid-cols-2 gap-3">
            {visibleRewards.map((reward) => {
              const claimedCount = redeemed.filter((item) => item.reward.id === reward.id).length;
              const inStock = reward.stock > claimedCount;
              const available = inStock && reward.cost <= coupons;

              return (
                <motion.button
                  key={reward.id}
                  whileTap={TAP}
                  onClick={() => setSelectedReward(reward)}
                  className="bg-white rounded-2xl p-4 text-left shadow-sm min-w-0"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full px-2 py-1 text-[10px] text-white" style={{ background: reward.color, fontFamily: "Inter, sans-serif", fontWeight: 800 }}>
                      {reward.tag}
                    </span>
                    <div style={{ color: reward.color }}>{reward.icon}</div>
                  </div>
                  <p className="text-[#08122D] text-sm truncate" style={{ fontFamily: "Inter, sans-serif", fontWeight: 850 }}>{reward.title}</p>
                  <p className="text-gray-500 text-[10px] mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
                    {inStock ? `${reward.stock - claimedCount} left` : "Out of stock"}
                  </p>
                  <div
                    className="mt-3 rounded-full text-center py-2 text-xs"
                    style={{
                      background: available ? "#EEF3FF" : "#F3F4F6",
                      color: available ? "#0B5CFF" : "#6B7280",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 900,
                    }}
                  >
                    {reward.cost} coupons
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-4 shadow-sm">
            {redeemed.length === 0 ? (
              <div className="py-6 text-center">
                <Gift size={28} className="text-[#0B5CFF] mx-auto mb-2" />
                <p className="text-[#08122D] text-sm" style={{ fontFamily: "Inter, sans-serif", fontWeight: 850 }}>No redeemed rewards yet</p>
                <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: "Inter, sans-serif" }}>Choose an available reward to generate your first code.</p>
              </div>
            ) : (
              redeemed.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-[#08122D] text-sm truncate" style={{ fontFamily: "Inter, sans-serif", fontWeight: 850 }}>{item.reward.title}</p>
                    <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: "Inter, sans-serif" }}>{item.code}</p>
                  </div>
                  <span className="rounded-full bg-[#EAF7EF] px-3 py-1 text-[#16A34A] text-[10px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>
                    Active
                  </span>
                </div>
              ))
            )}
          </div>
        )}

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
          {activity.map(({ id, label, tone, value }) => (
            <div key={id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 gap-3">
              <span className="text-gray-600 text-xs truncate" style={{ fontFamily: "Inter, sans-serif" }}>{label}</span>
              <span className={`text-xs flex-shrink-0 ${tone === "gain" ? "text-[#16A34A]" : "text-[#DC2626]"}`} style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedReward && (
          <RewardSheet
            coupons={coupons}
            inStock={selectedInStock}
            onClose={() => setSelectedReward(null)}
            onRedeem={redeemReward}
            reward={selectedReward}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
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
              exit={{ y: 28 }}
              className="bg-white rounded-3xl shadow-xl w-full p-5"
              style={{ marginBottom: "var(--cg-bottom-gap)", maxHeight: "calc(100% - var(--cg-safe-top) - var(--cg-bottom-gap) - 24px)", overflowY: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-[#08122D] text-base" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>How rewards work</p>
                  <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: "Inter, sans-serif" }}>Earn points from accepted city reports.</p>
                </div>
                <button onClick={() => setShowHelp(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0" aria-label="Close help">
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
      </AnimatePresence>
    </div>
  );
}

function RewardSheet({
  coupons,
  inStock,
  onClose,
  onRedeem,
  reward,
}: {
  coupons: number;
  inStock: boolean;
  onClose: () => void;
  onRedeem: () => void;
  reward: Reward;
}) {
  const canRedeem = inStock && coupons >= reward.cost;
  const missingCoupons = Math.max(0, reward.cost - coupons);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-[#08122D]/45 flex items-end px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 28 }}
        animate={{ y: 0 }}
        exit={{ y: 28 }}
        className="bg-white rounded-3xl shadow-xl w-full p-5"
        style={{ marginBottom: "var(--cg-bottom-gap)", maxHeight: "calc(100% - var(--cg-safe-top) - var(--cg-bottom-gap) - 24px)", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0" style={{ background: reward.color }}>
              {reward.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[#08122D] text-base truncate" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>{reward.title}</p>
              <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: "Inter, sans-serif" }}>{reward.cost} coupons</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0" aria-label="Close reward">
            <X size={17} className="text-[#08122D]" />
          </button>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mt-4" style={{ fontFamily: "Inter, sans-serif" }}>
          {reward.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="rounded-2xl bg-[#F5F8FF] p-3">
            <p className="text-gray-500 text-[10px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>YOUR BALANCE</p>
            <p className="text-[#08122D] text-lg mt-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>{coupons} coupons</p>
          </div>
          <div className="rounded-2xl bg-[#F5F8FF] p-3">
            <p className="text-gray-500 text-[10px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>STATUS</p>
            <p className="text-[#08122D] text-lg mt-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>
              {inStock ? "Available" : "Sold out"}
            </p>
          </div>
        </div>

        {!canRedeem && (
          <div className="mt-4 rounded-2xl bg-[#FFF7ED] p-3">
            <p className="text-[#9A3412] text-xs leading-relaxed" style={{ fontFamily: "Inter, sans-serif", fontWeight: 750 }}>
              {inStock ? `You need ${missingCoupons} more coupons to redeem this reward.` : "This reward is currently out of stock."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-5">
          <motion.button whileTap={TAP} onClick={onClose} className="rounded-2xl bg-gray-100 py-3 text-sm text-[#08122D]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800 }}>
            Cancel
          </motion.button>
          <motion.button
            whileTap={canRedeem ? TAP : undefined}
            onClick={onRedeem}
            disabled={!canRedeem}
            className="rounded-2xl py-3 text-sm text-white disabled:opacity-45 disabled:cursor-not-allowed"
            style={{ background: "#0B5CFF", fontFamily: "Inter, sans-serif", fontWeight: 850 }}
          >
            Redeem
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
