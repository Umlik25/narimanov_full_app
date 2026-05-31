import { colors, radius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type MetricCardProps = {
  color?: string;
  icon: IconName;
  label: string;
  style?: ViewStyle;
  value: number | string;
};

export function MetricCard({ color = colors.blue, icon, label, style, value }: MetricCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: 150,
    flexGrow: 1,
    minHeight: 118,
    padding: 12,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  value: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '900',
    marginTop: 8,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
});
