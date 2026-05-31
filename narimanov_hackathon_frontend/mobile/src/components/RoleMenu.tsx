import { colors, radius, shadow } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type MenuItem = {
  icon: IconName;
  label: string;
  route: string;
};

const userItems: MenuItem[] = [
  { icon: 'map-marker-radius-outline', label: 'Map', route: '/map' },
  { icon: 'file-document-edit-outline', label: 'Report Issue', route: '/report' },
  { icon: 'clipboard-text-outline', label: 'My Reports', route: '/my-reports' },
  { icon: 'gift-outline', label: 'Rewards', route: '/rewards' },
  { icon: 'robot-happy-outline', label: 'AI Assistant', route: '/ai-chat' },
  { icon: 'account-outline', label: 'Profile', route: '/profile' },
];

const adminItems: MenuItem[] = [
  { icon: 'map-marker-radius-outline', label: 'Map', route: '/map' },
  { icon: 'robot-outline', label: 'AI Review', route: '/ai-review' },
  { icon: 'format-list-bulleted', label: 'All Issues', route: '/all-issues' },
  { icon: 'clipboard-check-outline', label: 'Operations', route: '/operations' },
  { icon: 'chart-box-outline', label: 'Analytics Summary', route: '/analytics' },
  { icon: 'robot-happy-outline', label: 'AI Assistant', route: '/ai-chat' },
  { icon: 'account-outline', label: 'Profile', route: '/profile' },
];

export function RoleMenu({ onClose, visible }: { onClose: () => void; visible: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, logout, pendingAiCount, role } = useApp();
  const items = role === 'admin' ? adminItems : userItems;

  const navigate = (route: string) => {
    onClose();
    router.push(route as never);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.panel, { paddingTop: Math.max(insets.top + 22, 76), paddingBottom: Math.max(insets.bottom + 18, 34) }]}>
          <View style={styles.profile}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{currentUser.role === 'admin' ? 'A' : 'U'}</Text></View>
            <View style={styles.profileCopy}>
              <Text style={styles.name}>{currentUser.name}</Text>
              <Text style={styles.role}>{currentUser.role === 'admin' ? 'District Admin' : 'Citizen User'}</Text>
            </View>
          </View>
          <View style={styles.nav}>
            {items.map((item) => (
              <Pressable key={item.route} onPress={() => navigate(item.route)} style={styles.item}>
                <MaterialCommunityIcons name={item.icon} size={22} color={item.route === '/ai-chat' ? colors.ai : colors.navy} />
                <Text style={styles.itemText}>{item.label}</Text>
                {item.route === '/ai-review' && pendingAiCount ? <View style={styles.badge}><Text style={styles.badgeText}>{pendingAiCount}</Text></View> : null}
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => {
              logout();
              onClose();
              router.replace('/');
            }}
            style={styles.logout}>
            <MaterialCommunityIcons name="logout" size={21} color={colors.danger} />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.blueSoft,
    borderRadius: 999,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  backdrop: {
    backgroundColor: '#08122D66',
    flex: 1,
    justifyContent: 'flex-start',
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.ai,
    borderRadius: 999,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  item: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 14,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  itemText: {
    color: colors.navy,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  logout: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    padding: 14,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '900',
  },
  name: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: '900',
  },
  nav: {
    gap: 4,
  },
  panel: {
    backgroundColor: colors.card,
    borderBottomRightRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    height: '100%',
    padding: 20,
    width: 300,
    ...shadow,
  },
  profile: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
    paddingBottom: 18,
  },
  profileCopy: {
    flex: 1,
  },
  role: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
});
