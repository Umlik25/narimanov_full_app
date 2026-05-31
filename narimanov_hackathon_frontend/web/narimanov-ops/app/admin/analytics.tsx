import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui';
import { colors, radius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const metricData = [
  { color: colors.primary, icon: 'format-list-bulleted', label: 'Total Issues', sub: '12% from last week', value: '128' },
  { color: colors.success, icon: 'check-circle-outline', label: 'Resolved', sub: '20% from last week', value: '56' },
  { color: colors.ai, icon: 'pulse', label: 'Resolution Rate', sub: '8% from last week', value: '78%' },
  { color: colors.warning, icon: 'clock-outline', label: 'Avg. Resolution Time', sub: '0.6 days from last week', value: '2.4 days' },
  { color: colors.danger, icon: 'alert-outline', label: 'Overdue', sub: '25% from last week', value: '15' },
];

const categories: Array<[string, number, string]> = [
  ['Road Damage', 32, colors.primary],
  ['Waste Management', 28, colors.success],
  ['Flooding', 18, colors.warning],
  ['Lighting Problem', 14, colors.ai],
  ['Green Areas', 12, '#14B8A6'],
  ['Drainage', 10, colors.danger],
  ['Traffic', 8, '#FB7185'],
  ['Other', 6, '#F59EAB'],
];

const statuses: Array<[string, number, string]> = [
  ['New', 24, colors.primary],
  ['Assigned', 21, colors.warning],
  ['In Progress', 45, colors.ai],
  ['Resolved', 56, colors.success],
  ['Overdue', 15, colors.danger],
];

const departments = [
  ['Road Maintenance', 2.6, colors.primary],
  ['Sanitation & Waste', 2.1, colors.success],
  ['Street Lighting', 1.8, colors.warning],
  ['Drainage & Sewerage', 2.9, colors.ai],
  ['Green Spaces', 1.6, '#14B8A6'],
  ['Traffic Management', 2.3, colors.danger],
  ['Public Communications', 1.8, '#667DB6'],
];

export default function AnalyticsScreen() {
  const [dateOpen, setDateOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exported, setExported] = useState(false);
  const [range, setRange] = useState('Last 7 Days');
  const [filter, setFilter] = useState('All categories');
  const { width } = useWindowDimensions();
  const compact = width < 1500;

  const exportReport = () => {
    const rows = [
      'Narimanov Ops Analytics Report',
      `Date range,${range}`,
      'Metric,Value',
      'Total Issues,128',
      'Resolved,56',
      'Resolution Rate,78%',
      'Overdue,15',
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'narimanov-ops-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Analytics & Reports"
        subtitle="Track performance, identify trends and make data-driven decisions."
        rightSlot={
          <View style={styles.headerActions}>
            <Pressable onPress={() => setDateOpen(true)} style={styles.headerButton}><MaterialCommunityIcons name="calendar-month-outline" size={18} color="#34406B" /><Text style={styles.headerButtonText}>{range}</Text><MaterialCommunityIcons name="chevron-down" size={18} color="#34406B" /></Pressable>
            <Pressable onPress={() => setFiltersOpen((open) => !open)} style={styles.headerButton}><MaterialCommunityIcons name="filter-variant" size={18} color="#34406B" /><Text style={styles.headerButtonText}>Filters</Text></Pressable>
            <Pressable onPress={exportReport} style={styles.exportButton}><MaterialCommunityIcons name="download" size={18} color={colors.white} /><Text style={styles.exportText}>Export Report</Text></Pressable>
          </View>
        }
      />
      <Modal transparent visible={dateOpen} animationType="fade" onRequestClose={() => setDateOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setDateOpen(false)}>
          <View style={styles.dropdownPanel}>
            <Text style={styles.dropdownTitle}>Date range</Text>
            {['Today', 'Last 7 Days', 'Last 30 Days', 'Custom Range'].map((item) => (
              <Pressable key={item} onPress={() => { setRange(item); setDateOpen(false); }} style={styles.dropdownRow}>
                <Text style={styles.dropdownRowText}>{item}</Text>
                {range === item ? <MaterialCommunityIcons name="check" size={18} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
      <Modal transparent visible={filtersOpen} animationType="fade" onRequestClose={() => setFiltersOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setFiltersOpen(false)}>
          <View style={styles.dropdownPanel}>
            <Text style={styles.dropdownTitle}>Analytics filters</Text>
            {['All categories', 'Road damage only', 'Overdue only', 'AI-sourced issues'].map((item) => (
              <Pressable key={item} onPress={() => { setFilter(item); setFiltersOpen(false); }} style={styles.dropdownRow}>
                <Text style={styles.dropdownRowText}>{item}</Text>
                {filter === item ? <MaterialCommunityIcons name="check" size={18} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
      <Text style={styles.activeFilter}>Showing: {filter}</Text>
      {exported ? <View style={styles.exportNotice}><Text style={styles.exportNoticeText}>Report exported successfully: narimanov-ops-report.csv</Text></View> : null}

      <View style={[styles.metricsRow, compact && styles.metricsRowWrap]}>
        {metricData.map((item) => (
          <Card key={item.label} style={styles.metric}>
            <View style={[styles.metricIcon, { backgroundColor: item.color }]}>
              <MaterialCommunityIcons name={item.icon as never} size={28} color={colors.white} />
            </View>
            <View>
              <Text style={styles.metricLabel}>{item.label}</Text>
              <Text style={styles.metricValue}>{item.value}</Text>
              <Text style={[styles.metricSub, { color: item.color === colors.danger ? colors.danger : colors.success }]}>
                {item.sub}
              </Text>
            </View>
          </Card>
        ))}
      </View>

      <View style={styles.chartRow}>
        <DonutCard title="Issues by Category" data={categories} />
        <DonutCard title="Issues by Status" data={statuses} />
        <TrendCard />
      </View>

      <View style={styles.bottomRow}>
        <Card style={styles.locationCard}>
          <Text style={styles.cardTitle}>Top Problem Locations</Text>
          <View style={styles.locationSummary}>
            <MaterialCommunityIcons name="map-marker-alert-outline" size={34} color={colors.primary} />
            <View style={styles.locationSummaryCopy}>
              <Text style={styles.locationSummaryTitle}>Highest concentration</Text>
              <Text style={styles.locationSummaryText}>Ataturk Avenue and Narimanov Metro Area account for 39% of current reports.</Text>
            </View>
          </View>
          {['Ataturk Avenue', 'Narimanov Metro Area', 'Agha Neymatulla Street', 'Hasan Aliyev Street', 'Heydar Aliyev Center Area'].map((name, index) => (
            <View key={name} style={styles.locationRow}>
              <View style={[styles.rank, { backgroundColor: [colors.danger, colors.warning, '#EAB308', colors.success, colors.ai][index] }]}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <Text style={styles.locationName}>{name}</Text>
              <Text style={styles.locationCount}>{[28, 22, 18, 15, 12][index]}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.departmentCard}>
          <Text style={styles.cardTitle}>Resolution Time (by Department)</Text>
          <Text style={styles.axisLabel}>Average days to resolve</Text>
          {departments.map(([name, value, color]) => (
            <View key={name as string} style={styles.departmentRow}>
              <Text style={styles.departmentName}>{name}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { backgroundColor: color as string, width: `${Number(value) * 25}%` as never }]} />
              </View>
              <Text style={styles.daysText}>{value} days</Text>
            </View>
          ))}
        </Card>
      </View>
    </AppLayout>
  );
}

function DonutCard({ data, title }: { data: Array<[string, number, string]>; title: string }) {
  return (
    <Card style={styles.chartCard}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.donutRow}>
        <View style={styles.donut}>
          <Text style={styles.donutValue}>128</Text>
          <Text style={styles.donutLabel}>Total</Text>
        </View>
        <View style={styles.legendList}>
          {data.map(([label, value, color]) => (
            <View key={label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendLabel}>{label}</Text>
              <Text style={styles.legendValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

function TrendCard() {
  return (
    <Card style={styles.chartCard}>
      <Text style={styles.cardTitle}>Overdue Trend</Text>
      <View style={styles.trend}>
        {[10, 14, 19, 24, 29, 34, 27].map((value, index) => (
          <View key={index} style={styles.trendColumn}>
            <View style={[styles.trendPoint, { bottom: value * 3 }]} />
            <Text style={styles.trendLabel}>May {25 + index}</Text>
          </View>
        ))}
      </View>
      <View style={styles.trendLegend}><View style={styles.trendDot} /><Text style={styles.legendLabel}>Overdue Issues</Text></View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-end', maxWidth: 720 },
  headerButton: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', gap: 10, height: 48, paddingHorizontal: 16 },
  headerButtonText: { color: '#06113E', fontWeight: '800' },
  exportButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.md, flexDirection: 'row', gap: 10, height: 48, paddingHorizontal: 18 },
  exportText: { color: colors.white, fontWeight: '900' },
  modalBackdrop: { alignItems: 'flex-end', flex: 1, paddingRight: 36, paddingTop: 96 },
  dropdownPanel: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, padding: 12, width: 260 },
  dropdownTitle: { color: '#06113E', fontWeight: '900', marginBottom: 8 },
  dropdownRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11 },
  dropdownRowText: { color: '#06113E', fontWeight: '800' },
  activeFilter: { color: '#34406B', fontSize: 12, fontWeight: '800', marginBottom: 10 },
  exportNotice: { backgroundColor: colors.greenSoft, borderColor: '#B7E6C9', borderRadius: radius.md, borderWidth: 1, marginBottom: 12, padding: 12 },
  exportNoticeText: { color: colors.success, fontWeight: '900' },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  metricsRowWrap: { flexWrap: 'wrap' },
  metric: { alignItems: 'center', flexBasis: 230, flexGrow: 1, flexShrink: 1, flexDirection: 'row', gap: 14, minHeight: 104, minWidth: 0, padding: 16 },
  metricIcon: { alignItems: 'center', borderRadius: 999, height: 56, justifyContent: 'center', width: 56 },
  metricLabel: { color: '#34406B', fontSize: 13 },
  metricValue: { color: '#06113E', fontSize: 28, fontWeight: '900', marginTop: 8 },
  metricSub: { fontSize: 12, fontWeight: '800', marginTop: 8 },
  chartRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 18 },
  chartCard: { flex: 1, minHeight: 300, minWidth: 310, padding: 22 },
  cardTitle: { color: '#06113E', fontSize: 18, fontWeight: '900', marginBottom: 22 },
  donutRow: { alignItems: 'center', flexDirection: 'row', gap: 28 },
  donut: { alignItems: 'center', borderColor: colors.primary, borderRadius: 999, borderWidth: 20, height: 142, justifyContent: 'center', width: 142 },
  donutValue: { color: '#06113E', fontSize: 26, fontWeight: '900' },
  donutLabel: { color: '#34406B', fontSize: 12 },
  legendList: { flex: 1, gap: 11 },
  legendRow: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  legendDot: { borderRadius: 999, height: 11, width: 11 },
  legendLabel: { color: '#06113E', flex: 1, fontSize: 13 },
  legendValue: { color: '#06113E', fontSize: 13, fontWeight: '900' },
  trend: { borderBottomColor: colors.border, borderBottomWidth: 1, borderLeftColor: colors.border, borderLeftWidth: 1, flex: 1, flexDirection: 'row', paddingTop: 10 },
  trendColumn: { flex: 1, justifyContent: 'flex-end', position: 'relative' },
  trendPoint: { backgroundColor: colors.danger, borderRadius: 999, height: 10, left: '45%', position: 'absolute', width: 10 },
  trendLabel: { color: '#34406B', fontSize: 11, marginBottom: -24, textAlign: 'center' },
  trendLegend: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 34 },
  trendDot: { backgroundColor: colors.danger, borderRadius: 999, height: 11, width: 11 },
  bottomRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  locationCard: { flex: 1.05, padding: 22 },
  locationSummary: { alignItems: 'center', backgroundColor: colors.blueSoft, borderRadius: radius.md, flexDirection: 'row', gap: 14, marginBottom: 18, padding: 18 },
  locationSummaryCopy: { flex: 1 },
  locationSummaryTitle: { color: '#06113E', fontWeight: '900', marginBottom: 4 },
  locationSummaryText: { color: '#34406B', fontSize: 13, lineHeight: 19 },
  locationRow: { alignItems: 'center', flexDirection: 'row', gap: 12, paddingVertical: 7 },
  rank: { alignItems: 'center', borderRadius: 999, height: 24, justifyContent: 'center', width: 24 },
  rankText: { color: colors.white, fontSize: 12, fontWeight: '900' },
  locationName: { color: '#06113E', flex: 1, fontSize: 13 },
  locationCount: { color: '#06113E', fontSize: 13, fontWeight: '900' },
  departmentCard: { flex: 1, minWidth: 420, padding: 22 },
  axisLabel: { alignSelf: 'flex-end', color: '#34406B', fontSize: 11, marginTop: -16 },
  departmentRow: { alignItems: 'center', flexDirection: 'row', gap: 14, marginTop: 20 },
  departmentName: { color: '#06113E', fontSize: 13, width: 180 },
  barTrack: { backgroundColor: colors.background, borderRadius: 999, flex: 1, height: 10, overflow: 'hidden' },
  barFill: { borderRadius: 999, height: '100%' },
  daysText: { color: '#06113E', fontSize: 12, fontWeight: '800', width: 70 },
});
