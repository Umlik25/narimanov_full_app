import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
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

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showGlobalMenu, setShowGlobalMenu] = useState(false);
  const [issues, setIssues] = useState<Issue[]>(() => getMockSnapshot().issues);
  const [dataSource, setDataSource] = useState<'backend' | 'mock'>('mock');
  const [localIssuePhotos, setLocalIssuePhotos] = useState<Record<number, string>>({});
  const [pendingReportPhoto, setPendingReportPhoto] = useState<File | null>(null);

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

  const handleSubmitIssue = async (draft: IssueDraft) => {
    if (dataSource !== 'backend') {
      setPendingReportPhoto(null);
      setScreen('my_reports');
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
        return <RewardsScreen onBack={mapBack} />;
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
      </div>
    </div>
  );
}
