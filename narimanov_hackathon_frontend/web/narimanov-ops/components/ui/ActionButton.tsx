import { colors, radius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from 'react-native';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
type ActionVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'gold' | 'ghost';

const variants: Record<ActionVariant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.blue, fg: colors.white, border: colors.blue },
  secondary: { bg: colors.blueSoft, fg: colors.blue, border: colors.blueSoft },
  success: { bg: colors.green, fg: colors.white, border: colors.green },
  danger: { bg: colors.red, fg: colors.white, border: colors.red },
  gold: { bg: colors.goldSoft, fg: colors.gold, border: colors.goldSoft },
  ghost: { bg: colors.white, fg: colors.blue, border: colors.line },
};

type ActionButtonProps = PressableProps & {
  compact?: boolean;
  icon?: IconName;
  label?: string;
  style?: ViewStyle;
  variant?: ActionVariant;
};

export function ActionButton({
  compact,
  disabled,
  icon,
  label,
  style,
  variant = 'primary',
  ...props
}: ActionButtonProps) {
  const tone = variants[variant];

  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        { backgroundColor: tone.bg, borderColor: tone.border, opacity: disabled ? 0.55 : pressed ? 0.86 : 1 },
        style,
      ]}>
      {icon ? <MaterialCommunityIcons name={icon} size={compact ? 16 : 19} color={tone.fg} /> : null}
      {label ? (
        <Text style={[styles.label, compact && styles.labelCompact, { color: tone.fg }]}>{label}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  compact: {
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '900',
  },
  labelCompact: {
    fontSize: 12,
  },
});
