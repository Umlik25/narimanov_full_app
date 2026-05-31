import { FloatingButton } from '@/components/FloatingButton';
import { IssueBottomSheet } from '@/components/IssueBottomSheet';
import { MapCanvas, type MapCanvasHandle, type MapRegion } from '@/components/MapCanvas';
import { RoleMenu } from '@/components/RoleMenu';
import { colors, NARIMANOV_REGION, radius, shadow } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { categoryLabels, statusColors } from '@/mock/data';
import type { AiDetection, Issue } from '@/types/domain';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapCanvasHandle>(null);
  const { aiDetections, issues, pendingAiCount, role, userIssues } = useApp();
  const [region, setRegion] = useState<MapRegion>(NARIMANOV_REGION);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | Issue['status']>('all');

  const isAdmin = role === 'admin';
  const mapIssues = useMemo(() => {
    const source = isAdmin ? issues : userIssues;
    return activeFilter === 'all' ? source : source.filter((issue) => issue.status === activeFilter);
  }, [activeFilter, isAdmin, issues, userIssues]);

  const activeCount = mapIssues.filter((issue) => ['new', 'assigned', 'in_progress'].includes(issue.status)).length;
  const overdueCount = mapIssues.filter((issue) => issue.status === 'overdue').length;

  const animateTo = (next: MapRegion) => {
    setRegion(next);
    mapRef.current?.animateToRegion(next);
  };

  const zoom = (direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 0.55 : 1.65;
    animateTo({ ...region, latitudeDelta: Math.max(0.003, region.latitudeDelta * factor), longitudeDelta: Math.max(0.003, region.longitudeDelta * factor) });
  };

  const useLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') return;
    const current = await Location.getCurrentPositionAsync({});
    animateTo({
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
      latitudeDelta: 0.018,
      longitudeDelta: 0.018,
    });
  };

  const openSelected = () => {
    if (!selectedIssue) return;
    if (selectedIssue.id.startsWith('DET-')) {
      router.push('/ai-review');
      return;
    }
    router.push(isAdmin ? `/admin-issue/${selectedIssue.id}` : `/user-report/${selectedIssue.id}`);
  };

  const detectionIssue = (detection: AiDetection): Issue => {
    return {
      id: `DET-${detection.id}`,
      title: `AI detected ${categoryLabels[detection.detectedCategory].toLowerCase()}`,
      description: `Pending AI detection with ${detection.confidence}% confidence.`,
      category: detection.detectedCategory,
      priority: detection.priority,
      status: 'ai_review',
      location: detection.location,
      latitude: detection.latitude,
      longitude: detection.longitude,
      reportedAt: detection.detectedAt,
      reportedBy: 'AI System',
      source: 'ai',
      photo: detection.image,
      timeline: [{ time: detection.detectedAt, action: 'AI detection queued', by: 'AI System' }],
      comments: [],
    };
  };

  return (
    <View style={styles.screen}>
      <MapCanvas
        ref={mapRef}
        initialRegion={NARIMANOV_REGION}
        aiDetections={isAdmin ? aiDetections.filter((item) => item.status === 'pending') : []}
        issues={mapIssues}
        isAdmin={isAdmin}
        onDetectionPress={(detection) => setSelectedIssue(detectionIssue(detection))}
        onIssuePress={setSelectedIssue}
        onRegionChangeComplete={setRegion}
        statusColors={statusColors}
      />

      <View style={[styles.topBar, { top: Math.max(insets.top + 14, Platform.OS === 'ios' ? 72 : 34) }]}>
        <Pressable onPress={() => setMenuOpen(true)} style={styles.iconButton}>
          <MaterialCommunityIcons name="menu" size={24} color={colors.navy} />
        </Pressable>
        <View style={styles.search}>
          <MaterialCommunityIcons name="magnify" size={21} color={colors.muted} />
          <TextInput placeholder="Search Narimanov..." placeholderTextColor={colors.subtle} style={styles.searchInput} />
        </View>
        {isAdmin ? (
          <Pressable onPress={() => setFiltersOpen(true)} style={styles.iconButton}>
            <MaterialCommunityIcons name="tune-variant" size={22} color={colors.navy} />
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.summary, { top: Math.max(insets.top + 76, Platform.OS === 'ios' ? 134 : 112) }]}>
        <View style={styles.summaryItem}><Text style={styles.summaryValue}>{activeCount}</Text><Text style={styles.summaryLabel}>active</Text></View>
        <View style={styles.summaryItem}><Text style={[styles.summaryValue, overdueCount ? styles.red : null]}>{overdueCount}</Text><Text style={styles.summaryLabel}>overdue</Text></View>
        {isAdmin ? <View style={styles.summaryItem}><Text style={[styles.summaryValue, styles.purple]}>{pendingAiCount}</Text><Text style={styles.summaryLabel}>AI</Text></View> : null}
      </View>

      <View style={[styles.rightControls, { top: Math.max(insets.top + 138, Platform.OS === 'ios' ? 196 : 182) }]}>
        <FloatingButton icon="plus" onPress={() => zoom('in')} tone="white" />
        <FloatingButton icon="minus" onPress={() => zoom('out')} tone="white" />
        <FloatingButton icon="crosshairs-gps" onPress={useLocation} tone="white" />
      </View>

      <View style={[styles.bottomActions, { bottom: Math.max(insets.bottom + 16, Platform.OS === 'ios' ? 46 : 24) }]}>
        {!isAdmin ? <FloatingButton icon="camera-plus-outline" label="Report Issue" onPress={() => router.push('/report')} /> : null}
        <FloatingButton icon="robot-happy-outline" label="AI Assistant" onPress={() => router.push('/ai-chat')} tone="ai" />
      </View>

      <IssueBottomSheet
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onPrimary={openSelected}
        onSecondary={() => router.push(isAdmin ? (selectedIssue?.status === 'ai_review' ? '/ai-review' : `/admin-issue/${selectedIssue?.id}`) : `/user-report/${selectedIssue?.id}`)}
        role={isAdmin ? 'admin' : 'user'}
        visible={Boolean(selectedIssue)}
      />
      <RoleMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />

      <Modal transparent visible={filtersOpen} animationType="fade" onRequestClose={() => setFiltersOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setFiltersOpen(false)}>
          <Pressable style={[styles.filterPanel, { paddingBottom: Math.max(insets.bottom + 18, 28) }]}>
            <View style={styles.filterHeader}>
              <View>
                <Text style={styles.filterTitle}>Map filters</Text>
                <Text style={styles.filterSubtitle}>Choose one status to show.</Text>
              </View>
              <Pressable onPress={() => setFiltersOpen(false)} style={styles.filterClose}>
                <MaterialCommunityIcons name="close" size={20} color={colors.navy} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.filterGrid}>
              {(['all', 'new', 'ai_review', 'assigned', 'in_progress', 'overdue', 'resolved'] as const).map((item) => {
                const active = activeFilter === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setActiveFilter(item);
                      setFiltersOpen(false);
                    }}
                    style={[styles.filterChip, active && styles.filterChipActive]}>
                    <View style={[styles.filterDot, { backgroundColor: item === 'all' ? colors.primary : statusColors[item] }]} />
                    <Text numberOfLines={1} style={[styles.filterText, active && styles.filterTextActive]}>{item === 'all' ? 'All' : item.replace('_', ' ')}</Text>
                    {active ? <MaterialCommunityIcons name="check-circle" size={17} color={colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomActions: {
    flexDirection: 'row',
    gap: 10,
    left: 18,
    position: 'absolute',
    right: 18,
  },
  filterDot: {
    borderRadius: 999,
    height: 11,
    width: 11,
  },
  filterPanel: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '62%',
    padding: 18,
    ...shadow,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 12,
    width: '48%',
  },
  filterChipActive: {
    backgroundColor: colors.blueSoft,
    borderColor: colors.primary,
  },
  filterClose: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 4,
  },
  filterHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterText: {
    color: colors.navy,
    flex: 1,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  filterTextActive: {
    color: colors.primary,
  },
  filterSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  filterTitle: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
    ...shadow,
  },
  modalBackdrop: {
    backgroundColor: '#08122D66',
    flex: 1,
    justifyContent: 'flex-end',
  },
  purple: {
    color: colors.ai,
  },
  red: {
    color: colors.danger,
  },
  rightControls: {
    gap: 10,
    position: 'absolute',
    right: 18,
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  search: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    paddingHorizontal: 14,
    ...shadow,
  },
  searchInput: {
    color: colors.navy,
    flex: 1,
    fontSize: 15,
  },
  summary: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 4,
    left: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: 'absolute',
    ...shadow,
  },
  summaryItem: {
    alignItems: 'center',
    minWidth: 58,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  summaryValue: {
    color: colors.navy,
    fontSize: 19,
    fontWeight: '900',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    left: 18,
    position: 'absolute',
    right: 18,
  },
});
