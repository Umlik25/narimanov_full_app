import { colors, radius } from '@/constants/theme';
import type { Issue } from '@/types/domain';
import { categoryLabels } from '@/utils/labels';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type PressableProps, type ViewStyle } from 'react-native';
import { PriorityBadge, StatusBadge } from './Badge';
import { IssuePhoto } from './IssuePhoto';

type IssueCardProps = PressableProps & {
  compact?: boolean;
  issue: Issue;
  style?: ViewStyle;
};

export function IssueCard({ compact, issue, style, ...props }: IssueCardProps) {
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compactCard,
        { opacity: pressed ? 0.88 : 1 },
        style,
      ]}>
      <IssuePhoto size={compact ? 50 : 74} uri={issue.photo_url} />
      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.title, compact && styles.compactTitle]}>
          {issue.title}
        </Text>
        <Text numberOfLines={1} style={styles.meta}>
          {categoryLabels[issue.category]} · {issue.address}
        </Text>
        <View style={styles.badgeRow}>
          <PriorityBadge compact={compact} priority={issue.priority} />
          <StatusBadge compact={compact} status={issue.status} />
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 10,
  },
  compactCard: {
    gap: 10,
    padding: 9,
  },
  body: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  title: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  compactTitle: {
    fontSize: 14,
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
