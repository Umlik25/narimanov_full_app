import { colors, radius } from '@/constants/theme';
import { priorityColors, priorityLabels, statusColors, statusLabels, taskLabels } from '@/mock/data';
import type { IssuePriority, IssueStatus, TaskStatus } from '@/types/domain';
import { StyleSheet, Text, View } from 'react-native';

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: `${color}18` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: IssueStatus }) {
  return <Pill color={statusColors[status]} label={statusLabels[status]} />;
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  return <Pill color={priorityColors[priority]} label={priorityLabels[priority]} />;
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const color = status === 'completed' ? colors.success : status === 'overdue' ? colors.danger : status === 'in_progress' ? colors.orange : colors.primary;
  return <Pill color={color} label={taskLabels[status]} />;
}

const styles = StyleSheet.create({
  dot: {
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  pill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
  },
});
