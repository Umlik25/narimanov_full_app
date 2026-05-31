import { colors } from '@/constants/theme';
import type { IssuePriority, IssueStatus } from '@/types/domain';
import { priorityLabels, statusLabels } from '@/utils/labels';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

export const statusTone: Record<IssueStatus, { bg: string; fg: string }> = {
  new: { bg: colors.blueSoft, fg: colors.blue },
  needs_review: { bg: colors.purpleSoft, fg: colors.purple },
  assigned: { bg: colors.goldSoft, fg: colors.gold },
  in_progress: { bg: colors.orangeSoft, fg: colors.orange },
  resolved: { bg: colors.greenSoft, fg: colors.green },
  rejected: { bg: colors.graySoft, fg: colors.gray },
  overdue: { bg: colors.redSoft, fg: colors.red },
};

export const priorityTone: Record<IssuePriority, { bg: string; fg: string }> = {
  low: { bg: colors.graySoft, fg: colors.gray },
  medium: { bg: colors.blueSoft, fg: colors.blue },
  high: { bg: colors.orangeSoft, fg: colors.orange },
  critical: { bg: colors.redSoft, fg: colors.red },
};

type BadgeProps = {
  label: string;
  bg: string;
  fg: string;
  compact?: boolean;
  style?: ViewStyle;
};

function Badge({ label, bg, compact, fg, style }: BadgeProps) {
  return (
    <View style={[styles.badge, compact && styles.badgeCompact, { backgroundColor: bg }, style]}>
      <Text numberOfLines={1} style={[styles.text, compact && styles.textCompact, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function StatusBadge({ compact, status }: { compact?: boolean; status: IssueStatus }) {
  const tone = statusTone[status];
  return <Badge label={statusLabels[status]} bg={tone.bg} compact={compact} fg={tone.fg} />;
}

export function PriorityBadge({ compact, priority }: { compact?: boolean; priority: IssuePriority }) {
  const tone = priorityTone[priority];
  return <Badge label={priorityLabels[priority]} bg={tone.bg} compact={compact} fg={tone.fg} />;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  textCompact: {
    fontSize: 11,
  },
});
