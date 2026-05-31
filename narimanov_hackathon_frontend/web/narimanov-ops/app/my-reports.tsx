import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, PriorityBadge, StatusBadge } from '@/components/ui';
import { colors, radius } from '@/constants/theme';
import { useDemo } from '@/store/DemoContext';
import { categoryLabels } from '@/utils/labels';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function MyReportsScreen() {
  const { issues } = useDemo();
  const userIssues = issues.filter((issue) => issue.source === 'citizen_report').slice(0, 6);

  return (
    <AppLayout>
      <PageHeader
        title="My Reports"
        subtitle="Track citizen reports submitted through the Narimanov Ops portal."
        rightSlot={
          <Link href="/report" asChild>
            <Pressable style={styles.newButton}>
              <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
              <Text style={styles.newButtonText}>New Report</Text>
            </Pressable>
          </Link>
        }
      />
      <View style={styles.grid}>
        {userIssues.map((issue) => (
          <Card key={issue.id} style={styles.card}>
            <Image source={{ uri: issue.photo_url }} style={styles.image} />
            <View style={styles.copy}>
              <Text style={styles.title}>{issue.title}</Text>
              <Text style={styles.meta}>{categoryLabels[issue.category]} · {issue.address}</Text>
              <View style={styles.badges}>
                <PriorityBadge compact priority={issue.priority} />
                <StatusBadge compact status={issue.status} />
              </View>
            </View>
          </Card>
        ))}
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  newButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.md, flexDirection: 'row', gap: 8, height: 50, paddingHorizontal: 18 },
  newButtonText: { color: colors.white, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { flexDirection: 'row', gap: 14, minWidth: 360, padding: 14, width: '48%' as never },
  image: { borderRadius: radius.md, height: 96, width: 120 },
  copy: { flex: 1 },
  title: { color: '#06113E', fontSize: 16, fontWeight: '900' },
  meta: { color: '#34406B', fontSize: 13, lineHeight: 19, marginTop: 7 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
});
