import { colors, radius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, View, type ImageStyle } from 'react-native';

type IssuePhotoProps = {
  uri?: string | null;
  size?: number;
  style?: ImageStyle;
};

export function IssuePhoto({ size = 72, style, uri }: IssuePhotoProps) {
  if (!uri) {
    return (
      <View style={[styles.fallback, { height: size, width: size }, style]}>
        <MaterialCommunityIcons name="image-outline" size={Math.max(20, size * 0.38)} color={colors.muted} />
      </View>
    );
  }

  return <Image source={{ uri }} style={[styles.image, { height: size, width: size }, style]} />;
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
  },
  fallback: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
  },
});
