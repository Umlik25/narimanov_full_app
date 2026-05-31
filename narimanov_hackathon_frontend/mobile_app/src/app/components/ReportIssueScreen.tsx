import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { ArrowLeft, Camera, MapPin, Ticket, ImagePlus, Loader2 } from "lucide-react";
import { IssueCategory, CATEGORY_LABELS } from "./mockData";
import { IssueDraft } from "../api/backend";
import { CategoryIcon } from "./CategoryIcon";

interface Props {
  initialPhotoFile?: File | null;
  onBack: () => void;
  onSubmit: (draft: IssueDraft) => Promise<void> | void;
}

const categories: IssueCategory[] = ['road', 'lighting', 'trash', 'flooding', 'infrastructure', 'greenery', 'other'];

const categoryRewards: Record<IssueCategory, number> = {
  road: 50,
  lighting: 50,
  trash: 50,
  flooding: 50,
  infrastructure: 50,
  greenery: 50,
  other: 50,
};

export function ReportIssueScreen({ initialPhotoFile, onBack, onSubmit }: Props) {
  const [step, setStep] = useState(initialPhotoFile ? 2 : 1);
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoAdded, setPhotoAdded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');

  const setSelectedPhoto = useCallback((file: File) => {
    setPhotoFile(file);
    setPhotoPreviewUrl(current => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setPhotoAdded(true);
  }, []);

  const handlePhotoSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setSelectedPhoto(file);
    setStep(2);
    event.target.value = '';
  };

  useEffect(() => {
    if (!initialPhotoFile) return;
    setSelectedPhoto(initialPhotoFile);
    setStep(2);
  }, [initialPhotoFile, setSelectedPhoto]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  const requestDeviceLocation = useCallback(() => {
    if (window.isSecureContext === false) {
      setCoordinates(null);
      setLocationError('GPS requires a secure HTTPS link on mobile.');
      setIsLocating(false);
      return;
    }

    if (!navigator.geolocation) {
      setLocationError('Location is not available on this device.');
      setIsLocating(false);
      return;
    }

    setIsLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextCoordinates = {
          lat: Number(coords.latitude.toFixed(6)),
          lng: Number(coords.longitude.toFixed(6)),
        };
        setCoordinates(nextCoordinates);
        setIsLocating(false);
      },
      () => {
        setCoordinates(null);
        setLocationError('GPS access is required to submit a report.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }, []);

  useEffect(() => {
    requestDeviceLocation();
  }, [requestDeviceLocation]);

  const handleSubmit = async () => {
    if (!selectedCategory || !coordinates || !title.trim() || !description.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
      category: selectedCategory,
      description: description.trim(),
      location: `Latitude ${coordinates.lat}, Longitude ${coordinates.lng}`,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      priority: selectedCategory === 'flooding' ? 'critical' : selectedCategory === 'road' || selectedCategory === 'trash' ? 'high' : 'medium',
      title: title.trim(),
      photoFile: photoFile || undefined,
      photoPreviewUrl: photoPreviewUrl || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {[1, 2].map(s => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full transition-all"
              style={{ background: step >= s ? 'white' : 'rgba(255,255,255,0.3)' }}
            />
          ))}
        </div>
        <p className="text-white/70 text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Step {Math.min(step, 2)} of 2 — {step === 1 ? 'Photo' : 'Category, Details & GPS'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {step === 1 && (
          <>
            {/* Photo picker */}
            <div className="mb-5">
              <p className="text-[#08122D] text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Add Photo First
              </p>
              {!photoAdded ? (
                <div className="flex gap-3">
                  <input id="issue-photo-camera" className="hidden" type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} />
                  <input id="issue-photo-upload" className="hidden" type="file" accept="image/*" onChange={handlePhotoSelect} />
                  {[
                    { label: 'Take Photo', id: 'issue-photo-camera', icon: <Camera size={24} className="text-gray-400" /> },
                    { label: 'Upload Photo', id: 'issue-photo-upload', icon: <ImagePlus size={24} className="text-gray-400" /> },
                  ].map(({ label, id, icon }) => (
                    <label
                      key={label}
                      htmlFor={id}
                      className="flex-1 flex flex-col items-center justify-center gap-2 h-28 rounded-2xl border-2 border-dashed border-gray-300 bg-white cursor-pointer"
                    >
                      {icon}
                      <span className="text-gray-500 text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden h-44 bg-gray-200">
                  <img
                    src={photoPreviewUrl}
                    className="w-full h-full object-cover"
                    alt={photoFile?.name || "Selected issue"}
                  />
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    ✓ Added
                  </div>
                  <label
                    htmlFor="issue-photo-upload-replace"
                    className="absolute bottom-3 left-3 bg-white text-[#08122D] text-xs px-3 py-2 rounded-xl cursor-pointer"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
                  >
                    Change photo
                  </label>
                  <input id="issue-photo-upload-replace" className="hidden" type="file" accept="image/*" onChange={handlePhotoSelect} />
                  {photoFile && (
                    <div className="absolute bottom-3 right-3 max-w-[52%] truncate bg-black/60 text-white text-xs px-3 py-2 rounded-xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {photoFile.name}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!photoAdded}
              className="w-full py-4 rounded-2xl text-white"
              style={{
                background: photoAdded ? 'linear-gradient(135deg, #0B5CFF, #1a3a8f)' : '#D1D5DB',
                fontFamily: 'Inter, sans-serif', fontWeight: 600,
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            {photoPreviewUrl && (
              <div className="relative rounded-2xl overflow-hidden h-40 bg-gray-200 mb-5">
                <img
                  src={photoPreviewUrl}
                  className="w-full h-full object-cover"
                  alt={photoFile?.name || "Selected issue"}
                />
                <label
                  htmlFor="issue-photo-upload-replace-details"
                  className="absolute bottom-3 left-3 bg-white text-[#08122D] text-xs px-3 py-2 rounded-xl cursor-pointer"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
                >
                  Retake photo
                </label>
                <input id="issue-photo-upload-replace-details" className="hidden" type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} />
              </div>
            )}

            {/* Category selection */}
            <p className="text-[#08122D] text-sm mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Select Category
            </p>
            <div className="grid grid-cols-2 gap-3 mb-5">
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
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#F5F7FB]">
                    <CategoryIcon category={cat} size={22} color={selectedCategory === cat ? '#0B5CFF' : undefined} />
                  </span>
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

            {/* Title */}
            <p className="text-[#08122D] text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Problem Title
            </p>
            <input
              className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm text-[#08122D] placeholder-gray-400 outline-none border border-gray-200 mb-5"
              style={{ fontFamily: 'Inter, sans-serif' }}
              placeholder="Example: Broken street light near my building"
              value={title}
              maxLength={255}
              onChange={e => setTitle(e.target.value)}
            />

            {/* Location */}
            <p className="text-[#08122D] text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              GPS Location
            </p>
            <div className="flex items-center bg-white rounded-2xl px-4 py-3.5 gap-3 mb-2 border border-gray-200">
              <MapPin size={18} className="text-[#0B5CFF] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[#08122D] text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                  {coordinates ? `${coordinates.lat}, ${coordinates.lng}` : isLocating ? 'Getting GPS location...' : 'GPS location required'}
                </p>
                <p className="text-gray-400 text-xs mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Automatically captured from this device
                </p>
              </div>
              {isLocating && <Loader2 size={16} className="text-[#0B5CFF] animate-spin flex-shrink-0" />}
            </div>
            {locationError && (
              <div className="mb-5">
                <p className="text-red-500 text-xs mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>{locationError}</p>
                <button onClick={requestDeviceLocation} className="text-[#0B5CFF] text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                  Retry GPS
                </button>
              </div>
            )}
            {!locationError && <div className="mb-5" />}

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
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedCategory || !coordinates || !title.trim() || !description.trim()}
                className="flex-1 py-4 rounded-2xl text-white"
                style={{ background: selectedCategory && coordinates && title.trim() && description.trim() ? 'linear-gradient(135deg, #16A34A, #15803d)' : '#D1D5DB', fontFamily: 'Inter, sans-serif', fontWeight: 600, opacity: isSubmitting ? 0.75 : 1 }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
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
              {photoPreviewUrl ? (
                <img
                  src={photoPreviewUrl}
                  className="w-full h-40 object-cover"
                  alt={photoFile?.name || "Selected issue"}
                />
              ) : (
                <div className="h-40 bg-gray-100 flex flex-col items-center justify-center gap-2">
                  <ImagePlus size={24} className="text-gray-400" />
                  <span className="text-gray-500 text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>No photo selected</span>
                </div>
              )}
              <div className="p-4">
                {[
                  { label: 'Title', value: title.trim() || '-' },
                  { label: 'Category', value: selectedCategory ? CATEGORY_LABELS[selectedCategory] : '-' },
                  { label: 'GPS', value: coordinates ? `${coordinates.lat}, ${coordinates.lng}` : 'Required' },
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
                disabled={isSubmitting || !selectedCategory || !coordinates || !title.trim() || !description.trim()}
                className="flex-1 py-4 rounded-2xl text-white"
                style={{ background: selectedCategory && coordinates && title.trim() && description.trim() ? 'linear-gradient(135deg, #16A34A, #15803d)' : '#D1D5DB', fontFamily: 'Inter, sans-serif', fontWeight: 600, opacity: isSubmitting ? 0.75 : 1 }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
