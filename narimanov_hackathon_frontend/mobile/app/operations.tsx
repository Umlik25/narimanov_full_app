import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { PriorityBadge, TaskStatusBadge } from '@/components/Badge';
import { RoleMenu } from '@/components/RoleMenu';
import { Screen } from '@/components/Screen';
import { colors, radius, shadow } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Task } from '@/types/domain';

export default function OperationsScreen() {
  const router = useRouter();
  const { tasks, updateTask } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [reassignTask, setReassignTask] = useState<Task | null>(null);
  const [selectedTeam, setSelectedTeam] = useState('');
  const insets = useSafeAreaInsets();

  const openReassign = (task: Task) => {
    setSelectedTeam(task.responsible);
    setReassignTask(task);
  };

  return (
    <>
      <Header onMenu={() => setMenuOpen(true)} title="Operations" subtitle="Assigned district tasks" />
      <Screen>
        {tasks.map((task) => (
          <Card key={task.id} style={styles.card}>
            <Pressable onPress={() => router.push(`/admin-issue/${task.issueId}` as never)}>
              <Text style={styles.title}>{task.title}</Text>
            </Pressable>
            <Text style={styles.meta}>{task.department} · {task.responsible}</Text>
            <View style={styles.row}>
              <PriorityBadge priority={task.priority} />
              <TaskStatusBadge status={task.status} />
            </View>
            <View style={styles.deadlineRow}>
              <Text style={styles.deadlineLabel}>Deadline</Text>
              <Text style={styles.deadlineValue}>{task.deadline}</Text>
            </View>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${task.progress}%` }]} /></View>
            <View style={styles.actions}>
              <AppButton onPress={() => setSelectedTask(task)} style={styles.action} tone="secondary">Open Task</AppButton>
              <AppButton onPress={() => openReassign(task)} style={styles.action} tone="secondary">Reassign</AppButton>
            </View>
          </Card>
        ))}
      </Screen>
      <RoleMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />

      <Modal transparent visible={Boolean(selectedTask)} animationType="slide" onRequestClose={() => setSelectedTask(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSelectedTask(null)}>
          {selectedTask ? (
            <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 18, 28) }]}>
              <View style={styles.sheetHeader}>
                <View style={styles.sheetCopy}>
                  <Text numberOfLines={2} style={styles.sheetTitle}>{selectedTask.title}</Text>
                  <Text style={styles.sheetSubtitle}>{selectedTask.id} · {selectedTask.department}</Text>
                </View>
                <Pressable onPress={() => setSelectedTask(null)} style={styles.closeButton}>
                  <MaterialCommunityIcons name="close" size={20} color={colors.navy} />
                </Pressable>
              </View>
              <View style={styles.detailGrid}>
                <MiniDetail label="Team" value={selectedTask.responsible} />
                <MiniDetail label="Deadline" value={selectedTask.deadline} />
                <MiniDetail label="Status" value={selectedTask.status.replace('_', ' ')} />
                <MiniDetail label="Progress" value={`${selectedTask.progress}%`} />
              </View>
              <View style={styles.sheetActions}>
                <AppButton onPress={() => { updateTask(selectedTask.id, { status: 'in_progress', progress: Math.max(selectedTask.progress, 45) }); setSelectedTask(null); }} style={styles.action} tone="primary">Start</AppButton>
                <AppButton onPress={() => { updateTask(selectedTask.id, { status: 'completed', progress: 100 }); setSelectedTask(null); }} style={styles.action} tone="success">Resolve</AppButton>
              </View>
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>

      <Modal transparent visible={Boolean(reassignTask)} animationType="slide" onRequestClose={() => setReassignTask(null)}>
        <Pressable style={styles.backdrop} onPress={() => setReassignTask(null)}>
          {reassignTask ? (
            <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 18, 28) }]}>
              <View style={styles.sheetHeader}>
                <View style={styles.sheetCopy}>
                  <Text style={styles.sheetTitle}>Reassign task</Text>
                  <Text numberOfLines={1} style={styles.sheetSubtitle}>{reassignTask.title}</Text>
                </View>
                <Pressable onPress={() => setReassignTask(null)} style={styles.closeButton}>
                  <MaterialCommunityIcons name="close" size={20} color={colors.navy} />
                </Pressable>
              </View>
              {['Road Team A', 'Lighting Crew', 'Sanitation Team B', 'Emergency Response', 'Public Works Crew'].map((team) => {
                const active = selectedTeam === team;
                return (
                  <Pressable key={team} onPress={() => setSelectedTeam(team)} style={[styles.teamRow, active && styles.teamRowActive]}>
                    <Text numberOfLines={1} style={[styles.teamText, active && styles.teamTextActive]}>{team}</Text>
                    {active ? <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} /> : null}
                  </Pressable>
                );
              })}
              <View style={styles.sheetActions}>
                <AppButton onPress={() => setReassignTask(null)} style={styles.action} tone="secondary">Discard</AppButton>
                <AppButton onPress={() => { updateTask(reassignTask.id, { responsible: selectedTeam || reassignTask.responsible }); setReassignTask(null); }} style={styles.action}>Confirm</AppButton>
              </View>
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

function MiniDetail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniDetail}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.miniValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  action: { flex: 1 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  backdrop: { backgroundColor: '#08122D66', flex: 1, justifyContent: 'flex-end' },
  card: { marginBottom: 14, padding: 16 },
  closeButton: { alignItems: 'center', backgroundColor: colors.background, borderRadius: 999, height: 40, justifyContent: 'center', width: 40 },
  deadlineLabel: { color: colors.muted },
  deadlineRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, marginTop: 14 },
  deadlineValue: { color: colors.navy, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 13, marginBottom: 12, marginTop: 6 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  miniDetail: { backgroundColor: colors.background, borderRadius: radius.md, padding: 12, width: '48%' },
  miniLabel: { color: colors.muted, fontSize: 11, fontWeight: '900', marginBottom: 4 },
  miniValue: { color: colors.navy, fontSize: 13, fontWeight: '900', textTransform: 'capitalize' },
  progressFill: { backgroundColor: colors.primary, borderRadius: 999, height: 9 },
  progressTrack: { backgroundColor: colors.background, borderRadius: 999, height: 9, overflow: 'hidden' },
  row: { flexDirection: 'row', gap: 8 },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20, ...shadow },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  sheetCopy: { flex: 1, paddingRight: 12 },
  sheetHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  sheetSubtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  sheetTitle: { color: colors.navy, fontSize: 20, fontWeight: '900', lineHeight: 25 },
  teamRow: { alignItems: 'center', backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, minHeight: 50, paddingHorizontal: 14 },
  teamRowActive: { backgroundColor: colors.blueSoft, borderColor: colors.primary },
  teamText: { color: colors.navy, flex: 1, fontWeight: '900' },
  teamTextActive: { color: colors.primary },
  title: { color: colors.navy, fontSize: 17, fontWeight: '900', lineHeight: 22 },
});
