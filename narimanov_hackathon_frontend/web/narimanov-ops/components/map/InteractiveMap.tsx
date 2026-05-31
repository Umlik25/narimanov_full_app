import type { Issue, IssueStatus } from '@/types/domain';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

type InteractiveMapProps = {
  issues: Issue[];
  selectedId?: string;
  statusColors: Record<IssueStatus, string>;
  onSelectIssue: (id: string) => void;
};

function hasValidPoint(issue: Issue) {
  return Number.isFinite(Number(issue.latitude)) && Number.isFinite(Number(issue.longitude));
}

export function InteractiveMap({
  issues,
  selectedId,
  statusColors,
  onSelectIssue,
}: InteractiveMapProps) {
  const validIssues = issues.filter(hasValidPoint);

  return (
    <MapView
      initialRegion={{
        latitude: 40.4099,
        latitudeDelta: 0.035,
        longitude: 49.8677,
        longitudeDelta: 0.035,
      }}
      provider={PROVIDER_GOOGLE}
      rotateEnabled
      scrollEnabled
      showsBuildings
      showsCompass
      showsTraffic={false}
      style={{ height: '100%', width: '100%' }}
      zoomEnabled>
      {validIssues.map((issue) => (
        <Marker
          key={issue.id}
          coordinate={{ latitude: Number(issue.latitude), longitude: Number(issue.longitude) }}
          onPress={() => onSelectIssue(issue.id)}
          pinColor={selectedId === issue.id ? '#D6A12E' : statusColors[issue.status]}
          title={issue.title}
        />
      ))}
    </MapView>
  );
}
