import { type ReactNode, useState } from "react";
import { ArrowLeft, User, Phone, Shield, Bell, LogOut, ChevronRight, Edit2, X, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

const TAP = { scale: 0.97 };

interface Props {
  onBack: () => void;
  onLogout: () => void;
  userName: string;
  points: number;
  roleLabel?: string | null;
}

export function ProfileScreen({ onBack, onLogout, userName, points, roleLabel }: Props) {
  const [displayName, setDisplayName] = useState(userName);
  const [phone, setPhone] = useState('+994 50 734 43 15');
  const [draftName, setDraftName] = useState(userName);
  const [draftPhone, setDraftPhone] = useState('+994 50 734 43 15');
  const [editOpen, setEditOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [reportAlerts, setReportAlerts] = useState(true);
  const [rewardAlerts, setRewardAlerts] = useState(true);

  const openEdit = () => {
    setDraftName(displayName);
    setDraftPhone(phone);
    setEditOpen(true);
  };

  const saveEdit = () => {
    setDisplayName(draftName.trim() || displayName);
    setPhone(draftPhone.trim() || phone);
    setEditOpen(false);
  };

  const resolvedRole = roleLabel?.trim() || 'Citizen User';

  return (
    <div className="flex flex-col h-full bg-[#F5F7FB]">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-12 pb-8"
        style={{ background: 'linear-gradient(135deg, #08122D 0%, #0B5CFF 100%)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <motion.button whileTap={TAP} onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </motion.button>
          <h1 className="text-white text-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Profile</h1>
        </div>

        {/* Avatar section */}
        <div className="flex items-center gap-4">
          <div className="w-18 h-18 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30" style={{ width: 72, height: 72 }}>
            <User size={32} className="text-white" />
          </div>
          <div>
            <p className="text-white text-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>{displayName}</p>
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{
                background: '#0B5CFF',
                color: 'white',
                fontFamily: 'Inter, sans-serif', fontWeight: 600,
              }}
            >
              {resolvedRole}
            </span>
          </div>
          <motion.button whileTap={TAP} onClick={openEdit} className="ml-auto w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <Edit2 size={16} className="text-white" />
          </motion.button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/12 px-4 py-3">
            <p className="text-white/65 text-[10px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>POINTS</p>
            <p className="text-white text-xl mt-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900 }}>{points}</p>
          </div>
          <div className="rounded-2xl bg-white/12 px-4 py-3">
            <p className="text-white/65 text-[10px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>STATUS</p>
            <p className="text-white text-xl mt-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900 }}>Active</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Account info */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <p className="text-gray-500 text-xs mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>ACCOUNT INFORMATION</p>
          {[
            { icon: <User size={16} />, label: 'Full Name', value: displayName },
            { icon: <Phone size={16} />, label: 'Phone', value: phone },
            { icon: <Shield size={16} />, label: 'Role', value: resolvedRole },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3 text-gray-500 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="text-gray-400">{icon}</span>
                {label}
              </div>
              <span className="text-[#08122D] text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <p className="text-gray-500 text-xs mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>SETTINGS</p>
          {[
            { icon: <Bell size={16} />, label: 'Notifications', value: reportAlerts || rewardAlerts ? 'Enabled' : 'Off', action: () => setNotificationsOpen(true) },
            { icon: <User size={16} />, label: 'Edit Profile', value: '', action: openEdit },
          ].map(({ icon, label, value, action }) => (
            <motion.button key={label} whileTap={TAP} onClick={action} className="flex items-center justify-between w-full py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3 text-[#08122D] text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                <span className="text-gray-400">{icon}</span>
                {label}
              </div>
              <div className="flex items-center gap-1">
                {value && <span className="text-gray-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{value}</span>}
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Logout */}
        <motion.button
          whileTap={TAP}
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white border border-red-200 text-red-500 shadow-sm"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
        >
          <LogOut size={18} />
          Logout
        </motion.button>
      </div>

      {editOpen && (
        <Sheet onClose={() => setEditOpen(false)} title="Edit profile" subtitle="Update your account details.">
          <label className="block text-xs text-gray-500 mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>FULL NAME</label>
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none"
            style={{ fontFamily: 'Inter, sans-serif', color: '#08122D' }}
          />
          <label className="block text-xs text-gray-500 mt-4 mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>PHONE</label>
          <input
            value={draftPhone}
            onChange={(e) => setDraftPhone(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none"
            style={{ fontFamily: 'Inter, sans-serif', color: '#08122D' }}
          />
          <div className="grid grid-cols-2 gap-3 mt-5">
            <motion.button whileTap={TAP} onClick={() => setEditOpen(false)} className="rounded-2xl bg-gray-100 py-3 text-sm text-[#08122D]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
              Discard
            </motion.button>
            <motion.button whileTap={TAP} onClick={saveEdit} className="rounded-2xl bg-[#0B5CFF] py-3 text-sm text-white" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 850 }}>
              Confirm
            </motion.button>
          </div>
        </Sheet>
      )}

      {notificationsOpen && (
        <Sheet onClose={() => setNotificationsOpen(false)} title="Notifications" subtitle="Choose the alerts you want to receive.">
          {[
            ['Report updates', 'Status changes and city updates', reportAlerts, setReportAlerts],
            ['Reward updates', 'New points and redemptions', rewardAlerts, setRewardAlerts],
          ].map(([title, text, enabled, setEnabled]) => (
            <button
              key={title as string}
              onClick={() => (setEnabled as (next: boolean) => void)(!(enabled as boolean))}
              className="w-full flex items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0 text-left"
            >
              <div className="min-w-0">
                <p className="text-[#08122D] text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 850 }}>{title as string}</p>
                <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{text as string}</p>
              </div>
              <span
                className="w-12 h-7 rounded-full p-1 flex-shrink-0 transition-all"
                style={{ background: enabled ? '#0B5CFF' : '#E5E7EB' }}
              >
                <span className="block w-5 h-5 rounded-full bg-white transition-all" style={{ transform: enabled ? 'translateX(20px)' : 'translateX(0)' }} />
              </span>
            </button>
          ))}
          <div className="mt-4 rounded-2xl bg-[#F5F8FF] p-3 flex gap-2">
            <CheckCircle2 size={17} className="text-[#0B5CFF] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Changes are saved for this demo session and keep the profile screen uncluttered.
            </p>
          </div>
        </Sheet>
      )}
    </div>
  );
}

function Sheet({ children, onClose, subtitle, title }: { children: ReactNode; onClose: () => void; subtitle: string; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 bg-[#08122D]/45 flex items-end px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 28 }}
        animate={{ y: 0 }}
        className="w-full rounded-3xl bg-white shadow-xl p-5"
        style={{ marginBottom: 'var(--cg-bottom-gap)', maxHeight: 'calc(100% - var(--cg-safe-top) - var(--cg-bottom-gap) - 24px)', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="text-[#08122D] text-base" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900 }}>{title}</p>
            <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{subtitle}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <X size={17} className="text-[#08122D]" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
