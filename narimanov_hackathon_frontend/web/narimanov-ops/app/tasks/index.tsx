import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, PriorityBadge, StatusBadge } from '@/components/ui';
import { colors, radius } from '@/constants/theme';
import { issues } from '@/mock';
import { categoryLabels } from '@/utils/labels';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const assignedTasks = issues.filter((issue) => ['assigned', 'in_progress', 'overdue'].includes(issue.status));

export default function TasksScreen() {
  const [statuses, setStatuses] = useState(
    Object.fromEntries(assignedTasks.map((issue) => [issue.id, issue.status])),
  );
  const [proofs, setProofs] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState('');
  const [mockProofId, setMockProofId] = useState<string | null>(null);
  const [confirmResolveId, setConfirmResolveId] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 1700);
  };

  const uploadProof = async (id: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 });
    if (result.canceled) {
      setMockProofId(id);
      return;
    }
    setProofs((current) => ({ ...current, [id]: true }));
    showToast('Proof photo uploaded.');
  };

  const resolveTask = (id: string) => {
    if (!proofs[id]) {
      setConfirmResolveId(id);
      return;
    }
    setStatuses((current) => ({ ...current, [id]: 'resolved' }));
    showToast('Task marked resolved.');
  };

  return (
    <AppLayout>
      <PageHeader
        title="Operational Tasks"
        subtitle="Admin-managed field work. Update progress, attach proof, and resolve issues."
        rightSlot={
          <Pressable style={styles.statusSelect}>
            <Text style={styles.statusSelectText}>All Status</Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color="#06113E" />
          </Pressable>
        }
      />
      {toast ? <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View> : null}

      {assignedTasks.map((issue) => (
        <Card key={issue.id} style={styles.taskCard}>
          <Image source={{ uri: issue.photo_url }} style={styles.taskImage} />
          <View style={styles.taskCopy}>
            <Link href={`/tasks/${issue.id}` as never} asChild>
              <Pressable><Text style={styles.taskTitle}>{issue.title}</Text></Pressable>
            </Link>
            <View style={styles.metaLine}>
              <MaterialCommunityIcons name="shape-outline" size={17} color="#34406B" />
              <Text style={styles.metaText}>{categoryLabels[issue.category]}</Text>
              <PriorityBadge compact priority={issue.priority} />
            </View>
            <View style={styles.metaLine}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color="#34406B" />
              <View>
                <Text style={styles.addressText}>{issue.address}</Text>
                <Text style={styles.cityText}>Narimanov district, Baku</Text>
              </View>
            </View>
            <Text style={styles.reportedText}>Reported: May 28, 2026, 09:15 AM</Text>
          </View>

          <View style={styles.taskSide}>
            <View style={styles.taskStatusBox}>
              <View style={styles.sideColumn}>
                <Text style={styles.sideLabel}>Deadline</Text>
                <Text style={styles.deadlineText}>May 31, 2026</Text>
              </View>
              <View style={styles.sideDivider} />
              <View style={styles.sideColumn}>
                <Text style={styles.sideLabel}>Status</Text>
                <StatusBadge compact status={statuses[issue.id] ?? issue.status} />
              </View>
            </View>
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => {
                  setStatuses((current) => ({ ...current, [issue.id]: current[issue.id] === 'in_progress' ? 'assigned' : 'in_progress' }));
                  showToast(statuses[issue.id] === 'in_progress' ? 'Work paused.' : 'Work started.');
                }}
                style={[styles.taskButton, statuses[issue.id] === 'in_progress' ? styles.pauseButton : styles.startButton]}>
                <MaterialCommunityIcons name={statuses[issue.id] === 'in_progress' ? 'pause-circle-outline' : 'play-circle-outline'} size={20} color={statuses[issue.id] === 'in_progress' ? colors.primary : colors.white} />
                <Text style={statuses[issue.id] === 'in_progress' ? styles.pauseText : styles.startText}>{statuses[issue.id] === 'in_progress' ? 'Pause Work' : 'Start Work'}</Text>
              </Pressable>
              <Pressable onPress={() => uploadProof(issue.id)} style={styles.uploadButton}>
                <MaterialCommunityIcons name={proofs[issue.id] ? 'check-circle-outline' : 'upload-outline'} size={20} color={colors.primaryDark} />
                <Text style={styles.uploadText}>{proofs[issue.id] ? 'Proof Uploaded' : 'Upload Proof'}</Text>
              </Pressable>
              <Pressable onPress={() => resolveTask(issue.id)} style={styles.resolveButton}>
                <MaterialCommunityIcons name="check-circle-outline" size={20} color={colors.success} />
                <Text style={styles.resolveText}>Mark Resolved</Text>
              </Pressable>
            </View>
          </View>
        </Card>
      ))}
      <Text style={styles.footerText}>Showing 1 to {assignedTasks.length} of {assignedTasks.length} tasks</Text>
      <Modal transparent visible={Boolean(mockProofId)} animationType="fade" onRequestClose={() => setMockProofId(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setMockProofId(null)}>
          <Pressable style={styles.modalPanel}>
            <Text style={styles.modalTitle}>Use mock proof photo?</Text>
            <Text style={styles.modalText}>No file was selected. For the demo, you can attach a sample resolution proof instead.</Text>
            <Pressable
              onPress={() => {
                if (mockProofId) setProofs((current) => ({ ...current, [mockProofId]: true }));
                setMockProofId(null);
                showToast('Mock proof attached.');
              }}
              style={styles.modalPrimary}>
              <Text style={styles.modalPrimaryText}>Attach mock proof</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal transparent visible={Boolean(confirmResolveId)} animationType="fade" onRequestClose={() => setConfirmResolveId(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setConfirmResolveId(null)}>
          <Pressable style={styles.modalPanel}>
            <Text style={styles.modalTitle}>Resolve without proof?</Text>
            <Text style={styles.modalText}>This task has no proof photo yet. Confirm to resolve anyway for the hackathon demo.</Text>
            <Pressable
              onPress={() => {
                if (confirmResolveId) setStatuses((current) => ({ ...current, [confirmResolveId]: 'resolved' }));
                setConfirmResolveId(null);
                showToast('Task resolved after confirmation.');
              }}
              style={styles.modalPrimary}>
              <Text style={styles.modalPrimaryText}>Confirm resolved</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  statusSelect: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', gap: 12, height: 54, paddingHorizontal: 20 },
  statusSelectText: { color: '#06113E', fontSize: 14, fontWeight: '900' },
  toast: { backgroundColor: colors.greenSoft, borderColor: '#B7E6C9', borderRadius: radius.md, borderWidth: 1, marginBottom: 12, padding: 12 },
  toastText: { color: colors.success, fontWeight: '900' },
  taskCard: { alignItems: 'center', flexDirection: 'row', gap: 28, marginBottom: 18, padding: 18 },
  taskImage: { borderRadius: radius.md, height: 170, width: 230 },
  taskCopy: { flex: 1, gap: 18 },
  taskTitle: { color: '#06113E', fontSize: 19, fontWeight: '900' },
  metaLine: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  metaText: { color: '#34406B', fontSize: 14 },
  addressText: { color: '#06113E', fontSize: 14, fontWeight: '800' },
  cityText: { color: '#34406B', fontSize: 13, marginTop: 6 },
  reportedText: { color: '#34406B', fontSize: 14 },
  taskSide: { gap: 38, width: 530 },
  taskStatusBox: { backgroundColor: colors.background, borderRadius: radius.md, flexDirection: 'row', padding: 20 },
  sideColumn: { flex: 1, gap: 12 },
  sideDivider: { backgroundColor: colors.border, marginHorizontal: 20, width: 1 },
  sideLabel: { color: '#34406B', fontSize: 13 },
  deadlineText: { color: colors.danger, fontSize: 15, fontWeight: '800' },
  actionRow: { flexDirection: 'row', gap: 20 },
  taskButton: { alignItems: 'center', borderRadius: radius.sm, flex: 1, flexDirection: 'row', gap: 10, height: 50, justifyContent: 'center' },
  startButton: { backgroundColor: colors.primary },
  pauseButton: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1 },
  startText: { color: colors.white, fontWeight: '900' },
  pauseText: { color: colors.primary, fontWeight: '900' },
  uploadButton: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 10, height: 50, justifyContent: 'center' },
  uploadText: { color: colors.primaryDark, fontWeight: '900' },
  resolveButton: { alignItems: 'center', borderColor: '#8BD4AE', borderRadius: radius.sm, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 10, height: 50, justifyContent: 'center' },
  resolveText: { color: colors.success, fontWeight: '900' },
  footerText: { color: '#34406B', fontSize: 14, marginTop: 6 },
  modalBackdrop: { alignItems: 'center', backgroundColor: '#06113E66', flex: 1, justifyContent: 'center', padding: 18 },
  modalPanel: { backgroundColor: colors.white, borderRadius: radius.lg, maxWidth: 420, padding: 22, width: '100%' },
  modalTitle: { color: '#06113E', fontSize: 18, fontWeight: '900' },
  modalText: { color: '#34406B', lineHeight: 21, marginBottom: 18, marginTop: 8 },
  modalPrimary: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.sm, height: 48, justifyContent: 'center' },
  modalPrimaryText: { color: colors.white, fontWeight: '900' },
});
