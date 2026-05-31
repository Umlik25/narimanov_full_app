import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { RoleMenu } from '@/components/RoleMenu';
import { Screen } from '@/components/Screen';
import { colors, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { categoryLabels } from '@/mock/data';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AnalyticsScreen() {
  const { aiDetections, issues } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const resolved = issues.filter((issue) => issue.status === 'resolved').length;
  const overdue = issues.filter((issue) => issue.status === 'overdue').length;
  const rate = Math.round((resolved / Math.max(1, issues.length)) * 100);
  const categoryRows = Object.entries(categoryLabels).map(([category, label]) => ({
    label,
    value: issues.filter((issue) => issue.category === category).length,
  })).filter((item) => item.value > 0).sort((a, b) => b.value - a.value).slice(0, 5);

  return (
    <>
      <Header onMenu={() => setMenuOpen(true)} title="Analytics" subtitle="Mobile summary" />
      <Screen>
        <View style={styles.metrics}>
          <Metric label="Total" value={issues.length} color={colors.primary} />
          <Metric label="Resolved" value={resolved} color={colors.success} />
          <Metric label="Overdue" value={overdue} color={colors.danger} />
          <Metric label="AI" value={aiDetections.filter((item) => item.status === 'pending').length} color={colors.ai} />
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Resolution rate</Text>
          <Text style={styles.bigValue}>{rate}%</Text>
          <View style={styles.track}><View style={[styles.fill, { width: `${rate}%` }]} /></View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Top categories</Text>
          {categoryRows.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <View style={styles.bar}><View style={[styles.barFill, { width: `${Math.min(100, row.value * 22)}%` }]} /></View>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Top locations</Text>
          {['Ataturk Avenue', 'Haji Murad Street', 'Mammad Araz Street', 'Ziya Bunyadov Avenue'].map((item, index) => (
            <View key={item} style={styles.locationRow}>
              <View style={[styles.rank, { backgroundColor: [colors.danger, colors.orange, colors.primary, colors.ai][index] }]}><Text style={styles.rankText}>{index + 1}</Text></View>
              <Text style={styles.locationText}>{item}</Text>
            </View>
          ))}
        </Card>
      </Screen>
      <RoleMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function Metric({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <Card style={styles.metric}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.background, borderRadius: 999, flex: 1, height: 8, overflow: 'hidden' },
  barFill: { backgroundColor: colors.primary, borderRadius: 999, height: 8 },
  bigValue: { color: colors.navy, fontSize: 38, fontWeight: '900', marginBottom: 12 },
  card: { marginBottom: 14, padding: 18 },
  cardTitle: { color: colors.navy, fontSize: 18, fontWeight: '900', marginBottom: 14 },
  fill: { backgroundColor: colors.success, borderRadius: 999, height: 10 },
  locationRow: { alignItems: 'center', flexDirection: 'row', gap: 12, paddingVertical: 10 },
  locationText: { color: colors.navy, flex: 1, fontWeight: '800' },
  metric: { alignItems: 'center', flex: 1, minWidth: '45%', padding: 16 },
  metricLabel: { color: colors.muted, fontSize: 12, marginTop: 4 },
  metricValue: { fontSize: 28, fontWeight: '900' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  rank: { alignItems: 'center', borderRadius: 999, height: 28, justifyContent: 'center', width: 28 },
  rankText: { color: colors.white, fontWeight: '900' },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 13 },
  rowLabel: { color: colors.navy, flex: 1.2, fontSize: 13, fontWeight: '800' },
  rowValue: { color: colors.navy, fontWeight: '900', width: 22 },
  track: { backgroundColor: colors.background, borderRadius: 999, height: 10, overflow: 'hidden' },
});
