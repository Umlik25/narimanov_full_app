import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { Card, PriorityBadge, StatusBadge, markerColors } from '@/components/ui';
import { colors, radius } from '@/constants/theme';
import { useDemo } from '@/store/DemoContext';
import type { IssueStatus } from '@/types/domain';
import { categoryLabels, statusLabels } from '@/utils/labels';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

const filters: Array<IssueStatus | 'all'> = ['all', 'new', 'needs_review', 'assigned', 'in_progress', 'resolved', 'overdue'];
const legendStatuses: IssueStatus[] = ['new', 'needs_review', 'assigned', 'in_progress', 'resolved', 'overdue'];

export default function MapScreen() {
  const router = useRouter();
  const { issues, role } = useDemo();
  const { height, width } = useWindowDimensions();
  const isMobile = width < 980;
  const mapHeight = isMobile ? 430 : Math.max(540, Math.min(660, height - 270));
  const [filter, setFilter] = useState<IssueStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState(issues[3]?.id ?? issues[0]?.id);
  const [filterOpen, setFilterOpen] = useState(false);
  const visibleIssues = useMemo(() => (filter === 'all' ? issues : issues.filter((issue) => issue.status === filter)), [filter]);
  const selected = issues.find((issue) => issue.id === selectedId) ?? visibleIssues[0] ?? issues[0];

  return (
    <AppLayout>
      <PageHeader
        title="Live Situation Map"
        subtitle="Real-time overview of issues across Narimanov district"
        rightSlot={
          <View style={styles.headerActions}>
            <View style={styles.searchBox}>
              <MaterialCommunityIcons name="magnify" size={22} color="#34406B" />
              <TextInput placeholder="Search location..." placeholderTextColor="#667085" style={styles.searchInput} />
              <MaterialCommunityIcons name="magnify" size={22} color="#34406B" />
            </View>
            <Pressable onPress={() => setFilterOpen((open) => !open)} style={styles.bell}>
              <MaterialCommunityIcons name="bell-outline" size={22} color="#06113E" />
              <View style={styles.bellBadge}><Text style={styles.bellText}>3</Text></View>
            </Pressable>
            <Link href={'/report' as never} asChild>
              <Pressable style={styles.reportButton}>
                <MaterialCommunityIcons name="camera-outline" size={20} color={colors.white} />
                <Text style={styles.reportText}>Report Issue</Text>
                <MaterialCommunityIcons name="chevron-down" size={18} color={colors.white} />
              </Pressable>
            </Link>
          </View>
        }
      />

      <View style={styles.filterRow}>
        {filters.map((item) => {
          const active = filter === item;
          const label = item === 'all' ? 'All Status' : statusLabels[item];
          const dotColor = item === 'all' ? colors.primary : markerColors[item];
          return (
            <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filterChip, active && styles.filterChipActive]}>
              <View style={[styles.filterDot, { backgroundColor: dotColor }]} />
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
              {item === 'all' ? <MaterialCommunityIcons name="chevron-down" size={16} color="#06113E" /> : null}
            </Pressable>
          );
        })}
        <Pressable onPress={() => setFilterOpen((open) => !open)} style={styles.filterChip}><Text style={styles.filterText}>All Categories</Text><MaterialCommunityIcons name="chevron-down" size={16} color="#06113E" /></Pressable>
        <Pressable onPress={() => setFilterOpen((open) => !open)} style={styles.filterChip}><MaterialCommunityIcons name="filter-variant" size={19} color="#06113E" /><Text style={styles.filterText}>Filters</Text></Pressable>
      </View>
      {filterOpen ? (
        <View style={styles.filterMenu}>
          <Text style={styles.filterMenuTitle}>Map filters</Text>
          <Text style={styles.filterMenuText}>Showing satellite layer, all categories, and selected status: {filter === 'all' ? 'All' : statusLabels[filter]}.</Text>
        </View>
      ) : null}

      <View style={[styles.contentRow, isMobile && styles.contentColumn]}>
        <View style={[styles.mapPanel, { height: mapHeight }, isMobile && styles.mapPanelMobile]}>
          <InteractiveMap
            issues={visibleIssues}
            selectedId={selected?.id}
            statusColors={markerColors}
            onSelectIssue={setSelectedId}
          />
          <View style={styles.legend}>
            {legendStatuses.map((status) => (
              <View key={status} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: markerColors[status] }]} />
                <Text style={styles.legendLabel}>{statusLabels[status]}</Text>
                <Text style={styles.legendCount}>{issues.filter((issue) => issue.status === status).length || (status === 'new' ? 24 : status === 'resolved' ? 56 : status === 'overdue' ? 15 : status === 'in_progress' ? 45 : status === 'assigned' ? 21 : 18)}</Text>
              </View>
            ))}
          </View>
        </View>

        {selected ? (
          <Card style={[styles.detailsPanel, { height: mapHeight }, isMobile && styles.detailsPanelMobile]}>
            <View style={styles.detailsContent}>
              <View>
                <View style={styles.sideTop}>
                  <Text style={styles.backText}>Selected issue</Text>
                  <Text style={styles.indexText}>3 of 24</Text>
                </View>
                <View style={styles.sideMeta}>
                  <StatusBadge compact status={selected.status} />
                  <Text style={styles.issueId}>ID: {selected.id}</Text>
                </View>
                <Image source={{ uri: selected.photo_url }} style={styles.sideImage} />
                <Text numberOfLines={2} style={styles.sideTitle}>{selected.title}</Text>
                <Text numberOfLines={1} style={styles.sideAddress}>{selected.address}</Text>

                <View style={styles.infoRow}><Text style={styles.infoLabel}>Category</Text><Text numberOfLines={1} style={styles.infoValue}>{categoryLabels[selected.category]}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Priority</Text><PriorityBadge compact priority={selected.priority} /></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Reported</Text><Text numberOfLines={1} style={styles.infoValue}>May 29, 2026 · 09:15 AM</Text></View>

                <View style={styles.descriptionBlock}>
                  <Text style={styles.infoLabel}>Description</Text>
                  <Text numberOfLines={2} style={styles.descriptionText}>{selected.description}</Text>
                </View>
              </View>

              {role === 'admin' ? (
                <Link href={`/admin/issues/${selected.id}` as never} asChild>
                  <Pressable style={styles.viewButton}><Text style={styles.viewText}>View Details</Text></Pressable>
                </Link>
              ) : (
                <Pressable onPress={() => router.push('/my-reports' as never)} style={styles.viewButton}>
                  <Text style={styles.viewText}>Track My Reports</Text>
                </Pressable>
              )}
            </View>
          </Card>
        ) : null}
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    height: 54,
    paddingHorizontal: 18,
    width: 330,
  },
  searchInput: { color: colors.ink, flex: 1, fontSize: 14, outlineStyle: 'none' as never },
  bell: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, height: 54, justifyContent: 'center', position: 'relative', width: 54 },
  bellBadge: { alignItems: 'center', backgroundColor: colors.danger, borderRadius: 999, height: 20, justifyContent: 'center', position: 'absolute', right: -4, top: -6, width: 20 },
  bellText: { color: colors.white, fontSize: 11, fontWeight: '900' },
  reportButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.md, flexDirection: 'row', gap: 10, height: 54, paddingHorizontal: 22 },
  reportText: { color: colors.white, fontSize: 15, fontWeight: '900' },
  filterRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  filterChip: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 42, paddingHorizontal: 14 },
  filterChipActive: { borderColor: '#B8CCFF' },
  filterDot: { borderRadius: 999, height: 14, width: 14 },
  filterText: { color: '#06113E', fontSize: 14, fontWeight: '800' },
  filterTextActive: { color: colors.primary },
  filterMenu: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, marginBottom: 12, maxWidth: 420, padding: 14 },
  filterMenuTitle: { color: '#06113E', fontWeight: '900', marginBottom: 6 },
  filterMenuText: { color: '#34406B', fontSize: 13, lineHeight: 19 },
  contentRow: { flexDirection: 'row', gap: 18 },
  contentColumn: { flexDirection: 'column' },
  mapPanel: { borderRadius: radius.lg, flex: 1, overflow: 'hidden', position: 'relative' },
  mapPanelMobile: { flex: 0 },
  legend: { backgroundColor: '#FFFFFFF0', borderRadius: radius.md, bottom: 18, left: 18, padding: 14, position: 'absolute', width: 190 },
  legendRow: { alignItems: 'center', flexDirection: 'row', gap: 10, paddingVertical: 5 },
  legendDot: { borderRadius: 999, height: 13, width: 13 },
  legendLabel: { color: '#06113E', flex: 1, fontSize: 13 },
  legendCount: { color: '#06113E', fontSize: 13, fontWeight: '900' },
  detailsPanel: { flexShrink: 0, overflow: 'hidden', padding: 18, width: 360 },
  detailsPanelMobile: { height: 'auto' as never, width: '100%' },
  detailsContent: { flex: 1, justifyContent: 'space-between' },
  sideTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  backText: { color: '#34406B', fontSize: 13, fontWeight: '800' },
  indexText: { color: '#06113E', fontSize: 13, fontWeight: '800' },
  sideMeta: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  issueId: { color: '#34406B', fontSize: 13, fontWeight: '800' },
  sideImage: { borderRadius: radius.md, height: 100, width: '100%' },
  sideTitle: { color: '#06113E', fontSize: 17, fontWeight: '900', lineHeight: 21, marginTop: 12 },
  sideAddress: { color: '#34406B', fontSize: 13, marginBottom: 10, marginTop: 5 },
  infoRow: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', gap: 12, justifyContent: 'space-between', paddingVertical: 7 },
  infoLabel: { color: '#34406B', fontSize: 13 },
  infoValue: { color: '#06113E', flexShrink: 1, fontSize: 13, fontWeight: '800', maxWidth: 180, textAlign: 'right' },
  descriptionBlock: { borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 10 },
  descriptionText: { color: '#34406B', fontSize: 12, lineHeight: 17, marginTop: 6 },
  viewButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.sm, height: 46, justifyContent: 'center', marginTop: 14 },
  viewText: { color: colors.white, fontSize: 15, fontWeight: '900', lineHeight: 18 },
  assignButton: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, flexDirection: 'row', gap: 10, height: 46, justifyContent: 'center', marginTop: 9 },
  assignText: { color: colors.primary, fontSize: 15, fontWeight: '900' },
});
