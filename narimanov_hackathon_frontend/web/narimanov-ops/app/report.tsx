import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui';
import { colors, radius } from '@/constants/theme';
import { useDemo } from '@/store/DemoContext';
import type { Issue } from '@/types/domain';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

const demoPhotos = [
  'https://images.unsplash.com/photo-1501691223387-dd0500403074?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=500&q=80',
];

const categories = [
  ['road_damage', 'Road Damage', 'road-variant'],
  ['trash_overflow', 'Trash Overflow', 'trash-can-outline'],
  ['flooding', 'Flooding', 'water-alert-outline'],
  ['lighting_problem', 'Lighting Problem', 'lightbulb-outline'],
] as const;

export default function ReportScreen() {
  const router = useRouter();
  const { issues, role, submitIssue } = useDemo();
  const { width } = useWindowDimensions();
  const isNarrow = width < 1100;
  const [photos, setPhotos] = useState<string[]>(demoPhotos);
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState<(typeof categories)[number]>(categories[0]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [description, setDescription] = useState('Large pothole on the road causing difficulty for vehicles. It fills with water during rain and damages cars.');
  const [locationUsed, setLocationUsed] = useState(false);
  const [mockPhotoOpen, setMockPhotoOpen] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.85 });
    if (result.canceled) {
      setMockPhotoOpen(true);
      return;
    }
    setPhotos((current) => [...current, result.assets[0].uri].slice(0, 5));
  };

  const submitReport = () => {
    const newIssue: Issue = {
      id: `ISS-${1000 + issues.length + 1}`,
      title: category[1] === 'Road Damage' ? 'Citizen reported road damage' : `Citizen reported ${category[1].toLowerCase()}`,
      description,
      category: category[0],
      status: 'new',
      priority: category[0] === 'flooding' ? 'critical' : 'high',
      latitude: locationUsed ? 40.4102 : 40.4093,
      longitude: locationUsed ? 49.8692 : 49.8671,
      address: locationUsed ? 'Current user location, Narimanov district' : 'Narimanov district, Baku',
      photo_url: photos[0] ?? demoPhotos[0],
      source: 'citizen_report',
      confidence: 0.92,
      assigned_to: null,
      department_id: null,
      deadline: null,
      created_by: 'citizen_user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resolved_at: null,
      history: [],
      comments: [],
      attachments: [],
    };
    submitIssue(newIssue);
    setSubmitted(true);
    setTimeout(() => router.push('/admin/map' as never), 650);
  };

  return (
    <AppLayout>
      <PageHeader
        eyebrow="New Report"
        title="Manual Report"
        subtitle="Provide details about the issue you want to report."
        rightSlot={
          <View style={styles.headerActions}>
            <Pressable onPress={() => router.push(role === 'admin' ? '/admin/dashboard' as never : '/my-reports' as never)} style={styles.cancelButton}>
              <MaterialCommunityIcons name="close" size={18} color="#06113E" />
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={submitReport} style={styles.submitButton}>
              <MaterialCommunityIcons name="send-outline" size={18} color={colors.white} />
              <Text style={styles.submitText}>{submitted ? 'Report Staged' : 'Submit Report'}</Text>
            </Pressable>
          </View>
        }
      />

      <View style={[styles.layout, isNarrow && styles.layoutStacked]}>
        <Card style={styles.formCard}>
          <Section number="1" title="Add Photos" subtitle="Upload clear photos of the issue (max 5 photos)" />
          <View style={styles.photosRow}>
            {photos.map((photo) => (
              <View key={photo} style={styles.photoWrap}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <Pressable onPress={() => setPhotos((current) => current.filter((item) => item !== photo))} style={styles.closePhoto}>
                  <MaterialCommunityIcons name="close" size={17} color="#06113E" />
                </Pressable>
              </View>
            ))}
            <Pressable onPress={pickImage} style={styles.addPhoto}>
              <MaterialCommunityIcons name="plus" size={28} color={colors.primary} />
              <Text style={styles.addPhotoText}>Add more</Text>
            </Pressable>
          </View>

          <Divider />
          <Section number="2" title="Category" subtitle="Select the category that best describes the issue" />
          <Pressable onPress={() => setCategoryOpen((open) => !open)} style={styles.selectRow}>
            <MaterialCommunityIcons name={category[2]} size={18} color={colors.primary} />
            <Text style={styles.selectText}>{category[1]}</Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#06113E" />
          </Pressable>
          {categoryOpen ? (
            <View style={styles.categoryMenu}>
              {categories.map((item) => (
                <Pressable
                  key={item[0]}
                  onPress={() => {
                    setCategory(item);
                    setCategoryOpen(false);
                  }}
                  style={styles.categoryOption}>
                  <MaterialCommunityIcons name={item[2]} size={17} color={colors.primary} />
                  <Text style={styles.categoryOptionText}>{item[1]}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Divider />
          <Section number="3" title="Description" subtitle="Describe the problem in detail" />
          <TextInput
            multiline
            value={description}
            onChangeText={setDescription}
            style={styles.descriptionInput}
          />
          <Text style={styles.countText}>{description.length}/500</Text>

          <Divider />
          <Section number="4" title="Location" subtitle="Confirm or adjust the location of the issue" />
          <View style={styles.miniMap}>
            <Image
              source={{ uri: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/15/12363/20920' }}
              style={styles.miniMapImage}
            />
            <View style={styles.mapPin}><MaterialCommunityIcons name="map-marker" size={42} color={colors.primary} /></View>
            <View style={styles.mapControls}>
              <Text style={styles.mapControlText}>+</Text>
              <Text style={styles.mapControlText}>-</Text>
            </View>
          </View>
          <View style={styles.locationFooter}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.primary} />
            <View style={styles.locationCopy}>
              <Text style={styles.locationTitle}>{locationUsed ? '40.4102, 49.8692' : '40.4093, 49.8671'}</Text>
              <Text style={styles.locationText}>{locationUsed ? 'Current location locked for demo' : 'Narimanov district, Baku, Azerbaijan'}</Text>
            </View>
            <Pressable onPress={() => setLocationUsed(true)} style={styles.locationButton}>
              <MaterialCommunityIcons name="crosshairs-gps" size={17} color={colors.primary} />
              <Text style={styles.locationButtonText}>Use Current Location</Text>
            </Pressable>
          </View>
        </Card>

        <Card style={styles.aiCard}>
          <Text style={styles.aiTitle}>AI Suggestion Preview</Text>
          <Text style={styles.aiSub}>Our AI analyzed your photos and suggests the following details.</Text>
          <Suggestion icon={category[2]} label="Suggested Category" value={category[1]} confidence="92%" color={colors.ai} />
          <Suggestion icon="alert-decagram-outline" label="Suggested Priority" value={category[0] === 'flooding' ? 'Critical' : 'High'} confidence="88%" color={colors.warning} note={description ? 'Reason: Description indicates traffic or safety impact' : 'Reason appears after description is added'} />
          <Suggestion icon="account-hard-hat-outline" label="Suggested Department" value="Road Maintenance Dept." confidence="90%" color={colors.success} />
          <View style={styles.aiNote}>
            <Text style={styles.aiNoteText}>You can modify any of these details before submitting the report.</Text>
          </View>
        </Card>
      </View>
      <Modal transparent visible={mockPhotoOpen} animationType="fade" onRequestClose={() => setMockPhotoOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setMockPhotoOpen(false)}>
          <Pressable style={styles.modalPanel}>
            <Text style={styles.modalTitle}>No file selected</Text>
            <Text style={styles.modalText}>Attach a sample issue photo for the demo workflow?</Text>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setMockPhotoOpen(false)} style={styles.modalSecondary}>
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setPhotos((current) => [...current, demoPhotos[current.length % demoPhotos.length]].slice(0, 5));
                  setMockPhotoOpen(false);
                }}
                style={styles.modalPrimary}>
                <Text style={styles.modalPrimaryText}>Attach sample</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </AppLayout>
  );
}

function Section({ number, subtitle, title }: { number: string; subtitle: string; title: string }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.numberCircle}><Text style={styles.numberText}>{number}</Text></View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionSub}>{subtitle}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function Suggestion({ color, confidence, icon, label, note, value }: { color: string; confidence: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; note?: string; value: string }) {
  return (
    <View style={styles.suggestion}>
      <View style={[styles.suggestionIcon, { backgroundColor: `${color}18` }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <View style={styles.suggestionCopy}>
        <Text style={styles.suggestionLabel}>{label}</Text>
        <Text style={styles.suggestionValue}>{value}</Text>
        {note ? <Text style={styles.suggestionNote}>{note}</Text> : null}
      </View>
      <View style={styles.confidenceBadge}><Text style={styles.confidenceText}>Confidence: {confidence}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', gap: 12 },
  cancelButton: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', gap: 8, height: 50, paddingHorizontal: 18 },
  cancelText: { color: '#06113E', fontWeight: '900' },
  submitButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.md, flexDirection: 'row', gap: 8, height: 50, paddingHorizontal: 22 },
  submitText: { color: colors.white, fontWeight: '900' },
  layout: { alignItems: 'flex-start', flexDirection: 'row', gap: 24 },
  layoutStacked: { flexDirection: 'column' },
  formCard: { flex: 1, padding: 20 },
  aiCard: { borderColor: '#D8C7FF', flexShrink: 0, padding: 22, width: 460, maxWidth: '100%' },
  section: { gap: 10 },
  sectionTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  numberCircle: { alignItems: 'center', borderColor: colors.primary, borderRadius: 999, borderWidth: 1, height: 22, justifyContent: 'center', width: 22 },
  numberText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  sectionTitle: { color: '#06113E', fontSize: 16, fontWeight: '900' },
  sectionSub: { color: '#34406B', fontSize: 13 },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 18 },
  photoWrap: { position: 'relative' },
  photo: { borderRadius: radius.md, height: 118, width: 160 },
  closePhoto: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 999, height: 28, justifyContent: 'center', position: 'absolute', right: 8, top: 8, width: 28 },
  addPhoto: { alignItems: 'center', borderColor: '#BBD0FF', borderRadius: radius.md, borderStyle: 'dashed', borderWidth: 1, height: 118, justifyContent: 'center', minWidth: 138, width: 160 },
  addPhotoText: { color: colors.primary, fontSize: 13, marginTop: 10 },
  divider: { backgroundColor: colors.border, height: 1, marginVertical: 18 },
  selectRow: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', gap: 10, height: 50, marginTop: 14, paddingHorizontal: 14 },
  categoryMenu: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, marginTop: 8, overflow: 'hidden' },
  categoryOption: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 10, padding: 12 },
  categoryOptionText: { color: '#06113E', fontWeight: '800' },
  selectText: { color: '#06113E', flex: 1, fontSize: 14, fontWeight: '900' },
  descriptionInput: { borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: '#06113E', fontSize: 14, minHeight: 86, marginTop: 14, outlineStyle: 'none' as never, padding: 14, textAlignVertical: 'top' },
  countText: { alignSelf: 'flex-end', color: colors.muted, fontSize: 12, marginTop: -24, paddingRight: 14 },
  miniMap: { borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md, height: 130, marginTop: 16, overflow: 'hidden', position: 'relative' },
  miniMapImage: { height: '100%', width: '100%' },
  mapPin: { left: '47%', position: 'absolute', top: '32%' },
  mapControls: { backgroundColor: colors.white, borderRadius: radius.sm, position: 'absolute', right: 12, top: 12 },
  mapControlText: { color: '#06113E', fontSize: 22, fontWeight: '800', paddingHorizontal: 12, paddingVertical: 6 },
  locationFooter: { alignItems: 'center', borderColor: colors.border, borderTopWidth: 0, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 14 },
  locationCopy: { flex: 1 },
  locationTitle: { color: '#06113E', fontWeight: '900' },
  locationText: { color: colors.muted, fontSize: 12, marginTop: 4 },
  locationButton: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingVertical: 10 },
  locationButtonText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  aiTitle: { color: '#06113E', fontSize: 18, fontWeight: '900' },
  aiSub: { color: '#34406B', fontSize: 13, lineHeight: 20, marginBottom: 20, marginTop: 12 },
  suggestion: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 18, padding: 18 },
  suggestionIcon: { alignItems: 'center', borderRadius: 999, height: 44, justifyContent: 'center', width: 44 },
  suggestionCopy: { flex: 1 },
  suggestionLabel: { color: '#34406B', fontSize: 13 },
  suggestionValue: { color: '#06113E', fontSize: 15, fontWeight: '900', marginTop: 6 },
  suggestionNote: { color: '#34406B', fontSize: 12, marginTop: 10 },
  confidenceBadge: { backgroundColor: colors.greenSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  confidenceText: { color: colors.success, fontSize: 12, fontWeight: '800' },
  aiNote: { backgroundColor: colors.purpleSoft, borderColor: '#E3D4FF', borderRadius: radius.md, borderWidth: 1, padding: 16 },
  aiNoteText: { color: colors.primaryDark, fontSize: 13 },
  modalBackdrop: { alignItems: 'center', backgroundColor: '#06113E66', flex: 1, justifyContent: 'center', padding: 18 },
  modalPanel: { backgroundColor: colors.white, borderRadius: radius.lg, maxWidth: 420, padding: 22, width: '100%' },
  modalTitle: { color: '#06113E', fontSize: 18, fontWeight: '900' },
  modalText: { color: '#34406B', lineHeight: 21, marginBottom: 18, marginTop: 8 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalPrimary: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.sm, flex: 1, height: 46, justifyContent: 'center' },
  modalPrimaryText: { color: colors.white, fontWeight: '900' },
  modalSecondary: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.sm, borderWidth: 1, flex: 1, height: 46, justifyContent: 'center' },
  modalSecondaryText: { color: '#06113E', fontWeight: '900' },
});
