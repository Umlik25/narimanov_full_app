import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { PriorityBadge, StatusBadge } from '@/components/Badge';
import { Screen } from '@/components/Screen';
import { colors, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { categoryLabels, departments } from '@/mock/data';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function AdminIssueDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { issues, updateIssue } = useApp();
  const issue = issues.find((item) => item.id === id) ?? issues[0];
  const [department, setDepartment] = useState(issue.assignedTo ?? departments[0]);
  const [deadline, setDeadline] = useState(issue.deadline ?? 'June 03, 2026');

  if (!issue) return null;

  const apply = (status = issue.status) => {
    updateIssue(issue.id, { assignedTo: department, deadline, status });
  };

  return (
    <>
      <Header onBack={() => router.back()} title="Admin Issue" subtitle={issue.id} />
      <Screen>
        <Card style={styles.card}>
          <Image source={issue.photo} style={styles.photo} />
          <Text style={styles.title}>{issue.title}</Text>
          <Text style={styles.description}>{issue.description}</Text>
          <View style={styles.badges}>
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </View>
          <Info label="Category" value={categoryLabels[issue.category]} />
          <Info label="Location" value={issue.location} />
          <Info label="Source" value={issue.source === 'ai' ? 'AI / camera' : 'User report'} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Assignment</Text>
          <Text style={styles.label}>Department</Text>
          <View style={styles.chips}>
            {departments.map((item) => (
              <Pressable key={item} onPress={() => setDepartment(item)} style={[styles.chip, department === item && styles.chipActive]}>
                <Text style={[styles.chipText, department === item && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Deadline</Text>
          <View style={styles.chips}>
            {['May 31, 2026', 'June 03, 2026', 'June 07, 2026'].map((item) => (
              <Pressable key={item} onPress={() => setDeadline(item)} style={[styles.chip, deadline === item && styles.chipActive]}>
                <Text style={[styles.chipText, deadline === item && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <AppButton icon="content-save-outline" onPress={() => apply('assigned')}>Save Assignment</AppButton>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Admin actions</Text>
          <View style={styles.actions}>
            <AppButton icon="progress-clock" onPress={() => apply('in_progress')} style={styles.action} tone="secondary">Start</AppButton>
            <AppButton icon="check-circle-outline" onPress={() => apply('resolved')} style={styles.action} tone="success">Resolve</AppButton>
          </View>
          <AppButton icon="close-circle-outline" onPress={() => apply('rejected')} style={styles.reject} tone="danger">Reject Issue</AppButton>
          <AppButton icon="map-marker" onPress={() => router.push('/map')} style={styles.reject} tone="secondary">Open on Map</AppButton>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Audit trail</Text>
          {issue.timeline.map((item) => (
            <View key={`${item.time}-${item.action}`} style={styles.timelineRow}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={colors.primary} />
              <View style={styles.timelineCopy}>
                <Text style={styles.timelineAction}>{item.action}</Text>
                <Text style={styles.timelineMeta}>{item.time} · {item.by}</Text>
              </View>
            </View>
          ))}
        </Card>
      </Screen>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  action: { flex: 1 },
  actions: { flexDirection: 'row', gap: 10 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  card: { marginBottom: 14, padding: 16 },
  chip: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipActive: { backgroundColor: colors.blueSoft, borderColor: colors.primary },
  chipText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  chipTextActive: { color: colors.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 21, marginBottom: 12 },
  infoLabel: { color: colors.muted, flex: 1 },
  infoRow: { borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', paddingVertical: 12 },
  infoValue: { color: colors.navy, flex: 1, fontWeight: '900', textAlign: 'right' },
  label: { color: colors.navy, fontWeight: '900', marginBottom: 8, marginTop: 8 },
  photo: { borderRadius: radius.lg, height: 210, marginBottom: 14, width: '100%' },
  reject: { marginTop: 10 },
  sectionTitle: { color: colors.navy, fontSize: 17, fontWeight: '900', marginBottom: 12 },
  timelineAction: { color: colors.navy, fontWeight: '900' },
  timelineCopy: { flex: 1 },
  timelineMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  timelineRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  title: { color: colors.navy, fontSize: 22, fontWeight: '900', lineHeight: 28, marginBottom: 8 },
});
