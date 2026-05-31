import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { CityGrindLogo } from '@/components/CityGrindLogo';
import { colors, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { issuePhotos } from '@/mock/data';
import type { Role } from '@/types/domain';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useApp();
  const [role, setRole] = useState<Role>('user');

  const enter = (nextRole = role) => {
    login(nextRole);
    router.replace('/map');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={issuePhotos.hero} style={styles.hero} imageStyle={styles.heroImage}>
        <LinearGradient colors={['#08122DB3', '#0B5CFF99']} style={styles.heroOverlay}>
          <CityGrindLogo />
          <Text style={styles.brand}>City Grind</Text>
          <Text style={styles.tagline}>Map-first district operations for faster city fixes.</Text>
        </LinearGradient>
      </ImageBackground>

      <Card style={styles.form}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in as a user or district admin.</Text>
        <View style={styles.roleRow}>
          {(['user', 'admin'] as Role[]).map((item) => {
            const active = role === item;
            return (
              <Pressable key={item} onPress={() => setRole(item)} style={[styles.roleButton, active && styles.roleActive]}>
                <MaterialCommunityIcons name={item === 'admin' ? 'shield-account-outline' : 'account-outline'} size={20} color={active ? colors.primary : colors.muted} />
                <Text style={[styles.roleText, active && styles.roleTextActive]}>{item === 'admin' ? 'Admin' : 'User'}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email or phone" placeholderTextColor={colors.subtle} style={styles.input} />
        <TextInput placeholder="Password" placeholderTextColor={colors.subtle} secureTextEntry style={styles.input} />
        <AppButton icon="login" onPress={() => enter()}>Login</AppButton>
        <Pressable style={styles.mygovButton}>
          <MaterialCommunityIcons name="shield-check-outline" size={20} color={colors.primary} />
          <Text style={styles.mygovText}>Continue with mygov ID</Text>
        </Pressable>
        <View style={styles.quickRow}>
          <AppButton onPress={() => enter('user')} style={styles.quickButton} tone="secondary">Continue as User</AppButton>
          <AppButton onPress={() => enter('admin')} style={styles.quickButton} tone="ai">Admin Demo</AppButton>
        </View>
        <Pressable onPress={() => router.push('/signup')} style={styles.signup}>
          <Text style={styles.signupText}>Create user account</Text>
        </Pressable>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brand: {
    color: colors.white,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 18,
  },
  form: {
    marginHorizontal: 18,
    marginTop: -44,
    padding: 20,
  },
  hero: {
    height: 292,
  },
  heroImage: {
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: 76,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.navy,
    fontSize: 15,
    marginBottom: 12,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  mygovButton: {
    alignItems: 'center',
    backgroundColor: '#F5F8FF',
    borderColor: '#D7E3FF',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 48,
  },
  mygovText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  quickButton: {
    flex: 1,
    paddingHorizontal: 8,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  roleActive: {
    backgroundColor: colors.blueSoft,
    borderColor: colors.primary,
  },
  roleButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  roleText: {
    color: colors.muted,
    fontWeight: '800',
  },
  roleTextActive: {
    color: colors.primary,
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  signup: {
    alignItems: 'center',
    paddingTop: 16,
  },
  signupText: {
    color: colors.primary,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 18,
    marginTop: 6,
  },
  tagline: {
    color: '#EAF1FF',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 280,
  },
  title: {
    color: colors.navy,
    fontSize: 24,
    fontWeight: '900',
  },
});
