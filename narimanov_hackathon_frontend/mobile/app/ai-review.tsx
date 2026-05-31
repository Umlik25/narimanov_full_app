import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { PriorityBadge } from '@/components/Badge';
import { RoleMenu } from '@/components/RoleMenu';
import { Screen } from '@/components/Screen';
import { colors, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { categoryLabels } from '@/mock/data';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function AIReviewScreen() {
  const router = useRouter();
  const { aiDetections, approveDetection, issues, mergeDetection, pendingAiCount, rejectDetection } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const pending = aiDetections.filter((item) => item.status === 'pending');

  return (
    <>
      <Header onMenu={() => setMenuOpen(true)} title="AI Review" subtitle={`${pendingAiCount} detections pending`} />
      <Screen>
        {pending.map((item) => (
          <Card key={item.id} style={styles.card}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.title}>{categoryLabels[item.detectedCategory]}</Text>
            <Text style={styles.meta}>{item.location} · {item.detectedAt}</Text>
            <View style={styles.row}>
              <View style={styles.confidence}><Text style={styles.confidenceText}>{item.confidence}% confidence</Text></View>
              <PriorityBadge priority={item.priority} />
            </View>
            <View style={styles.actions}>
              <AppButton icon="check" onPress={() => approveDetection(item.id)} style={styles.action} tone="success">Approve</AppButton>
              <AppButton icon="close" onPress={() => rejectDetection(item.id)} style={styles.action} tone="danger">Reject</AppButton>
            </View>
            <Pressable onPress={() => mergeDetection(item.id, issues[0]?.id ?? '')} style={styles.merge}>
              <Text style={styles.mergeText}>Merge with nearest issue</Text>
            </Pressable>
          </Card>
        ))}
        {!pending.length ? (
          <Card style={styles.empty}>
            <Text style={styles.title}>AI queue is clear</Text>
            <Text style={styles.meta}>Approved, rejected, or merged detections are no longer pending.</Text>
            <AppButton onPress={() => router.push('/map')} style={styles.backToMap}>Back to Map</AppButton>
          </Card>
        ) : null}
      </Screen>
      <RoleMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  action: { flex: 1 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  backToMap: { marginTop: 12 },
  card: { marginBottom: 14, padding: 16 },
  confidence: { backgroundColor: colors.purpleSoft, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 8 },
  confidenceText: { color: colors.ai, fontSize: 12, fontWeight: '900' },
  empty: { alignItems: 'center', padding: 20 },
  image: { borderRadius: radius.lg, height: 190, marginBottom: 14, width: '100%' },
  merge: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, marginTop: 10, padding: 13 },
  mergeText: { color: colors.navy, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: 12, marginTop: 5 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  title: { color: colors.navy, fontSize: 19, fontWeight: '900' },
});
