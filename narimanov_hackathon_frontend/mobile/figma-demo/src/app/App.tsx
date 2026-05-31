import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LoginScreen } from "./components/LoginScreen";
import { SignUpScreen } from "./components/SignUpScreen";
import { MapScreen } from "./components/MapScreen";
import { ReportIssueScreen } from "./components/ReportIssueScreen";
import { MyReportsScreen } from "./components/MyReportsScreen";
import { UserReportDetails } from "./components/UserReportDetails";
import { AdminIssueDetails } from "./components/AdminIssueDetails";
import { AdminAIReview } from "./components/AdminAIReview";
import { AdminOperations } from "./components/AdminOperations";
import { AdminAnalytics } from "./components/AdminAnalytics";
import { AIChatScreen } from "./components/AIChatScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { AdminAllIssues } from "./components/AdminAllIssues";
import { RewardsScreen } from "./components/RewardsScreen";
import { HamburgerMenu } from "./components/HamburgerMenu";
import { Issue } from "./components/mockData";

type Screen =
  | 'login' | 'signup'
  | 'user_map' | 'admin_map'
  | 'report_issue' | 'my_reports' | 'user_report_details'
  | 'admin_issue_details' | 'admin_ai_review' | 'admin_operations'
  | 'admin_analytics' | 'admin_all_issues'
  | 'ai_chat' | 'profile' | 'rewards';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showGlobalMenu, setShowGlobalMenu] = useState(false);

  const userName = role === 'admin' ? 'Rauf Həsənov' : 'Anar Məmmədov';

  const handleLogin = (r: 'user' | 'admin') => {
    setRole(r);
    setScreen(r === 'admin' ? 'admin_map' : 'user_map');
  };

  const handleLogout = () => {
    setScreen('login');
    setRole('user');
  };

  const handleViewIssueDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setScreen(role === 'admin' ? 'admin_issue_details' : 'user_report_details');
  };

  const handleNavigate = (s: string) => {
    setScreen(s as Screen);
    setShowGlobalMenu(false);
  };

  const handleSwitchRole = (r: 'user' | 'admin') => {
    setRole(r);
    setScreen(r === 'admin' ? 'admin_map' : 'user_map');
  };

  const mapBack = () => setScreen(role === 'admin' ? 'admin_map' : 'user_map');

  const renderScreen = () => {
    switch (screen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} onSignUp={() => setScreen('signup')} />;
      case 'signup':
        return <SignUpScreen onBack={() => setScreen('login')} onSignUp={() => handleLogin('user')} />;
      case 'user_map':
        return <MapScreen role="user" currentScreen="user_map" onNavigate={handleNavigate} onLogout={handleLogout} onViewIssueDetails={handleViewIssueDetails} userName={userName} />;
      case 'admin_map':
        return <MapScreen role="admin" currentScreen="admin_map" onNavigate={handleNavigate} onLogout={handleLogout} onViewIssueDetails={handleViewIssueDetails} userName={userName} />;
      case 'report_issue':
        return <ReportIssueScreen onBack={mapBack} onSubmit={() => setScreen('my_reports')} />;
      case 'my_reports':
        return <MyReportsScreen onBack={mapBack} onViewDetails={handleViewIssueDetails} onMenu={() => setShowGlobalMenu(true)} />;
      case 'rewards':
        return <RewardsScreen onBack={mapBack} />;
      case 'user_report_details':
        return selectedIssue ? <UserReportDetails issue={selectedIssue} onBack={() => setScreen('my_reports')} /> : null;
      case 'admin_issue_details':
        return selectedIssue ? <AdminIssueDetails issue={selectedIssue} onBack={mapBack} /> : null;
      case 'admin_ai_review':
        return <AdminAIReview onBack={mapBack} />;
      case 'admin_all_issues':
        return <AdminAllIssues onBack={mapBack} onViewDetails={handleViewIssueDetails} />;
      case 'admin_operations':
        return <AdminOperations onBack={mapBack} />;
      case 'admin_analytics':
        return <AdminAnalytics onBack={mapBack} />;
      case 'ai_chat':
        return <AIChatScreen role={role} onBack={mapBack} />;
      case 'profile':
        return <ProfileScreen role={role} onBack={mapBack} onLogout={handleLogout} onSwitchRole={handleSwitchRole} userName={userName} />;
      default:
        return <LoginScreen onLogin={handleLogin} onSignUp={() => setScreen('signup')} />;
    }
  };

  return (
    <div
      className="size-full flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Mobile phone frame */}
      <div
        className="relative"
        style={{
          width: 390,
          height: '100vh',
          maxHeight: 844,
          borderRadius: 40,
          overflow: 'hidden',
          touchAction: 'none',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
          background: '#F5F7FB',
        }}
      >
        {/* Screen content with transitions */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "absolute", inset: 0, willChange: "transform, opacity" }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global overlay menu */}
        <AnimatePresence>
          {showGlobalMenu && (
            <div className="absolute inset-0 z-50">
              <HamburgerMenu
                role={role}
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
