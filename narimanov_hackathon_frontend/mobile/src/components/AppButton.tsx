import { colors, radius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps, PropsWithChildren } from 'react';
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type AppButtonProps = PropsWithChildren<{
  icon?: IconName;
  onPress?: () => void;
  style?: ViewStyle;
  tone?: 'primary' | 'secondary' | 'danger' | 'ai' | 'success';
}>;

const tones = {
  ai: colors.ai,
  danger: colors.danger,
  primary: colors.primary,
  secondary: colors.card,
  success: colors.success,
};

export function AppButton({ children, icon, onPress, style, tone = 'primary' }: AppButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const secondary = tone === 'secondary';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { speed: 30, toValue: 0.97, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { speed: 30, toValue: 1, useNativeDriver: true }).start()}>
      <Animated.View style={[styles.button, { backgroundColor: tones[tone], transform: [{ scale }] }, secondary && styles.secondary, style]}>
        {icon ? <MaterialCommunityIcons name={icon} size={19} color={secondary ? colors.navy : colors.white} /> : null}
        <Text style={[styles.text, secondary && styles.secondaryText]}>{children}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
  },
  secondary: {
    borderColor: colors.border,
    borderWidth: 1,
  },
  secondaryText: {
    color: colors.navy,
  },
  text: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
