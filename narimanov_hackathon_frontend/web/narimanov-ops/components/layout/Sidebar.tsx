import { colors, radius } from '@/constants/theme';
import { useDemo } from '@/store/DemoContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
type NavItem = { badge?: number; href: string; icon: IconName; label: string };

const adminItems: NavItem[] = [
  { href: '/admin/dashboard', icon: 'view-dashboard-outline', label: 'Dashboard' },
  { href: '/admin/map', icon: 'map-marker-radius-outline', label: 'Live Map' },
  { href: '/report', icon: 'file-document-edit-outline', label: 'Manual Report' },
  { href: '/admin/ai-review', icon: 'robot-outline', label: 'AI Review' },
  { href: '/tasks', icon: 'clipboard-check-outline', label: 'Operations' },
  { href: '/admin/analytics', icon: 'chart-box-outline', label: 'Analytics' },
];

const userItems: NavItem[] = [
  { href: '/report', icon: 'file-document-edit-outline', label: 'Report Issue' },
  { href: '/admin/map', icon: 'map-marker-radius-outline', label: 'Live Map' },
  { href: '/my-reports', icon: 'clipboard-text-outline', label: 'My Reports' },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type SidebarProps = {
  compact?: boolean;
};

export function Sidebar({ compact = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { issues, pendingAiCount, role, setRole } = useDemo();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'summary' | 'overdue' | 'urgent'>('summary');
  const profile = role === 'admin'
    ? { avatar: 'A', name: 'Admin', role: 'Super Admin' }
    : { avatar: 'U', name: 'Citizen User', role: 'User' };
  const items = role === 'admin'
    ? adminItems.map((item) => item.href === '/admin/ai-review' ? { ...item, badge: pendingAiCount } : item)
    : userItems;

  if (compact) {
    return (
      <View style={styles.bottomNav}>
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href as never)}
              style={[styles.bottomItem, active && styles.bottomItemActive]}>
              <MaterialCommunityIcons name={item.icon} size={22} color={active ? colors.primary : '#34406B'} />
              <Text style={[styles.bottomText, active && styles.bottomTextActive]} numberOfLines={1}>{item.label.replace('Manual ', '')}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.sidebar}>
      <View style={styles.brandRow}>
        <View style={styles.logo}>
          <MaterialCommunityIcons name="bank-outline" size={28} color={colors.white} />
        </View>
        <View>
          <Text style={styles.brandTitle}>NARIMANOV OPS</Text>
          <Text style={styles.brandSub}>District Operations System</Text>
        </View>
      </View>

      <View style={styles.nav}>
        {items.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href as never)}
              style={active ? styles.navItemActiveMerged : styles.navItem}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={21}
                  color={active ? colors.white : '#34406B'}
                />
                <Text style={[styles.navText, active && styles.navTextActive]}>{item.label}</Text>
                {item.badge ? (
                  <View style={[styles.badge, active && styles.badgeActive]}>
                    <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{item.badge}</Text>
                  </View>
                ) : null}
              </Pressable>
          );
        })}
      </View>

      <View style={styles.spacer} />

      <Pressable onPress={() => setAssistantOpen(true)} style={styles.helpCard}>
        <View style={styles.helpIcon}>
          <MaterialCommunityIcons name="robot-happy-outline" size={20} color={colors.white} />
        </View>
        <View style={styles.helpCopy}>
          <Text style={styles.helpTitle}>Need help?</Text>
          <Text style={styles.helpText}>Ask our AI Assistant</Text>
        </View>
        <MaterialCommunityIcons name="arrow-right" size={18} color={colors.white} />
      </Pressable>

      <Pressable onPress={() => setProfileOpen((open) => !open)} style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.avatar}</Text>
        </View>
        <View style={styles.userCopy}>
          <Text style={styles.userName}>{profile.name}</Text>
          <Text style={styles.userRole}>{profile.role}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-down" size={18} color={colors.primaryDark} />
      </Pressable>
      {profileOpen ? (
        <View style={styles.profileMenu}>
          <Text style={styles.profileMenuTitle}>Demo profile</Text>
          {[
            ['View Profile', 'account-circle-outline', null],
            ['Switch to Admin', 'shield-account-outline', '/admin/dashboard'],
            ['Switch to User', 'account-outline', '/report'],
            ['Logout', 'logout', '/'],
          ].map(([label, icon, href]) => (
            <Pressable
              key={label as string}
              onPress={() => {
                if (label === 'View Profile') return;
                setProfileOpen(false);
                if (label === 'Switch to Admin') setRole('admin');
                if (label === 'Switch to User') setRole('user');
                if (href) router.replace(href as never);
              }}
              style={[styles.profileMenuItem, label === 'View Profile' && styles.profileSummaryItem]}>
              <MaterialCommunityIcons name={icon as IconName} size={18} color="#34406B" />
              <Text style={styles.profileMenuText}>
                {label === 'View Profile' ? `${profile.name} · ${profile.role}` : label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Modal transparent visible={assistantOpen} animationType="fade" onRequestClose={() => setAssistantOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAssistantOpen(false)}>
          <Pressable style={styles.assistantPanel}>
            <View style={styles.assistantHeader}>
              <View style={styles.assistantIcon}>
                <MaterialCommunityIcons name="robot-happy-outline" size={22} color={colors.white} />
              </View>
              <View style={styles.assistantTitleWrap}>
                <Text style={styles.assistantTitle}>Narimanov AI Assistant</Text>
                <Text style={styles.assistantSub}>Mock operational guidance</Text>
              </View>
              <Pressable onPress={() => setAssistantOpen(false)}>
                <MaterialCommunityIcons name="close" size={20} color="#34406B" />
              </Pressable>
            </View>
            {[
              ['Show overdue issues', 'overdue'],
              ['Summarize today’s district problems', 'summary'],
              ['Which issues need urgent action?', 'urgent'],
            ].map(([prompt, mode]) => (
              <Pressable key={prompt} onPress={() => setAssistantMode(mode as never)} style={[styles.promptChip, assistantMode === mode && styles.promptChipActive]}>
                <Text style={styles.promptText}>{prompt}</Text>
              </Pressable>
            ))}
            <View style={styles.assistantAnswer}>
              <Text style={styles.answerTitle}>{assistantMode === 'overdue' ? 'Overdue issues' : assistantMode === 'urgent' ? 'Urgent action list' : 'Today’s quick summary'}</Text>
              <Text style={styles.answerText}>
                {assistantMode === 'overdue'
                  ? issues.filter((issue) => issue.status === 'overdue').map((issue) => `${issue.id}: ${issue.title}`).join('\n') || 'No overdue issues right now.'
                  : assistantMode === 'urgent'
                    ? issues.filter((issue) => issue.priority === 'critical' || issue.status === 'overdue').slice(0, 4).map((issue) => `${issue.title} near ${issue.address}`).join('\n')
                    : `Road damage and flooding need the fastest response. ${pendingAiCount} AI detections are pending review, and overdue items should be assigned before the next shift handover.`}
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: colors.white,
    borderRightColor: colors.border,
    borderRightWidth: 1,
    flexShrink: 0,
    minHeight: '100%',
    padding: 18,
    width: 258,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 42,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: '#062A78',
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  brandTitle: {
    color: '#06113E',
    fontSize: 15,
    fontWeight: '900',
  },
  brandSub: {
    color: '#34406B',
    fontSize: 12,
    marginTop: 4,
  },
  nav: {
    gap: 8,
  },
  navItem: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 14,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  navItemActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { height: 14, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
  },
  navItemActiveMerged: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 14,
    minHeight: 54,
    paddingHorizontal: 14,
    shadowColor: colors.primary,
    shadowOffset: { height: 14, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
  },
  navText: {
    color: '#34406B',
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  navTextActive: {
    color: colors.white,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.purpleSoft,
    borderRadius: 999,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  badgeActive: {
    backgroundColor: colors.white,
  },
  badgeText: {
    color: colors.ai,
    fontSize: 12,
    fontWeight: '900',
  },
  badgeTextActive: {
    color: colors.primary,
  },
  spacer: {
    flex: 1,
  },
  helpCard: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    padding: 14,
  },
  helpIcon: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF24',
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  helpCopy: {
    flex: 1,
  },
  helpTitle: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  helpText: {
    color: '#DCE8FF',
    fontSize: 11,
    marginTop: 3,
  },
  userCard: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  profileMenu: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    bottom: 82,
    left: 18,
    padding: 10,
    position: 'absolute',
    right: 18,
    shadowColor: '#102044',
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  profileMenuTitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  profileMenuItem: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  profileSummaryItem: {
    backgroundColor: colors.surface,
  },
  profileMenuText: {
    color: '#06113E',
    fontSize: 13,
    fontWeight: '800',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.blueSoft,
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  avatarText: {
    color: colors.primaryDark,
    fontWeight: '900',
  },
  userCopy: {
    flex: 1,
  },
  userName: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  userRole: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: '#06113E66',
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  assistantPanel: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    maxWidth: 460,
    padding: 20,
    width: '100%',
  },
  assistantHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  assistantIcon: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  assistantTitleWrap: {
    flex: 1,
  },
  assistantTitle: {
    color: '#06113E',
    fontSize: 16,
    fontWeight: '900',
  },
  assistantSub: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  promptChip: {
    backgroundColor: colors.blueSoft,
    borderRadius: radius.sm,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  promptChipActive: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  promptText: {
    color: colors.primary,
    fontWeight: '800',
  },
  assistantAnswer: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginTop: 8,
    padding: 14,
  },
  answerTitle: {
    color: '#06113E',
    fontWeight: '900',
    marginBottom: 6,
  },
  answerText: {
    color: '#34406B',
    fontSize: 13,
    lineHeight: 20,
  },
  bottomNav: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    bottom: 12,
    flexDirection: 'row',
    gap: 3,
    left: 12,
    padding: 8,
    position: 'absolute',
    right: 12,
    shadowColor: '#102044',
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  bottomItem: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    gap: 3,
    minHeight: 54,
    justifyContent: 'center',
  },
  bottomItemActive: {
    backgroundColor: colors.blueSoft,
  },
  bottomText: {
    color: '#34406B',
    fontSize: 10,
    fontWeight: '800',
  },
  bottomTextActive: {
    color: colors.primary,
  },
});
