import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { RoleMenu } from '@/components/RoleMenu';
import { Screen } from '@/components/Screen';
import { StatusBadge } from '@/components/Badge';
import { colors, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { categoryLabels } from '@/mock/data';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function MyReportsScreen() {
  const router = useRouter();
  const { userIssues } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Header onMenu={() => setMenuOpen(true)} title="My Reports" subtitle={`${userIssues.length} submitted reports`} />
      <Screen>
        {userIssues.map((issue) => (
          <Card key={issue.id} style={styles.card}>
            <Image source={issue.photo} style={styles.thumb} />
            <View style={styles.copy}>
              <Text numberOfLines={2} style={styles.title}>{issue.title}</Text>
              <Text style={styles.meta}>{categoryLabels[issue.category]} · {issue.reportedAt}</Text>
              <StatusBadge status={issue.status} />
              <AppButton onPress={() => router.push(`/user-report/${issue.id}` as never)} style={styles.button} tone="secondary">Track Progress</AppButton>
            </View>
          </Card>
        ))}
        <Pressable onPress={() => router.push('/report')} style={styles.newReport}>
          <Text style={styles.newReportText}>Submit another report</Text>
        </Pressable>
      </Screen>
      <RoleMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
  },
  card: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
    padding: 14,
  },
  copy: {
    flex: 1,
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 10,
    marginTop: 6,
  },
  newReport: {
    alignItems: 'center',
    backgroundColor: colors.blueSoft,
    borderRadius: radius.md,
    padding: 16,
  },
  newReportText: {
    color: colors.primary,
    fontWeight: '900',
  },
  thumb: {
    borderRadius: radius.md,
    height: 112,
    width: 104,
  },
  title: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
  },
});
