import { AppLayout } from '@/components/layout/AppLayout';
import { Card, PriorityBadge, StatusBadge } from '@/components/ui';
import { colors, radius } from '@/constants/theme';
import { departments, issues } from '@/mock';
import { categoryLabels } from '@/utils/labels';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const timeline = [
  { color: colors.ai, icon: 'file-document-outline', role: 'Reporter', subtitle: 'Issue reported via mobile app', title: 'Issue Reported', user: 'Inspector_07' },
  { color: colors.ai, icon: 'robot-outline', role: 'System', subtitle: 'Detected by AI model with 91% confidence', title: 'AI Detected', user: 'AI Model v2.1' },
  { color: colors.primary, icon: 'clock-outline', role: 'System', subtitle: 'Waiting for admin review', title: 'Pending Review', user: 'System' },
  { color: colors.success, icon: 'check', role: 'Admin', subtitle: 'Issue approved and added to system', title: 'Approved', user: 'Admin User' },
  { color: colors.warning, icon: 'account-hard-hat-outline', role: 'Admin', subtitle: 'Assigned to Road Maintenance Department', title: 'Assigned', user: 'Admin User' },
  { color: colors.warning, icon: 'progress-clock', role: 'Executor', subtitle: 'Work has started on this issue', title: 'In Progress', user: 'Worker_12' },
];

export default function IssueDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const issue = issues.find((item) => item.id === id) ?? issues[0];
  const initialDepartmentIndex = Math.max(
    0,
    departments.findIndex((item) => item.id === issue.department_id),
  );
  const [departmentIndex, setDepartmentIndex] = useState(initialDepartmentIndex);
  const [deadline, setDeadline] = useState('June 02, 2026');
  const [status, setStatus] = useState(issue.status);
  const [assignmentSaved, setAssignmentSaved] = useState(true);
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [deadlineOpen, setDeadlineOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('Assignment saved.');
  const department = departmentIndex >= 0 ? departments[departmentIndex] : undefined;

  const deadlineOptions = ['June 02, 2026', 'June 04, 2026', 'June 07, 2026'];

  const saveAssignment = () => {
    setAssignmentSaved(true);
    setActionMessage(`Assignment saved for ${department?.name ?? 'no department'}.`);
  };

  return (
    <AppLayout>
      <View style={styles.topRow}>
        <Link href={'/admin/map' as never} asChild>
          <Pressable style={styles.backLink}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={colors.primary} />
            <Text style={styles.backText}>Back to Map</Text>
          </Pressable>
        </Link>
        <View style={styles.topActions}>
          <Pressable
            onPress={() => {
              setEditMode((current) => !current);
              setActionMessage(editMode ? 'Edit mode closed.' : 'Edit mode enabled. Assignment fields are ready.');
            }}
            style={[styles.topButton, editMode && styles.topButtonActive]}>
            <MaterialCommunityIcons name="pencil-outline" size={18} color={editMode ? colors.primary : '#06113E'} />
            <Text style={[styles.topButtonText, editMode && styles.topButtonTextActive]}>{editMode ? 'Editing' : 'Edit Issue'}</Text>
          </Pressable>
          <Pressable onPress={() => setShareOpen(true)} style={styles.topButton}><MaterialCommunityIcons name="upload-outline" size={18} color="#06113E" /><Text style={styles.topButtonText}>Share</Text></Pressable>
          <View style={styles.moreWrap}>
            <Pressable onPress={() => setMoreOpen((open) => !open)} style={styles.topButton}><MaterialCommunityIcons name="dots-vertical" size={18} color="#06113E" /><Text style={styles.topButtonText}>More</Text></Pressable>
            {moreOpen ? (
              <View style={styles.moreMenu}>
                {['Print summary', 'Duplicate issue', 'Archive issue'].map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setActionMessage(`${item} selected for demo.`);
                      setMoreOpen(false);
                    }}
                    style={styles.moreItem}>
                    <Text style={styles.moreText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <Text style={styles.pageTitle}>Issue Details / Assignment</Text>
      <Text style={styles.pageSub}>View and manage issue details, assign to department, and track progress.</Text>

      <View style={styles.layout}>
        <View style={styles.leftCol}>
          <Card style={styles.detailsCard}>
            <View style={styles.issueTop}>
              <Image source={{ uri: issue.photo_url }} style={styles.heroImage} />
              <View style={styles.issueCopy}>
                <View style={styles.idBadge}><Text style={styles.idText}>{issue.id}</Text></View>
                <Text style={styles.issueTitle}>{issue.title}</Text>
                <View style={styles.attrRow}>
                  <Attr label="Category" value={categoryLabels[issue.category]} tone="blue" />
                  <View style={styles.attr}><Text style={styles.attrLabel}>Priority</Text><View style={styles.badgeWrap}><PriorityBadge priority={issue.priority} /></View></View>
                  <View style={styles.attr}><Text style={styles.attrLabel}>Status</Text><View style={styles.badgeWrap}><StatusBadge status={status} /></View></View>
                </View>
                <View style={styles.iconLine}><MaterialCommunityIcons name="map-marker-outline" size={19} color="#34406B" /><Text style={styles.iconText}>{issue.address}{'\n'}Narimanov district, Baku</Text></View>
                <View style={styles.iconLine}><MaterialCommunityIcons name="camera-outline" size={18} color="#34406B" /><Text style={styles.iconText}>Source: Mobile Report{'\n'}Reported on May 28, 2026, 09:15 AM</Text></View>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Assignment & Deadline</Text>
            <View style={styles.assignmentRow}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Assigned Department</Text>
                <Pressable accessibilityLabel="Open department selector" onPress={() => setDepartmentOpen((open) => !open)} style={styles.selectBox}><MaterialCommunityIcons name="account-group-outline" size={18} color="#34406B" /><Text numberOfLines={1} style={styles.selectText}>{department?.name ?? 'Unassigned'}</Text><MaterialCommunityIcons name="chevron-down" size={18} color="#34406B" /></Pressable>
                {departmentOpen ? (
                  <View style={styles.dropdown}>
                    {departments.map((item, index) => (
                      <Pressable
                        key={item.id}
                        onPress={() => {
                          setDepartmentIndex(index);
                          setAssignmentSaved(false);
                          setActionMessage(`${item.name} selected. Save assignment to apply.`);
                          setDepartmentOpen(false);
                        }}
                        style={styles.dropdownItem}>
                        <Text style={styles.dropdownText}>{item.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Deadline</Text>
                <Pressable
                  accessibilityLabel="Open deadline selector"
                  onPress={() => setDeadlineOpen((open) => !open)}
                  style={styles.selectBox}>
                  <MaterialCommunityIcons name="calendar-outline" size={18} color="#34406B" /><Text style={styles.selectText}>{deadline}</Text><MaterialCommunityIcons name="close" size={18} color="#34406B" />
                </Pressable>
                {deadlineOpen ? (
                  <View style={styles.dropdown}>
                    {deadlineOptions.map((item) => (
                      <Pressable
                        key={item}
                        onPress={() => {
                          setDeadline(item);
                          setAssignmentSaved(false);
                          setActionMessage(`${item} selected. Save assignment to apply.`);
                          setDeadlineOpen(false);
                        }}
                        style={styles.dropdownItem}>
                        <Text style={styles.dropdownText}>{item}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
            <View style={styles.notice}><MaterialCommunityIcons name="information-outline" size={18} color={colors.primary} /><Text style={styles.noticeText}>{assignmentSaved ? actionMessage : 'Unsaved changes.'} Assigned to {department?.name ?? 'no department'}. Deadline set to {deadline}.</Text></View>
            <View style={styles.assignmentActions}>
              <Pressable onPress={saveAssignment} style={styles.updateButton}><MaterialCommunityIcons name="content-save-outline" size={18} color={colors.white} /><Text style={styles.updateText}>Update Assignment</Text></Pressable>
              <Pressable
                onPress={() => {
                  setDepartmentIndex(-1);
                  setAssignmentSaved(false);
                  setActionMessage('Assignment cleared. Save to keep the issue unassigned.');
                }}
                style={styles.clearButton}>
                <Text style={styles.clearText}>Delete Assignment</Text>
              </Pressable>
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Update Issue Status</Text>
            <View style={styles.statusActions}>
              <Pressable onPress={() => { setStatus('resolved'); setActionMessage('Issue status changed to resolved.'); }} style={[styles.statusButton, { backgroundColor: colors.success }]}><MaterialCommunityIcons name="check" size={24} color={colors.white} /><Text style={styles.statusButtonText}>Mark as Resolved</Text></Pressable>
              <Pressable onPress={() => { setStatus('in_progress'); setActionMessage('Issue status changed to in progress.'); }} style={[styles.statusButton, { backgroundColor: colors.warning }]}><MaterialCommunityIcons name="progress-clock" size={22} color={colors.white} /><Text style={styles.statusButtonText}>Set as In Progress</Text></Pressable>
              <Pressable onPress={() => { setStatus('rejected'); setActionMessage('Issue rejected and removed from active work.'); }} style={[styles.statusButton, { backgroundColor: colors.danger }]}><MaterialCommunityIcons name="close" size={24} color={colors.white} /><Text style={styles.statusButtonText}>Reject Issue</Text></Pressable>
            </View>
          </Card>

          <Card style={styles.locationCard}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationBody}>
              <Image source={{ uri: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/15/12363/20920' }} style={styles.locationMap} />
              <View style={styles.locationCopy}>
                <Text style={styles.coordinates}>{issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}</Text>
                <Text style={styles.iconText}>{issue.address}{'\n'}Narimanov district, Baku</Text>
              </View>
              <Link href={'/admin/map' as never} asChild>
                <Pressable style={styles.mapButton}><MaterialCommunityIcons name="navigation-variant-outline" size={17} color={colors.primary} /><Text style={styles.mapButtonText}>Open in Map</Text></Pressable>
              </Link>
            </View>
          </Card>
        </View>

        <Card style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Status Timeline / Audit Trail</Text>
          <View style={styles.timeline}>
            {timeline.map((item) => (
              <View key={item.title} style={styles.timelineRow}>
                <View style={[styles.timelineIcon, { backgroundColor: item.color }]}>
                  <MaterialCommunityIcons name={item.icon as never} size={16} color={colors.white} />
                </View>
                <View style={styles.timelineCopy}>
                  <Text style={styles.timelineTitle}>{item.title}</Text>
                  <Text style={styles.timelineSub}>{item.subtitle}</Text>
                  <Text style={styles.timelineDate}>May 28, 2026, 09:25 AM</Text>
                </View>
                <View style={styles.timelineRole}>
                  <Text style={styles.timelineSub}>{item.role}</Text>
                  <Text style={styles.timelineUser}>{item.user}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </View>

      <Modal transparent visible={shareOpen} animationType="fade" onRequestClose={() => setShareOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <Text style={styles.modalTitle}>Share issue</Text>
            <Text style={styles.modalText}>Demo share link ready for {issue.id}. Send this issue summary to the responsible department.</Text>
            <View style={styles.shareLink}><Text style={styles.shareLinkText}>narimanov-ops.local/issues/{issue.id}</Text></View>
            <Pressable onPress={() => setShareOpen(false)} style={styles.modalButton}><Text style={styles.modalButtonText}>Done</Text></Pressable>
          </View>
        </View>
      </Modal>
    </AppLayout>
  );
}

function Attr({ label, tone, value }: { label: string; tone: 'blue'; value: string }) {
  return (
    <View style={styles.attr}>
      <Text style={styles.attrLabel}>{label}</Text>
      <View style={styles.attrPill}><Text style={styles.attrValue}>{value}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between', marginBottom: 22, position: 'relative', zIndex: 100 },
  backLink: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  backText: { color: colors.primary, fontSize: 13, fontWeight: '900' },
  topActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, position: 'relative', zIndex: 110 },
  topButton: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, flexDirection: 'row', gap: 8, height: 44, paddingHorizontal: 16 },
  topButtonActive: { backgroundColor: colors.blueSoft, borderColor: '#B8CCFF' },
  topButtonText: { color: '#06113E', fontWeight: '800' },
  topButtonTextActive: { color: colors.primary },
  moreWrap: { position: 'relative', zIndex: 120 },
  moreMenu: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, elevation: 12, minWidth: 180, padding: 8, position: 'absolute', right: 0, shadowColor: '#102044', shadowOffset: { height: 10, width: 0 }, shadowOpacity: 0.14, shadowRadius: 24, top: 50, zIndex: 999 },
  moreItem: { borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10 },
  moreText: { color: '#06113E', fontWeight: '800' },
  pageTitle: { color: '#06113E', fontSize: 30, fontWeight: '900' },
  pageSub: { color: '#34406B', fontSize: 14, marginBottom: 18, marginTop: 8 },
  layout: { alignItems: 'flex-start', flexDirection: 'row', gap: 20 },
  leftCol: { flex: 1.28, gap: 18, minWidth: 760 },
  detailsCard: { overflow: 'visible', padding: 18, zIndex: 3 },
  issueTop: { alignItems: 'center', flexDirection: 'row', gap: 20 },
  heroImage: { borderRadius: radius.md, height: 214, objectFit: 'cover' as never, width: 292 },
  issueCopy: { flex: 1, gap: 11, minWidth: 0 },
  idBadge: { alignSelf: 'flex-start', backgroundColor: colors.purpleSoft, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8 },
  idText: { color: colors.ai, fontWeight: '900' },
  issueTitle: { color: '#06113E', flexShrink: 1, fontSize: 22, fontWeight: '900', lineHeight: 27 },
  attrRow: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  attr: { flexShrink: 1, gap: 8, maxWidth: 190, minWidth: 110 },
  attrLabel: { color: '#34406B', fontSize: 13 },
  attrPill: { alignSelf: 'flex-start', backgroundColor: colors.blueSoft, borderRadius: radius.sm, maxWidth: '100%', paddingHorizontal: 12, paddingVertical: 8 },
  attrValue: { color: colors.primary, flexShrink: 1, fontWeight: '900' },
  badgeWrap: { alignSelf: 'flex-start', maxWidth: 170 },
  iconLine: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  iconText: { color: '#34406B', flexShrink: 1, fontSize: 14, lineHeight: 21 },
  divider: { backgroundColor: colors.border, height: 1, marginVertical: 14 },
  sectionTitle: { color: '#06113E', fontSize: 17, fontWeight: '900' },
  assignmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginTop: 14 },
  field: { flex: 1, gap: 9, minWidth: 260 },
  fieldLabel: { color: '#34406B', fontSize: 12 },
  selectBox: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, flexDirection: 'row', gap: 10, height: 48, paddingHorizontal: 14 },
  selectText: { color: '#06113E', flex: 1, fontWeight: '800' },
  dropdown: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, marginTop: 4, overflow: 'hidden', shadowColor: '#102044', shadowOffset: { height: 8, width: 0 }, shadowOpacity: 0.12, shadowRadius: 18, zIndex: 30 },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 11 },
  dropdownText: { color: '#06113E', fontWeight: '800' },
  notice: { alignItems: 'center', backgroundColor: colors.blueSoft, borderRadius: radius.sm, flexDirection: 'row', gap: 10, marginTop: 12, padding: 12 },
  noticeText: { color: colors.primary, flex: 1, fontSize: 13, fontWeight: '700' },
  assignmentActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 16 },
  updateButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.sm, flexDirection: 'row', gap: 8, height: 46, paddingHorizontal: 18 },
  updateText: { color: colors.white, fontWeight: '900' },
  clearButton: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, height: 46, justifyContent: 'center', paddingHorizontal: 30 },
  clearText: { color: '#06113E', fontWeight: '800' },
  statusActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14 },
  statusButton: { alignItems: 'center', borderRadius: radius.sm, flex: 1, flexDirection: 'row', gap: 10, height: 50, justifyContent: 'center', minWidth: 190 },
  statusButtonText: { color: colors.white, fontWeight: '900' },
  locationCard: { padding: 18 },
  locationBody: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 14 },
  locationMap: { borderRadius: radius.sm, height: 86, objectFit: 'cover' as never, width: 220 },
  locationCopy: { flex: 1, minWidth: 240 },
  coordinates: { color: '#06113E', fontSize: 16, fontWeight: '900', marginBottom: 8 },
  mapButton: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, flexDirection: 'row', gap: 8, height: 42, paddingHorizontal: 16 },
  mapButtonText: { color: colors.primary, fontWeight: '900' },
  timelineCard: { flex: 0.72, minWidth: 420, padding: 22 },
  timeline: { gap: 18, marginTop: 20 },
  timelineRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 14 },
  timelineIcon: { alignItems: 'center', borderRadius: 999, height: 32, justifyContent: 'center', width: 32 },
  timelineCopy: { flex: 1, gap: 7 },
  timelineTitle: { color: '#06113E', fontSize: 15, fontWeight: '900' },
  timelineSub: { color: '#34406B', fontSize: 12, lineHeight: 18 },
  timelineDate: { color: '#34406B', fontSize: 12, marginTop: 3 },
  timelineRole: { alignItems: 'flex-end', width: 92 },
  timelineUser: { color: '#34406B', fontSize: 12, fontWeight: '800', marginTop: 8, textAlign: 'right' },
  modalBackdrop: { alignItems: 'center', backgroundColor: '#06113E66', flex: 1, justifyContent: 'center', padding: 20 },
  modalPanel: { backgroundColor: colors.white, borderRadius: radius.lg, maxWidth: 430, padding: 22, width: '100%' },
  modalTitle: { color: '#06113E', fontSize: 20, fontWeight: '900' },
  modalText: { color: '#34406B', fontSize: 14, lineHeight: 21, marginTop: 10 },
  shareLink: { backgroundColor: colors.blueSoft, borderRadius: radius.md, marginTop: 16, padding: 14 },
  shareLinkText: { color: colors.primary, fontWeight: '900' },
  modalButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.sm, height: 46, justifyContent: 'center', marginTop: 18 },
  modalButtonText: { color: colors.white, fontWeight: '900' },
});
