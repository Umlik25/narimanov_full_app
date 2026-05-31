import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ActionButton, PriorityBadge, StatusBadge } from '@/components/ui';
import { colors, radius } from '@/constants/theme';
import { issues } from '@/mock';
import type { IssueStatus } from '@/types/domain';
import { categoryLabels, statusLabels } from '@/utils/labels';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const issue = issues.find((item) => item.id === id) ?? issues[0];
  const [status, setStatus] = useState<IssueStatus>(issue.status);
  const [proofUri, setProofUri] = useState<string | null>(null);

  const pickProof = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled) {
      setProofUri(result.assets[0].uri);
    }
  };

  return (
    <AppLayout>
      <PageHeader title={issue.id} subtitle="Executor task workspace" />
      <Image source={{ uri: issue.photo_url }} style={styles.heroImage} />

      <View style={styles.card}>
        <Text style={styles.issueTitle}>{issue.title}</Text>
        <Text style={styles.issueMeta}>{categoryLabels[issue.category]} · {issue.address}</Text>
        <View style={styles.badgeRow}>
          <PriorityBadge priority={issue.priority} />
          <StatusBadge status={status} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Progress</Text>
        <View style={styles.actionRow}>
          {(['in_progress', 'resolved'] as IssueStatus[]).map((item) => {
            const active = status === item;
            return (
              <Pressable
                key={item}
                onPress={() => setStatus(item)}
                style={[styles.statusButton, active && styles.statusButtonActive]}>
                <Text style={[styles.statusText, active && styles.statusTextActive]}>
                  {statusLabels[item]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable onPress={pickProof} style={styles.proofBox}>
        {proofUri ? (
          <Image source={{ uri: proofUri }} style={styles.proofImage} />
        ) : (
          <View style={styles.proofEmpty}>
            <MaterialCommunityIcons name="image-plus-outline" size={38} color={colors.blue} />
            <ActionButton compact icon="upload-outline" label="Upload proof photo" variant="secondary" />
          </View>
        )}
      </Pressable>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    borderRadius: radius.lg,
    height: 210,
    width: '100%',
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  issueTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  issueMeta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  statusButtonActive: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  statusText: {
    color: colors.muted,
    fontWeight: '900',
  },
  statusTextActive: {
    color: colors.white,
  },
  proofBox: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 220,
    overflow: 'hidden',
  },
  proofImage: {
    height: '100%',
    width: '100%',
  },
  proofEmpty: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
