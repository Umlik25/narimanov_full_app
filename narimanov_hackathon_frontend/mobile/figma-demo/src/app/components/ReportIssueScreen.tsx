import { useState } from "react";
import { ArrowLeft, Camera, MapPin, Bot, CheckCircle, Ticket } from "lucide-react";
import { IssueCategory, IssuePriority, CATEGORY_LABELS, CATEGORY_ICONS } from "./mockData";

interface Props {
  onBack: () => void;
  onSubmit: () => void;
}

const categories: IssueCategory[] = ['road', 'lighting', 'trash', 'flooding', 'infrastructure', 'greenery', 'other'];
const categoryRewards: Record<IssueCategory, number> = {
  road: 80,
  lighting: 55,
  trash: 95,
  flooding: 120,
  infrastructure: 60,
  greenery: 45,
  other: 30,
};

export function ReportIssueScreen({ onBack, onSubmit }: Props) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | null>(null);
  const [description, setDescription] = useState('');
  const [photoAdded, setPhotoAdded] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoAdd = () => {
    setPhotoAdded(true);
    setTimeout(() => setShowAI(true), 800);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(onSubmit, 2000);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#F5F7FB] px-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="text-[#08122D] text-xl mb-2 text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
          Report Submitted!
        </h2>
        <p className="text-gray-500 text-sm text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
          Your issue has been reported and is now under review. You can track it in My Reports.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F5F7FB]">
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 pt-12 pb-5"
        style={{ background: 'linear-gradient(135deg, #08122D 0%, #0B5CFF 100%)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-white text-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
            Report an Issue
          </h1>
        </div>
        {/* Step indicator */}
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full transition-all"
              style={{ background: step >= s ? 'white' : 'rgba(255,255,255,0.3)' }}
            />
          ))}
        </div>
        <p className="text-white/70 text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Step {step} of 3 — {step === 1 ? 'Photo & Category' : step === 2 ? 'Location & Description' : 'Review & Submit'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {step === 1 && (
          <>
            {/* Photo picker */}
            <div className="mb-5">
              <p className="text-[#08122D] text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Add Photo
              </p>
              {!photoAdded ? (
                <div className="flex gap-3">
                  {['Take Photo', 'Upload Photo'].map(label => (
                    <button
                      key={label}
                      onClick={handlePhotoAdd}
                      className="flex-1 flex flex-col items-center justify-center gap-2 h-28 rounded-2xl border-2 border-dashed border-gray-300 bg-white"
                    >
                      <Camera size={24} className="text-gray-400" />
                      <span className="text-gray-500 text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden h-44 bg-gray-200">
                  <img
                    src="https://images.unsplash.com/photo-1779179015285-120aaa822b1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
                    className="w-full h-full object-cover"
                    alt="Issue"
                  />
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    ✓ Added
                  </div>
                </div>
              )}
            </div>

            {/* AI suggestion */}
            {showAI && (
              <div className="mb-5 rounded-2xl overflow-hidden border border-purple-200 bg-purple-50">
                <div className="flex items-center gap-2 px-4 py-3 bg-purple-100">
                  <Bot size={16} className="text-purple-700" />
                  <span className="text-purple-700 text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                    AI Suggestion
                  </span>
                  <span className="ml-auto text-purple-600 text-xs" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    94% confidence
                  </span>
                </div>
                <div className="px-4 py-3 grid grid-cols-2 gap-2">
                  {[
                    { label: 'Category', value: '🚧 Road Damage' },
                    { label: 'Priority', value: '🔴 High' },
                    { label: 'Department', value: 'Road Repair Dept' },
                    { label: 'Reward', value: '+80 points' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-purple-400 text-xs mb-0.5" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{label}</p>
                      <p className="text-purple-900 text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category selection */}
            <p className="text-[#08122D] text-sm mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Select Category
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="flex items-center gap-3 p-4 rounded-2xl border-2 bg-white transition-all"
                  style={{
                    borderColor: selectedCategory === cat ? '#0B5CFF' : '#E5E7EB',
                    background: selectedCategory === cat ? '#EEF3FF' : 'white',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{CATEGORY_ICONS[cat]}</span>
                  <span className="flex-1 text-left">
                    <span
                      className="block text-sm"
                      style={{
                        fontFamily: 'Inter, sans-serif', fontWeight: 600,
                        color: selectedCategory === cat ? '#0B5CFF' : '#08122D',
                      }}
                    >
                      {CATEGORY_LABELS[cat]}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 mt-1 text-[10px]"
                      style={{ color: '#16A34A', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
                    >
                      <Ticket size={10} />
                      +{categoryRewards[cat]} pts
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedCategory}
              className="w-full py-4 rounded-2xl text-white"
              style={{
                background: selectedCategory ? 'linear-gradient(135deg, #0B5CFF, #1a3a8f)' : '#D1D5DB',
                fontFamily: 'Inter, sans-serif', fontWeight: 600,
              }}
            >
              Next: Location & Details
            </button>
          </>
        )}

        {step === 2 && (
          <>
            {/* Location */}
            <p className="text-[#08122D] text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Location
            </p>
            <div className="flex items-center bg-white rounded-2xl px-4 py-3.5 gap-3 mb-2 border border-gray-200">
              <MapPin size={18} className="text-[#0B5CFF] flex-shrink-0" />
              <span className="text-[#08122D] text-sm flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Haji Murad St, Narimanov, Baku
              </span>
              <span className="text-[#0B5CFF] text-xs" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Auto</span>
            </div>
            <button className="flex items-center gap-2 text-[#0B5CFF] text-sm mb-5" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              <MapPin size={14} />
              Pick on map
            </button>

            {/* Description */}
            <p className="text-[#08122D] text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Description
            </p>
            <textarea
              className="w-full bg-white rounded-2xl p-4 text-sm text-[#08122D] placeholder-gray-400 outline-none border border-gray-200 resize-none mb-6"
              style={{ fontFamily: 'Inter, sans-serif', minHeight: '120px' }}
              placeholder="Describe the issue in detail... What do you see? How severe is it?"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-[#08122D]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-4 rounded-2xl text-white"
                style={{ background: 'linear-gradient(135deg, #0B5CFF, #1a3a8f)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              >
                Review
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-[#08122D] text-sm mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Review Your Report
            </p>

            {/* Summary card */}
            <div className="bg-white rounded-2xl overflow-hidden mb-5 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1779179015285-120aaa822b1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
                className="w-full h-40 object-cover"
                alt="Issue"
              />
              <div className="p-4">
                {[
                  { label: 'Category', value: selectedCategory ? `${CATEGORY_ICONS[selectedCategory]} ${CATEGORY_LABELS[selectedCategory]}` : '-' },
                  { label: 'Location', value: 'Haji Murad St, Narimanov' },
                  { label: 'AI Priority', value: '🔴 High' },
                  { label: 'AI Department', value: 'Road Repair Dept' },
                  { label: 'Reward Points', value: selectedCategory ? `+${categoryRewards[selectedCategory]} pts` : '+80 pts' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-500 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</span>
                    <span className="text-[#08122D] text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-[#08122D]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              >
                Edit
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-4 rounded-2xl text-white"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803d)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              >
                Submit Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
