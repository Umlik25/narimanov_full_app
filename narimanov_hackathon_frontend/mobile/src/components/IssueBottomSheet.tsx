import { AppButton } from '@/components/AppButton';
import { PriorityBadge, StatusBadge } from '@/components/Badge';
import { colors, radius, shadow } from '@/constants/theme';
import { categoryLabels } from '@/mock/data';
import type { Issue, Role } from '@/types/domain';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function IssueBottomSheet({
  issue,
  onClose,
  onPrimary,
  onSecondary,
  role,
  visible,
}: {
  issue: Issue | null;
  onClose: () => void;
  onPrimary: () => void;
  onSecondary: () => void;
  role: Role;
  visible: boolean;
}) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(360)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      damping: 22,
      stiffness: 180,
      toValue: visible ? 0 : 360,
      useNativeDriver: true,
    }).start();
  }, [translateY, visible]);

  if (!issue) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 18, 34), transform: [{ translateY }] }]}>
        <View style={styles.handle} />
        <View style={styles.top}>
          <Image source={issue.photo} style={styles.photo} />
          <View style={styles.copy}>
            <Text numberOfLines={2} style={styles.title}>{issue.title}</Text>
            <Text numberOfLines={1} style={styles.location}>{issue.location}</Text>
            <View style={styles.badges}>
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
            </View>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Meta icon="shape-outline" label="Category" value={categoryLabels[issue.category]} />
          <Meta icon="clock-outline" label="Reported" value={issue.reportedAt} />
        </View>
        <Text numberOfLines={3} style={styles.description}>{issue.description}</Text>
        <View style={styles.actions}>
          <AppButton icon="arrow-right" onPress={onPrimary} style={styles.action}>{role === 'admin' ? 'View Details' : 'Track Status'}</AppButton>
          <AppButton icon={role === 'admin' ? 'account-hard-hat-outline' : 'comment-plus-outline'} onPress={onSecondary} style={styles.action} tone={role === 'admin' ? 'ai' : 'secondary'}>
            {role === 'admin' ? (issue.status === 'ai_review' ? 'Review AI' : 'Assign') : 'Add Comment'}
          </AppButton>
        </View>
      </Animated.View>
    </Modal>
  );
}

function Meta({ icon, label, value }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; value: string }) {
  return (
    <View style={styles.meta}>
      <MaterialCommunityIcons name={icon} size={17} color={colors.primary} />
      <View style={styles.metaCopy}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text numberOfLines={1} style={styles.metaValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  backdrop: {
    backgroundColor: '#08122D33',
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  copy: {
    flex: 1,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 16,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: '#D0D5DD',
    borderRadius: 999,
    height: 5,
    marginBottom: 16,
    width: 48,
  },
  location: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 6,
  },
  meta: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  metaCopy: {
    flex: 1,
  },
  metaLabel: {
    color: colors.muted,
    fontSize: 11,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  metaValue: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  photo: {
    borderRadius: radius.md,
    height: 96,
    width: 104,
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    bottom: 0,
    left: 0,
    padding: 18,
    position: 'absolute',
    right: 0,
    ...shadow,
  },
  title: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 23,
  },
  top: {
    flexDirection: 'row',
    gap: 14,
  },
});
