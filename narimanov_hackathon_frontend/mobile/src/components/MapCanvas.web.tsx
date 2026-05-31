import { colors, NARIMANOV_REGION } from '@/constants/theme';
import type { AiDetection, Issue } from '@/types/domain';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type DimensionValue } from 'react-native';

export type MapRegion = typeof NARIMANOV_REGION;

export type MapCanvasHandle = {
  animateToRegion: (region: MapRegion) => void;
};

type MapCanvasProps = {
  aiDetections: AiDetection[];
  issues: Issue[];
  isAdmin: boolean;
  onDetectionPress: (detection: AiDetection) => void;
  onIssuePress: (issue: Issue) => void;
  onRegionChangeComplete: (region: MapRegion) => void;
  initialRegion: MapRegion;
  statusColors: Record<Issue['status'], string>;
};

function markerPosition(latitude: number, longitude: number, region: MapRegion) {
  const x = ((longitude - (region.longitude - region.longitudeDelta / 2)) / region.longitudeDelta) * 100;
  const y = ((region.latitude + region.latitudeDelta / 2 - latitude) / region.latitudeDelta) * 100;
  return {
    left: `${Math.max(7, Math.min(93, x))}%` as DimensionValue,
    top: `${Math.max(9, Math.min(91, y))}%` as DimensionValue,
  };
}

export const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(function MapCanvas({
  aiDetections,
  initialRegion,
  isAdmin,
  issues,
  onDetectionPress,
  onIssuePress,
  onRegionChangeComplete,
  statusColors,
}, ref) {
  const [region, setRegion] = useState(initialRegion);

  useImperativeHandle(ref, () => ({
    animateToRegion: (nextRegion) => {
      setRegion(nextRegion);
      onRegionChangeComplete(nextRegion);
    },
  }));

  return (
    <View style={styles.map}>
      <View style={styles.grid} />
      <View style={[styles.road, styles.roadOne]} />
      <View style={[styles.road, styles.roadTwo]} />
      <View style={[styles.road, styles.roadThree]} />
      <View style={styles.district}>
        <Text style={styles.districtText}>Narimanov</Text>
      </View>
      {issues.map((issue) => (
        <Pressable
          key={issue.id}
          onPress={() => onIssuePress(issue)}
          style={[styles.marker, markerPosition(issue.latitude, issue.longitude, region), { backgroundColor: statusColors[issue.status] }]}>
          <View style={styles.markerCore} />
        </Pressable>
      ))}
      {isAdmin ? aiDetections.map((detection) => (
        <Pressable
          key={detection.id}
          onPress={() => onDetectionPress(detection)}
          style={[styles.marker, styles.aiMarker, markerPosition(detection.latitude, detection.longitude, region)]}>
          <Text style={styles.aiText}>AI</Text>
        </Pressable>
      )) : null}
      <View style={styles.webNote}>
        <Text style={styles.webNoteText}>Demo map preview. Markers are tappable.</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  aiMarker: {
    alignItems: 'center',
    backgroundColor: colors.ai,
    justifyContent: 'center',
  },
  aiText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '900',
    transform: [{ rotate: '45deg' }],
  },
  district: {
    backgroundColor: '#FFFFFFD9',
    borderRadius: 999,
    left: '37%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'absolute',
    top: '45%',
  },
  districtText: {
    color: colors.navy,
    fontWeight: '900',
  },
  grid: {
    backgroundColor: '#DCE7F7',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  map: {
    backgroundColor: '#DCE7F7',
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  marker: {
    borderColor: colors.white,
    borderRadius: 50,
    borderBottomLeftRadius: 2,
    borderWidth: 3,
    height: 30,
    marginLeft: -15,
    marginTop: -30,
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
    width: 30,
  },
  markerCore: {
    backgroundColor: '#FFFFFF99',
    borderRadius: 999,
    height: 8,
    left: 8,
    position: 'absolute',
    top: 8,
    width: 8,
  },
  road: {
    backgroundColor: '#FFFFFF99',
    borderRadius: 999,
    height: 20,
    position: 'absolute',
    width: '140%',
  },
  roadOne: {
    left: '-18%',
    top: '34%',
    transform: [{ rotate: '13deg' }],
  },
  roadThree: {
    left: '-22%',
    top: '68%',
    transform: [{ rotate: '-8deg' }],
  },
  roadTwo: {
    left: '-30%',
    top: '51%',
    transform: [{ rotate: '-28deg' }],
  },
  webNote: {
    backgroundColor: '#08122DCC',
    borderRadius: 14,
    bottom: 92,
    left: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
    position: 'absolute',
    right: 18,
  },
  webNoteText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});
