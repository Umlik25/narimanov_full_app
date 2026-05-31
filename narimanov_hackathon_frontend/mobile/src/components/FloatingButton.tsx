import { colors, radius, shadow } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export function FloatingButton({
  icon,
  label,
  onPress,
  style,
  tone = 'primary',
}: {
  icon: IconName;
  label?: string;
  onPress?: () => void;
  style?: ViewStyle;
  tone?: 'primary' | 'ai' | 'white';
}) {
  const bg = tone === 'ai' ? colors.ai : tone === 'white' ? colors.white : colors.primary;
  const fg = tone === 'white' ? colors.navy : colors.white;
  return (
    <Pressable onPress={onPress} style={[styles.button, { backgroundColor: bg }, style]}>
      <MaterialCommunityIcons name={icon} size={22} color={fg} />
      {label ? <Text style={[styles.label, { color: fg }]}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 8,
    minHeight: 52,
    paddingHorizontal: 16,
    ...shadow,
  },
  label: {
    fontSize: 14,
    fontWeight: '900',
  },
});
