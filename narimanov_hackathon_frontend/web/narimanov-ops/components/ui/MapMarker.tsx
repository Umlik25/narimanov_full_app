import { colors } from '@/constants/theme';
import type { IssueStatus } from '@/types/domain';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

export const markerColors: Record<IssueStatus, string> = {
  new: colors.blue,
  needs_review: colors.purple,
  assigned: colors.gold,
  in_progress: colors.orange,
  resolved: colors.green,
  rejected: colors.gray,
  overdue: colors.red,
};

type MapMarkerProps = {
  active?: boolean;
  status: IssueStatus;
};

export function MapMarker({ active, status }: MapMarkerProps) {
  return (
    <View
      style={[
        styles.marker,
        { backgroundColor: markerColors[status], borderColor: active ? colors.gold : colors.white },
        active && styles.active,
      ]}>
      <MaterialCommunityIcons name="exclamation-thick" size={active ? 20 : 17} color={colors.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 3,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  active: {
    borderWidth: 4,
    height: 44,
    width: 44,
  },
});
