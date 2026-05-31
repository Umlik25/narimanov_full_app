import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { Card, PriorityBadge, StatusBadge, markerColors } from '@/components/ui';
import { colors, radius } from '@/constants/theme';
import { useDemo } from '@/store/DemoContext';
import { categoryLabels } from '@/utils/labels';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

function Metric({ color, icon, label, sub, value }: { color: string; icon: string; label: string; sub: string; value: number }) {
  return (
    <Card style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon as never} size={30} color={colors.white} />
      </View>
      <View>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={[styles.metricSub, { color: color === colors.warning ? colors.danger : colors.success }]}>
          {sub}
        </Text>
      </View>
    </Card>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { issues, pendingAiCount } = useDemo();
  const isMobile = width < 820;
  const [dateOpen, setDateOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const urgent = issues.filter((issue) => issue.status === 'overdue' || issue.priority === 'critical').slice(0, 4);
  const metrics = [
    { color: colors.primary, icon: 'format-list-bulleted', label: 'Total Issues', sub: '12% vs yesterday', value: issues.length },
    { color: colors.success, icon: 'file-document-outline', label: 'New Reports', sub: '18% vs yesterday', value: issues.filter((issue) => issue.status === 'new').length },
    { color: colors.ai, icon: 'robot-outline', label: 'AI Pending Review', sub: `${pendingAiCount} need your review`, value: pendingAiCount },
    { color: colors.warning, icon: 'clock-outline', label: 'Overdue Issues', sub: '25% vs yesterday', value: issues.filter((issue) => issue.status === 'overdue').length },
  ];

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Good morning, Admin"
        title="Operations Dashboard"
        subtitle="Real-time overview of district operations"
        rightSlot={
          <View style={[styles.headerActions, isMobile && styles.headerActionsMobile]}>
            <Pressable accessibilityLabel="Open dashboard date range" onPress={() => setDateOpen((open) => !open)} style={styles.datePill}>
              <MaterialCommunityIcons name="calendar-month-outline" size={20} color="#34406B" />
              <Text style={styles.dateText}>May 29, 2026</Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color="#34406B" />
            </Pressable>
            <Pressable accessibilityLabel="Open notifications" onPress={() => setNotificationsOpen((open) => !open)} style={styles.bell}>
              <MaterialCommunityIcons name="bell-outline" size={22} color="#06113E" />
              <View style={styles.bellBadge}><Text style={styles.bellText}>3</Text></View>
            </Pressable>
            <Link href={'/report' as never} asChild>
              <Pressable style={styles.primaryButton}>
                <MaterialCommunityIcons name="plus" size={22} color={colors.white} />
                <Text style={styles.primaryButtonText}>New Report</Text>
              </Pressable>
            </Link>
          </View>
        }
      />
      <Modal transparent visible={dateOpen} animationType="fade" onRequestClose={() => setDateOpen(false)}>
        <Pressable style={styles.dropdownBackdrop} onPress={() => setDateOpen(false)}>
          <View style={styles.dateMenu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Select date range</Text>
              <Pressable onPress={() => setDateOpen(false)}><MaterialCommunityIcons name="close" size={18} color="#34406B" /></Pressable>
            </View>
            {['Today', 'This week', 'Last 7 days'].map((item) => (
              <Pressable key={item} onPress={() => setDateOpen(false)} style={styles.menuRow}>
                <MaterialCommunityIcons name="calendar-check-outline" size={17} color={colors.primary} />
                <Text style={styles.menuText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
      <Modal transparent visible={notificationsOpen} animationType="fade" onRequestClose={() => setNotificationsOpen(false)}>
        <Pressable style={styles.dropdownBackdrop} onPress={() => setNotificationsOpen(false)}>
          <View style={styles.notificationMenu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Notifications</Text>
              <Pressable onPress={() => setNotificationsOpen(false)}><MaterialCommunityIcons name="close" size={18} color="#34406B" /></Pressable>
            </View>
            {[`${issues.filter((issue) => issue.status === 'overdue').length} overdue issues need review`, `${pendingAiCount} AI detections are waiting`, 'Road team accepted assignment'].map((item) => (
              <Text key={item} style={styles.notificationText}>{item}</Text>
            ))}
          </View>
        </Pressable>
      </Modal>

      <View style={[styles.metricsRow, isMobile && styles.metricsRowMobile]}>
        {metrics.map((item) => <Metric key={item.label} {...item} />)}
      </View>

      <View style={[styles.mainGrid, isMobile && styles.gridMobile]}>
        <Card style={styles.mapCard}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Live Situation Map</Text>
          </View>
          <View style={styles.mapPreview}>
            <InteractiveMap
              issues={issues}
              onSelectIssue={() => undefined}
              selectedId={issues[0].id}
              statusColors={markerColors}
            />
            <Link href={'/admin/map' as never} asChild>
              <Pressable style={styles.mapButton}>
                <Text style={styles.mapButtonText}>View Full Map</Text>
                <MaterialCommunityIcons name="arrow-top-right" size={16} color={colors.primary} />
              </Pressable>
            </Link>
          </View>
        </Card>

        <Card style={styles.urgentCard}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Urgent Issues</Text>
            <Link href={'/admin/map' as never} asChild>
              <Pressable><Text style={styles.linkText}>View All</Text></Pressable>
            </Link>
          </View>
          {urgent.map((issue) => (
            <Link key={issue.id} href={`/admin/issues/${issue.id}` as never} asChild>
              <Pressable style={styles.urgentRow}>
                <View style={[styles.statusDot, { backgroundColor: markerColors[issue.status] }]} />
                <Image source={{ uri: issue.photo_url }} style={styles.urgentThumb} />
                <View style={styles.urgentCopy}>
                  <Text style={styles.urgentTitle}>{issue.title}</Text>
                  <Text style={styles.urgentMeta}>{issue.address}</Text>
                  <StatusBadge compact status={issue.status} />
                </View>
                <Text style={styles.timeText}>1h ago</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color={colors.muted} />
              </Pressable>
            </Link>
          ))}
        </Card>
      </View>

      <View style={[styles.bottomGrid, isMobile && styles.gridMobile]}>
        <Card style={styles.activityCard}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Recent Activity</Text>
            <Pressable onPress={() => router.push('/admin/analytics' as never)}>
              <Text style={styles.linkText}>View All</Text>
            </Pressable>
          </View>
          {[
            ['robot-outline', 'AI detected new issue: Damaged sidewalk', 'AI Detection · Heydar Aliyev Avenue', colors.ai],
            ['check-circle-outline', 'Issue resolved: Fallen tree blocking sidewalk', 'Resolved by Field Team · Ataturk Avenue', colors.success],
            ['clipboard-text-outline', 'New report submitted: Water accumulation', 'Submitted by Inspector · Montin area', colors.primary],
            ['account-hard-hat-outline', 'Issue assigned: Overflowing trash container', 'Assigned to Sanitation Dept.', colors.warning],
          ].map(([icon, title, meta, color]) => (
            <View key={title} style={styles.activityRow}>
              <View style={[styles.activityIcon, { backgroundColor: `${color}1A` }]}>
                <MaterialCommunityIcons name={icon as never} size={20} color={color as string} />
              </View>
              <View style={styles.activityCopy}>
                <Text style={styles.activityTitle}>{title}</Text>
                <Text style={styles.activityMeta}>{meta}</Text>
              </View>
              <Text style={styles.activityTime}>09:58 AM</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.aiCard}>
          <MaterialCommunityIcons name="shield-check-outline" size={42} color={colors.primary} />
          <Text style={styles.aiTitle}>Stay on Top</Text>
          <Text style={styles.aiText}>You have {pendingAiCount} AI detections waiting for your review.</Text>
          <Link href={'/admin/ai-review' as never} asChild>
            <Pressable style={styles.aiButton}>
              <Text style={styles.aiButtonText}>Review Now</Text>
              <MaterialCommunityIcons name="arrow-top-right" size={16} color={colors.primary} />
            </Pressable>
          </Link>
        </Card>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  headerActionsMobile: { alignItems: 'stretch', flexWrap: 'wrap', width: '100%' },
  dropdownBackdrop: { flex: 1, zIndex: 50 },
  dateMenu: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 8,
    position: 'absolute',
    right: 210,
    top: 96,
    width: 190,
    zIndex: 20,
  },
  menuHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  menuRow: { alignItems: 'center', flexDirection: 'row', gap: 9, paddingHorizontal: 10, paddingVertical: 10 },
  menuText: { color: '#06113E', fontWeight: '800' },
  notificationMenu: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 14,
    position: 'absolute',
    right: 142,
    top: 96,
    width: 260,
    zIndex: 20,
  },
  menuTitle: { color: '#06113E', fontSize: 14, fontWeight: '900', marginBottom: 8 },
  notificationText: { borderTopColor: colors.border, borderTopWidth: 1, color: '#34406B', fontSize: 12, paddingVertical: 9 },
  datePill: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  dateText: { color: '#06113E', fontSize: 14, fontWeight: '700' },
  bell: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    position: 'relative',
    width: 52,
  },
  bellBadge: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 999,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    top: -6,
    width: 20,
  },
  bellText: { color: colors.white, fontSize: 11, fontWeight: '900' },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 10,
    height: 52,
    paddingHorizontal: 22,
  },
  primaryButtonText: { color: colors.white, fontSize: 15, fontWeight: '900' },
  metricsRow: { flexDirection: 'row', gap: 18, marginBottom: 18 },
  metricsRowMobile: { flexDirection: 'column' },
  metricCard: { alignItems: 'center', flexDirection: 'row', flex: 1, gap: 22, minHeight: 118, padding: 20 },
  metricIcon: { alignItems: 'center', borderRadius: 14, height: 58, justifyContent: 'center', width: 58 },
  metricLabel: { color: '#34406B', fontSize: 14 },
  metricValue: { color: '#06113E', fontSize: 30, fontWeight: '900', marginTop: 8 },
  metricSub: { fontSize: 14, fontWeight: '800', marginTop: 12 },
  mainGrid: { flexDirection: 'row', gap: 18, marginBottom: 18 },
  gridMobile: { flexDirection: 'column' },
  mapCard: { flex: 1.2, padding: 22 },
  urgentCard: { flex: 1, minWidth: 0, padding: 22 },
  cardTitleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  cardTitle: { color: '#06113E', fontSize: 18, fontWeight: '900' },
  linkText: { color: colors.primary, fontSize: 13, fontWeight: '900' },
  mapPreview: { backgroundColor: colors.blueSoft, borderRadius: radius.md, height: 330, overflow: 'hidden', position: 'relative' },
  mapButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    bottom: 16,
    flexDirection: 'row',
    gap: 8,
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: 'absolute',
  },
  mapButtonText: { color: colors.primary, fontSize: 13, fontWeight: '900' },
  urgentRow: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 12, paddingVertical: 12 },
  statusDot: { borderRadius: 999, height: 20, width: 20 },
  urgentThumb: { backgroundColor: colors.surface, borderRadius: radius.sm, height: 58, width: 78 },
  urgentCopy: { flex: 1, gap: 5 },
  urgentTitle: { color: '#06113E', fontSize: 14, fontWeight: '900' },
  urgentMeta: { color: colors.muted, fontSize: 12 },
  timeText: { color: colors.muted, fontSize: 12 },
  bottomGrid: { flexDirection: 'row', gap: 18 },
  activityCard: { flex: 2, padding: 22 },
  activityRow: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 14, paddingVertical: 12 },
  activityIcon: { alignItems: 'center', borderRadius: radius.sm, height: 42, justifyContent: 'center', width: 42 },
  activityCopy: { flex: 1 },
  activityTitle: { color: '#06113E', fontSize: 14, fontWeight: '900' },
  activityMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  activityTime: { color: '#34406B', fontSize: 12 },
  aiCard: { backgroundColor: '#EAF2FF', flex: 1, justifyContent: 'center', padding: 28 },
  aiTitle: { color: colors.primary, fontSize: 18, fontWeight: '900', marginTop: 18 },
  aiText: { color: '#34406B', fontSize: 15, lineHeight: 22, marginTop: 14 },
  aiButton: { alignItems: 'center', alignSelf: 'flex-start', borderColor: '#A8C4FF', borderRadius: radius.sm, borderWidth: 1, flexDirection: 'row', gap: 8, marginTop: 28, paddingHorizontal: 18, paddingVertical: 13 },
  aiButtonText: { color: colors.primary, fontWeight: '900' },
});
