import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { colors, NARIMANOV_REGION, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { categoryIcons, categoryLabels, departments, priorityLabels } from '@/mock/data';
import type { IssueCategory, IssuePriority } from '@/types/domain';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const categories: IssueCategory[] = ['road', 'trash', 'flooding', 'lighting', 'greenery', 'infrastructure'];

function inferPriority(category: IssueCategory, description: string): IssuePriority {
  const lower = description.toLowerCase();
  if (category === 'flooding' || lower.includes('danger') || lower.includes('blocked')) return 'critical';
  if (category === 'road' || category === 'trash') return 'high';
  return 'medium';
}

export default function ReportIssueScreen() {
  const router = useRouter();
  const { submitIssue } = useApp();
  const [category, setCategory] = useState<IssueCategory>('road');
  const [description, setDescription] = useState('Large pothole on the road causing difficulty for vehicles.');
  const [location, setLocation] = useState('Narimanov district, Baku');
  const [coords, setCoords] = useState({ latitude: NARIMANOV_REGION.latitude, longitude: NARIMANOV_REGION.longitude });
  const [photo, setPhoto] = useState<string | null>(null);
  const priority = useMemo(() => inferPriority(category, description), [category, description]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.82 });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const useCurrentLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') return;
    const current = await Location.getCurrentPositionAsync({});
    setCoords({ latitude: current.coords.latitude, longitude: current.coords.longitude });
    setLocation('Current location, Narimanov district');
  };

  const submit = () => {
    const issue = submitIssue({ category, description, latitude: coords.latitude, location, longitude: coords.longitude, photo: photo ?? undefined, priority });
    router.replace(`/user-report/${issue.id}` as never);
  };

  return (
    <>
      <Header onBack={() => router.back()} title="Report Issue" subtitle="Photo, category, location" />
      <Screen>
        <Card style={styles.card}>
          <Pressable onPress={pickImage} style={styles.photoBox}>
            {photo ? <Image source={{ uri: photo }} style={styles.photo} /> : (
              <View style={styles.photoEmpty}>
                <MaterialCommunityIcons name="camera-plus-outline" size={34} color={colors.primary} />
                <Text style={styles.photoText}>Add or take photo</Text>
              </View>
            )}
          </Pressable>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((item) => {
              const active = category === item;
              return (
                <Pressable key={item} onPress={() => setCategory(item)} style={[styles.category, active && styles.categoryActive]}>
                  <MaterialCommunityIcons name={categoryIcons[item] as never} size={22} color={active ? colors.primary : colors.muted} />
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{categoryLabels[item]}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput multiline value={description} onChangeText={setDescription} style={styles.description} textAlignVertical="top" />
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={22} color={colors.primary} />
            <View style={styles.locationCopy}>
              <Text style={styles.locationTitle}>{coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}</Text>
              <Text style={styles.locationText}>{location}</Text>
            </View>
            <Pressable onPress={useCurrentLocation} style={styles.gpsButton}>
              <MaterialCommunityIcons name="crosshairs-gps" size={19} color={colors.primary} />
            </Pressable>
          </View>
        </Card>

        <Card style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <MaterialCommunityIcons name="robot-outline" size={24} color={colors.ai} />
            <Text style={styles.aiTitle}>AI suggestion preview</Text>
          </View>
          <Suggestion label="Suggested category" value={categoryLabels[category]} />
          <Suggestion label="Suggested priority" value={priorityLabels[priority]} />
          <Suggestion label="Suggested department" value={category === 'lighting' ? departments[1] : category === 'trash' ? departments[2] : departments[0]} />
          <Suggestion label="Confidence" value={description.length > 20 ? '92%' : '74%'} />
        </Card>

        <AppButton icon="send-outline" onPress={submit}>Submit Report</AppButton>
      </Screen>
    </>
  );
}

function Suggestion({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.suggestion}>
      <Text style={styles.suggestionLabel}>{label}</Text>
      <Text style={styles.suggestionValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  aiCard: {
    marginBottom: 16,
    padding: 18,
  },
  aiHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  aiTitle: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: '900',
  },
  card: {
    marginBottom: 16,
    padding: 18,
  },
  category: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    minHeight: 82,
    minWidth: '30%',
    padding: 10,
  },
  categoryActive: {
    backgroundColor: colors.blueSoft,
    borderColor: colors.primary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: colors.primary,
  },
  description: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.navy,
    fontSize: 15,
    minHeight: 108,
    padding: 14,
  },
  gpsButton: {
    alignItems: 'center',
    backgroundColor: colors.blueSoft,
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  locationCopy: {
    flex: 1,
  },
  locationRow: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  locationText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  locationTitle: {
    color: colors.navy,
    fontWeight: '900',
  },
  photo: {
    borderRadius: radius.lg,
    height: 180,
    width: '100%',
  },
  photoBox: {
    marginBottom: 18,
  },
  photoEmpty: {
    alignItems: 'center',
    backgroundColor: colors.blueSoft,
    borderColor: '#B8CCFF',
    borderRadius: radius.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 180,
    justifyContent: 'center',
  },
  photoText: {
    color: colors.primary,
    fontWeight: '900',
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
    marginTop: 14,
  },
  suggestion: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  suggestionLabel: {
    color: colors.muted,
  },
  suggestionValue: {
    color: colors.navy,
    fontWeight: '900',
  },
});
