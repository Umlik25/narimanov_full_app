import type { AiDetection, Issue } from '@/types/domain';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

export type MapRegion = Region;

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
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region) => mapRef.current?.animateToRegion(region, 280),
  }));

  return (
    <MapView
      ref={mapRef}
      initialRegion={initialRegion}
      onRegionChangeComplete={onRegionChangeComplete}
      showsCompass={false}
      showsMyLocationButton={false}
      showsUserLocation
      style={StyleSheet.absoluteFill}
      zoomEnabled
      scrollEnabled>
      {issues.map((issue) => (
        <Marker
          key={issue.id}
          coordinate={{ latitude: issue.latitude, longitude: issue.longitude }}
          onPress={() => onIssuePress(issue)}
          pinColor={statusColors[issue.status]}
          title={issue.title}
        />
      ))}
      {isAdmin ? aiDetections.map((detection) => (
        <Marker
          key={detection.id}
          coordinate={{ latitude: detection.latitude, longitude: detection.longitude }}
          onPress={() => onDetectionPress(detection)}
          pinColor="#7C3AED"
          title={`AI: ${detection.detectedCategory}`}
        />
      )) : null}
    </MapView>
  );
});
