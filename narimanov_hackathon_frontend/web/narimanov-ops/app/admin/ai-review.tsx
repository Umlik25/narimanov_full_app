import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, PriorityBadge } from '@/components/ui';
import { colors, radius } from '@/constants/theme';
import { useDemo } from '@/store/DemoContext';
import { categoryLabels } from '@/utils/labels';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function AiReviewScreen() {
  const { aiDetections, approveDetection, issues, mergeDetection, pendingAiCount, rejectDetection } = useDemo();
  const pending = aiDetections.filter((item) => item.status === 'needs_review');
  const [toast, setToast] = useState('');
  const [mergeId, setMergeId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const flash = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 1800);
  };

  const formatCoordinate = (value: unknown, fallback: number) => {
    const numeric = typeof value === 'number' ? value : Number(value);
    return (Number.isFinite(numeric) ? numeric : fallback).toFixed(4);
  };

  return (
    <AppLayout>
      <PageHeader
        title="AI Review Panel"
        subtitle="Review AI detections before they become official operational tasks."
        rightSlot={
          <View style={styles.headerActions}>
            <View style={styles.searchBox}>
              <TextInput placeholder="Search detections..." placeholderTextColor="#667085" style={styles.searchInput} />
              <MaterialCommunityIcons name="magnify" size={22} color="#34406B" />
            </View>
            <Pressable onPress={() => setFilterOpen((open) => !open)} style={styles.filterButton}>
              <MaterialCommunityIcons name="tune-variant" size={20} color="#06113E" />
              <Text style={styles.filterText}>Filters</Text>
            </Pressable>
          </View>
        }
      />
      <View style={styles.pendingLine}>
        <MaterialCommunityIcons name="robot-outline" size={18} color={colors.ai} />
        <Text style={styles.pendingText}>{pendingAiCount} pending detections</Text>
      </View>
      {filterOpen ? <Text style={styles.filterNote}>Mock filter active: showing high-confidence detections only.</Text> : null}
      {toast ? <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View> : null}

      {pending.map((detection) => {
        return (
          <Card key={detection.id} style={styles.card}>
            <View style={styles.imageWrap}>
              <Image source={{ uri: detection.image_url }} style={styles.image} />
              <View style={styles.aiLabel}><Text style={styles.aiLabelText}>AI DETECTED</Text></View>
            </View>

            <View style={styles.mainCopy}>
              <Text style={styles.title}>{detection.category === 'road_damage' ? 'Large pothole on road' : 'Overflowing trash container'}</Text>
              <View style={styles.detailGrid}>
                <Info label="Category" value={categoryLabels[detection.category]} tone="blue" />
                <Info label="Confidence" value={`${Math.round(detection.confidence * 100)}%`} tone="purple" />
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Priority</Text>
                  <PriorityBadge priority={detection.priority} />
                </View>
                <Info label="Location" value={`${formatCoordinate(detection.latitude, 40.4099)}, ${formatCoordinate(detection.longitude, 49.8677)}`} />
                <Info label="Detected" value="Today, 10:24 AM" />
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable onPress={() => { approveDetection(detection.id); flash('Detection approved and official issue created.'); }} style={[styles.actionButton, styles.approveButton]}>
                <MaterialCommunityIcons name="check" size={24} color={colors.white} />
                <Text style={styles.actionText}>Approve</Text>
              </Pressable>
              <Pressable onPress={() => { rejectDetection(detection.id); flash('Detection rejected from review queue.'); }} style={[styles.actionButton, styles.rejectButton]}>
                <MaterialCommunityIcons name="close" size={24} color={colors.white} />
                <Text style={styles.actionText}>Reject</Text>
              </Pressable>
              <Pressable onPress={() => setMergeId(detection.id)} style={[styles.actionButton, styles.mergeButton]}>
                <MaterialCommunityIcons name="source-merge" size={22} color="#06113E" />
                <Text style={styles.mergeText}>Merge</Text>
              </Pressable>
            </View>
          </Card>
        );
      })}
      {!pending.length ? (
        <Card style={styles.emptyCard}>
          <MaterialCommunityIcons name="check-decagram-outline" size={34} color={colors.success} />
          <Text style={styles.emptyTitle}>AI review queue is clear</Text>
          <Text style={styles.emptyText}>Approved and rejected detections were handled in the mock workflow.</Text>
        </Card>
      ) : null}

      <Modal transparent visible={Boolean(mergeId)} animationType="fade" onRequestClose={() => setMergeId(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setMergeId(null)}>
          <Pressable style={styles.mergePanel}>
            <Text style={styles.mergeTitle}>Merge detection</Text>
            <Text style={styles.mergeSub}>Choose the nearest existing issue for this AI event.</Text>
            {issues.slice(0, 4).map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (mergeId) mergeDetection(mergeId, item.id);
                  setMergeId(null);
                  flash(`Detection merged with ${item.id}.`);
                }}
                style={styles.mergeOption}>
                <MaterialCommunityIcons name="source-merge" size={18} color={colors.ai} />
                <Text style={styles.mergeOptionText}>{item.id} {item.title}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </AppLayout>
  );
}

function Info({ label, tone, value }: { label: string; tone?: 'blue' | 'purple'; value: string }) {
  const bg = tone === 'purple' ? colors.purpleSoft : tone === 'blue' ? colors.blueSoft : 'transparent';
  const fg = tone === 'purple' ? colors.ai : tone === 'blue' ? colors.primary : '#06113E';

  return (
    <View style={styles.infoBlock}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={[styles.infoPill, { backgroundColor: bg }]}>
        <Text style={[styles.infoValue, { color: fg }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', gap: 20 },
  searchBox: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', height: 54, paddingHorizontal: 18, width: 380 },
  searchInput: { color: colors.ink, flex: 1, fontSize: 14, outlineStyle: 'none' as never },
  filterButton: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', gap: 10, height: 54, paddingHorizontal: 22 },
  filterText: { color: '#06113E', fontSize: 14, fontWeight: '800' },
  pendingLine: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 12 },
  pendingText: { color: '#34406B', fontWeight: '800' },
  filterNote: { backgroundColor: colors.blueSoft, borderRadius: radius.sm, color: colors.primary, fontWeight: '800', marginBottom: 12, padding: 12 },
  toast: { backgroundColor: colors.greenSoft, borderColor: '#B7E6C9', borderRadius: radius.md, borderWidth: 1, marginBottom: 12, padding: 12 },
  toastText: { color: colors.success, fontWeight: '900' },
  card: { alignItems: 'center', flexDirection: 'row', gap: 34, marginBottom: 16, padding: 18 },
  decidedCard: { opacity: 0.72 },
  imageWrap: { position: 'relative' },
  image: { borderRadius: radius.md, height: 190, width: 280 },
  aiLabel: { backgroundColor: colors.ai, borderRadius: radius.sm, left: 10, paddingHorizontal: 10, paddingVertical: 6, position: 'absolute', top: 10 },
  aiLabelText: { color: colors.white, fontSize: 11, fontWeight: '900' },
  mainCopy: { flex: 1, gap: 20 },
  title: { color: '#06113E', fontSize: 20, fontWeight: '900' },
  detailGrid: { columnGap: 42, flexDirection: 'row', flexWrap: 'wrap', rowGap: 24 },
  infoBlock: { gap: 8, minWidth: 140 },
  infoLabel: { color: '#34406B', fontSize: 13 },
  infoPill: { alignSelf: 'flex-start', borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 10 },
  infoValue: { fontSize: 14, fontWeight: '900' },
  decisionBanner: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, flexDirection: 'row', gap: 8, padding: 12 },
  decisionText: { color: '#06113E', fontWeight: '900' },
  actions: { borderLeftColor: colors.border, borderLeftWidth: 1, gap: 14, paddingLeft: 26, width: 230 },
  actionButton: { alignItems: 'center', borderRadius: radius.sm, flexDirection: 'row', gap: 12, height: 50, justifyContent: 'center' },
  approveButton: { backgroundColor: colors.success },
  rejectButton: { backgroundColor: colors.danger },
  mergeButton: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1 },
  actionText: { color: colors.white, fontSize: 16, fontWeight: '900' },
  mergeText: { color: '#06113E', fontSize: 16, fontWeight: '900' },
  emptyCard: { alignItems: 'center', gap: 10, padding: 28 },
  emptyTitle: { color: '#06113E', fontSize: 18, fontWeight: '900' },
  emptyText: { color: '#34406B' },
  modalBackdrop: { alignItems: 'center', backgroundColor: '#06113E66', flex: 1, justifyContent: 'center', padding: 18 },
  mergePanel: { backgroundColor: colors.white, borderRadius: radius.lg, maxWidth: 460, padding: 22, width: '100%' },
  mergeTitle: { color: '#06113E', fontSize: 20, fontWeight: '900' },
  mergeSub: { color: '#34406B', marginBottom: 14, marginTop: 8 },
  mergeOption: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', gap: 10, marginTop: 10, padding: 14 },
  mergeOptionText: { color: '#06113E', fontWeight: '800' },
});
