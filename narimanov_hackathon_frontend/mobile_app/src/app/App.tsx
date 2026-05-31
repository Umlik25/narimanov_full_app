import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "motion/react";
import { Gift, Wifi, X } from "lucide-react";
import { LoginScreen } from "./components/LoginScreen";
import { SignUpScreen } from "./components/SignUpScreen";
import { MapScreen } from "./components/MapScreen";
import { ReportIssueScreen } from "./components/ReportIssueScreen";
import { MyReportsScreen } from "./components/MyReportsScreen";
import { UserReportDetails } from "./components/UserReportDetails";
import { AIChatScreen } from "./components/AIChatScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { RewardsScreen } from "./components/RewardsScreen";
import { WaterManagementScreen } from "./components/WaterManagementScreen";
import { HamburgerMenu } from "./components/HamburgerMenu";
import { Issue } from "./components/mockData";
import {
  IssueDraft,
  createIssue,
  fetchBackendSnapshot,
  getMockSnapshot,
} from "./api/backend";

type Screen =
  | 'login' | 'signup'
  | 'user_map'
  | 'report_issue' | 'my_reports' | 'user_report_details'
  | 'ai_chat' | 'profile' | 'rewards' | 'water_management';

const DEMO_REPORT_REWARD_POINTS = 50;
const STARTING_REWARD_POINTS = 750;

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showGlobalMenu, setShowGlobalMenu] = useState(false);
  const [issues, setIssues] = useState<Issue[]>(() => getMockSnapshot().issues);
  const [dataSource, setDataSource] = useState<'backend' | 'mock'>('mock');
  const [localIssuePhotos, setLocalIssuePhotos] = useState<Record<number, string>>({});
  const [pendingReportPhoto, setPendingReportPhoto] = useState<File | null>(null);
  const [rewardPoints, setRewardPoints] = useState(STARTING_REWARD_POINTS);
  const [rewardCelebration, setRewardCelebration] = useState<{ id: number; points: number } | null>(null);
  const [focusInternetReward, setFocusInternetReward] = useState(false);

  const userName = 'Anar Məmmədov';

  const handleLogin = () => {
    setScreen('user_map');
  };

  const applyLocalIssuePhotos = useCallback((items: Issue[], photos = localIssuePhotos) => {
    return items.map(issue => issue.backendId && photos[issue.backendId] ? { ...issue, photo: photos[issue.backendId] } : issue);
  }, [localIssuePhotos]);

  const refreshBackendData = useCallback(async () => {
    const snapshot = await fetchBackendSnapshot();
    setIssues(applyLocalIssuePhotos(snapshot.issues));
    setDataSource(snapshot.source);
  }, [applyLocalIssuePhotos]);

  useEffect(() => {
    refreshBackendData();
  }, [refreshBackendData]);

  const handleLogout = () => {
    setScreen('login');
  };

  const handleViewIssueDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setScreen('user_report_details');
  };

  const handleNavigate = (s: string) => {
    if (s === 'report_issue') setPendingReportPhoto(null);
    setScreen(s as Screen);
    setShowGlobalMenu(false);
  };

  const mapBack = () => {
    setPendingReportPhoto(null);
    setScreen('user_map');
  };

  const handleStartReportWithPhoto = (file: File) => {
    setPendingReportPhoto(file);
    setScreen('report_issue');
  };

  const scheduleDemoReward = useCallback(() => {
    window.setTimeout(() => {
      setRewardPoints((current) => current + DEMO_REPORT_REWARD_POINTS);
      setRewardCelebration({ id: Date.now(), points: DEMO_REPORT_REWARD_POINTS });
    }, 1000);
  }, []);

  const handleSubmitIssue = async (draft: IssueDraft) => {
    if (dataSource !== 'backend') {
      setPendingReportPhoto(null);
      setScreen('my_reports');
      scheduleDemoReward();
      return;
    }

    try {
      const created = await createIssue(draft);
      const nextLocalPhotos = created.backendId && draft.photoPreviewUrl
        ? { ...localIssuePhotos, [created.backendId]: draft.photoPreviewUrl }
        : localIssuePhotos;
      if (nextLocalPhotos !== localIssuePhotos) setLocalIssuePhotos(nextLocalPhotos);
      setIssues(prev => applyLocalIssuePhotos([created, ...prev], nextLocalPhotos));
      setPendingReportPhoto(null);
      setScreen('my_reports');
      scheduleDemoReward();
      fetchBackendSnapshot()
        .then(snapshot => {
          setIssues(applyLocalIssuePhotos(snapshot.issues, nextLocalPhotos));
          setDataSource(snapshot.source);
        })
        .catch(error => console.warn('Issue list refresh failed after submit.', error));
      return;
    } catch (error) {
      console.warn('Issue submission failed, keeping demo flow available.', error);
    }
    setPendingReportPhoto(null);
    setScreen('my_reports');
    scheduleDemoReward();
  };

  const renderMapShell = () => {
    const isCityMap = screen === 'user_map';
    const isRainMap = screen === 'water_management';

    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#F4F8FF" }}>
        <div
          aria-hidden={!isCityMap}
          style={{
            inset: 0,
            opacity: isCityMap ? 1 : 0,
            pointerEvents: isCityMap ? "auto" : "none",
            position: "absolute",
            transition: "opacity 120ms ease",
            visibility: isCityMap ? "visible" : "hidden",
            zIndex: isCityMap ? 2 : 1,
          }}
        >
          <MapScreen currentScreen="user_map" issues={issues} onNavigate={handleNavigate} onLogout={handleLogout} onStartReportWithPhoto={handleStartReportWithPhoto} onViewIssueDetails={handleViewIssueDetails} userName={userName} />
        </div>

        <div
          aria-hidden={!isRainMap}
          style={{
            inset: 0,
            opacity: isRainMap ? 1 : 0,
            pointerEvents: isRainMap ? "auto" : "none",
            position: "absolute",
            transition: "opacity 120ms ease",
            visibility: isRainMap ? "visible" : "hidden",
            zIndex: isRainMap ? 2 : 1,
          }}
        >
          <WaterManagementScreen onBack={mapBack} onMenu={() => setShowGlobalMenu(true)} />
        </div>
      </div>
    );
  };

  const renderScreen = () => {
    switch (screen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} onSignUp={() => setScreen('signup')} />;
      case 'signup':
        return <SignUpScreen onBack={() => setScreen('login')} onSignUp={handleLogin} />;
      case 'user_map':
      case 'water_management':
        return renderMapShell();
      case 'report_issue':
        return <ReportIssueScreen initialPhotoFile={pendingReportPhoto} onBack={mapBack} onSubmit={handleSubmitIssue} />;
      case 'my_reports':
        return <MyReportsScreen issues={issues} onBack={mapBack} onViewDetails={handleViewIssueDetails} onMenu={() => setShowGlobalMenu(true)} />;
      case 'rewards':
        return (
          <RewardsScreen
            autoOpenDataPack={focusInternetReward}
            demoAwardEarned={rewardPoints > STARTING_REWARD_POINTS}
            earnedPoints={rewardPoints}
            onAutoOpenHandled={() => setFocusInternetReward(false)}
            onBack={mapBack}
          />
        );
      case 'user_report_details':
        return selectedIssue ? <UserReportDetails issue={selectedIssue} onBack={() => setScreen('my_reports')} /> : null;
      case 'ai_chat':
        return <AIChatScreen onBack={mapBack} />;
      case 'profile':
        return <ProfileScreen onBack={mapBack} onLogout={handleLogout} userName={userName} />;
      default:
        return <LoginScreen onLogin={handleLogin} onSignUp={() => setScreen('signup')} />;
    }
  };

  return (
    <div
      className="size-full"
      style={{
        background: '#08122D',
        fontFamily: 'Inter, sans-serif',
        height: '100vh',
        inset: 0,
        overflow: 'hidden',
        position: 'fixed',
        width: '100vw',
      }}
    >
      <div
        className="relative"
        style={{
          background: '#08122D',
          height: '100%',
          overflow: 'hidden',
          touchAction: 'manipulation',
          width: '100%',
        }}
      >
        {/* Screen content */}
        <div className="absolute inset-0 overflow-hidden">
          {screen !== 'login' && screen !== 'signup' && renderMapShell()}
          {(screen === 'login' || screen === 'signup') && renderScreen()}
          {screen !== 'login' && screen !== 'signup' && screen !== 'user_map' && screen !== 'water_management' && (
            <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
              {renderScreen()}
            </div>
          )}
        </div>

        {/* Global overlay menu */}
        <AnimatePresence>
          {showGlobalMenu && (
            <div className="absolute inset-0 z-50">
              <HamburgerMenu
                currentScreen={screen}
                onNavigate={handleNavigate}
                onClose={() => setShowGlobalMenu(false)}
                onLogout={handleLogout}
                userName={userName}
              />
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {rewardCelebration && (
            <RewardCelebration
              key={rewardCelebration.id}
              points={rewardCelebration.points}
              totalPoints={rewardPoints}
              onClose={() => setRewardCelebration(null)}
              onRewards={() => {
                setRewardCelebration(null);
                setFocusInternetReward(true);
                setScreen('rewards');
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function RewardCelebration({
  onClose,
  onRewards,
  points,
  totalPoints,
}: {
  onClose: () => void;
  onRewards: () => void;
  points: number;
  totalPoints: number;
}) {
  useEffect(() => {
    const colors = ["#0B5CFF", "#7C3AED", "#16A34A", "#F97316", "#FDE047"];
    confetti({ particleCount: 90, spread: 72, origin: { x: 0.5, y: 0.28 }, colors, zIndex: 1000, disableForReducedMotion: true });
    window.setTimeout(() => {
      confetti({ particleCount: 55, angle: 60, spread: 58, origin: { x: 0.08, y: 0.62 }, colors, zIndex: 1000, disableForReducedMotion: true });
      confetti({ particleCount: 55, angle: 120, spread: 58, origin: { x: 0.92, y: 0.62 }, colors, zIndex: 1000, disableForReducedMotion: true });
    }, 180);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-[80] flex items-end justify-center bg-[#08122D]/35 px-5 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white p-5 shadow-2xl"
        initial={{ y: 34, scale: 0.94 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 24, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
      >
        <button
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F6FF] text-[#08122D]"
          onClick={onClose}
          aria-label="Close reward"
        >
          <X size={17} />
        </button>

        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EAF7EF] text-[#16A34A]">
          <Gift size={31} />
        </div>

        <p className="mt-5 text-sm text-[#0B5CFF]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}>
          Report accepted
        </p>
        <h2 className="mt-1 text-[30px] leading-tight text-[#08122D]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 950 }}>
          You earned +{points} bonuses
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-500" style={{ fontFamily: "Inter, sans-serif" }}>
          Thanks for reporting the broken bench. Your balance is now {totalPoints} points, enough to redeem an internet data pack.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-[#F5F8FF] p-4">
            <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500" style={{ fontFamily: "Inter, sans-serif", fontWeight: 850 }}>Balance</p>
            <p className="mt-1 text-2xl text-[#08122D]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 950 }}>{totalPoints}</p>
          </div>
          <div className="rounded-3xl bg-[#F5F8FF] p-4">
            <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500" style={{ fontFamily: "Inter, sans-serif", fontWeight: 850 }}>Coupons</p>
            <p className="mt-1 text-2xl text-[#08122D]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 950 }}>{Math.floor(totalPoints / 100)}</p>
          </div>
        </div>

        <button
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-3xl bg-[#0B5CFF] py-4 text-white shadow-lg shadow-blue-500/25"
          onClick={onRewards}
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 900 }}
        >
          <Wifi size={20} />
          Buy internet gigabytes
        </button>
      </motion.div>
    </motion.div>
  );
}
