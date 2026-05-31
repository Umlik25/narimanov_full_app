import { colors, radius } from '@/constants/theme';
import { Image, StyleSheet, View } from 'react-native';

const cityGrindLogo = require('../../assets/images/city-grind-logo.png');

export function CityGrindLogo({ size = 62 }: { size?: number }) {
  return (
    <View
      style={[styles.logo, { width: size, height: size, borderRadius: Math.max(radius.md, size * 0.32) }]}
    >
      <Image source={cityGrindLogo} resizeMode="cover" style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    height: '100%',
    width: '100%',
  },
  logo: {
    backgroundColor: colors.primary,
    borderColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
  },
});
