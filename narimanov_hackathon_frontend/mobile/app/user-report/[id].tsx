import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { PriorityBadge, StatusBadge } from '@/components/Badge';
import { Screen } from '@/components/Screen';
import { colors, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { categoryLabels } from '@/mock/data';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';

export default function UserReportDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { userIssues } = useApp();
  const issue = userIssues.find((item) => item.id === id) ?? userIssues[0];

  const addPhoto = async () => {
    await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 });
  };

  if (!issue) return null;

  return (
    <>
      <Header onBack={() => router.back()} title="Report Details" subtitle={issue.id} />
      <Screen>
        <Card style={styles.card}>
          <Image source={issue.photo} style={styles.photo} />
          <Text style={styles.title}>{issue.title}</Text>
          <Text style={styles.description}>{issue.description}</Text>
          <View style={styles.badges}>
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </View>
          <Info icon="shape-outline" label="Category" value={categoryLabels[issue.category]} />
          <Info icon="map-marker-outline" label="Location" value={issue.location} />
          <Info icon="clock-outline" label="Submitted" value={issue.reportedAt} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          {issue.timeline.map((item, index) => (
            <View key={`${item.time}-${item.action}`} style={styles.timelineRow}>
              <View style={[styles.timelineDot, index === 0 && styles.timelineDotActive]} />
              <View style={styles.timelineCopy}>
                <Text style={styles.timelineAction}>{item.action}</Text>
                <Text style={styles.timelineMeta}>{item.time} · {item.by}</Text>
              </View>
            </View>
          ))}
        </Card>

        {issue.resolutionProof ? (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Resolution proof</Text>
            <Image source={issue.resolutionProof} style={styles.proof} />
          </Card>
        ) : null}

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Add update</Text>
          <TextInput placeholder="Write a comment..." placeholderTextColor={colors.subtle} style={styles.comment} />
          <View style={styles.actions}>
            <AppButton icon="image-plus" onPress={addPhoto} style={styles.action} tone="secondary">Extra Photo</AppButton>
            <AppButton icon="map-marker" onPress={() => router.push('/map')} style={styles.action}>Open Map</AppButton>
          </View>
        </Card>
      </Screen>
    </>
  );
}

function Info({ icon, label, value }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon} size={19} color={colors.primary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.infoValue}>{value}</Text>
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
    marginTop: 12,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  card: {
    marginBottom: 14,
    padding: 16,
  },
  comment: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  infoLabel: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
  },
  infoRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
  },
  infoValue: {
    color: colors.navy,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  photo: {
    borderRadius: radius.lg,
    height: 210,
    marginBottom: 14,
    width: '100%',
  },
  proof: {
    borderRadius: radius.md,
    height: 140,
    width: '100%',
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 12,
  },
  timelineAction: {
    color: colors.navy,
    fontWeight: '900',
  },
  timelineCopy: {
    flex: 1,
  },
  timelineDot: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 13,
    marginTop: 4,
    width: 13,
  },
  timelineDotActive: {
    backgroundColor: colors.primary,
  },
  timelineMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  title: {
    color: colors.navy,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: 8,
  },
});
