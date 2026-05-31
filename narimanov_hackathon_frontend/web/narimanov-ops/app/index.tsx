import { colors, radius } from '@/constants/theme';
import { useDemo } from '@/store/DemoContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

type Role = 'admin' | 'user';

const roles: Array<{ icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string; value: Role }> = [
  { icon: 'shield-account-outline', label: 'Admin', value: 'admin' },
  { icon: 'account-outline', label: 'User', value: 'user' },
];

export default function LoginScreen() {
  const router = useRouter();
  const { setRole: setDemoRole } = useDemo();
  const [role, setRole] = useState<Role>('admin');

  const signIn = () => {
    setDemoRole(role);
    if (role === 'user') {
      router.replace('/report' as never);
      return;
    }

    router.replace('/admin/dashboard' as never);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.shell}>
        <View style={styles.hero}>
          <Image source={require('../assets/images/heydar-aliyev-center.webp')} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <MaterialCommunityIcons name="city-variant-outline" size={34} color={colors.primaryDark} />
            </View>
            <View>
              <Text style={styles.heroBrand}>NARIMANOV OPS</Text>
              <Text style={styles.heroSub}>District Operations System</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Better Operations.{'\n'}Stronger District.</Text>
        </View>

        <View style={styles.formPanel}>
          <View style={styles.languagePill}>
            <MaterialCommunityIcons name="web" size={21} color="#34406B" />
            <Text style={styles.languageText}>English</Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color="#34406B" />
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to continue to your account</Text>

            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="email-outline" size={22} color="#5B668F" />
              <TextInput
                autoCapitalize="none"
                placeholder="Enter your email address"
                placeholderTextColor="#8A94B8"
                style={styles.input}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="lock-outline" size={22} color="#5B668F" />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#8A94B8"
                secureTextEntry
                style={styles.input}
              />
              <MaterialCommunityIcons name="eye-outline" size={22} color="#5B668F" />
            </View>

            <Text style={styles.label}>Select Your Role</Text>
            <View style={styles.roleRow}>
              {roles.map((item) => {
                const active = role === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setRole(item.value)}
                    style={[styles.roleButton, active && styles.roleButtonActive]}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={23}
                      color={active ? colors.primary : '#34406B'}
                    />
                    <Text style={[styles.roleText, active && styles.roleTextActive]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable onPress={signIn} style={styles.signInButton}>
              <Text style={styles.signInText}>Sign In</Text>
              <MaterialCommunityIcons name="arrow-right" size={24} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#EEF5FF',
    flex: 1,
  },
  shell: {
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    flexDirection: 'row',
    height: '86%',
    marginTop: 38,
    maxWidth: 1480,
    overflow: 'hidden',
    shadowColor: '#102044',
    shadowOffset: { height: 24, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 44,
    width: '92%',
  },
  hero: {
    flex: 1,
    justifyContent: 'space-between',
    minWidth: 500,
    overflow: 'hidden',
    padding: 56,
  },
  heroImage: {
    bottom: 0,
    height: '100%',
    left: 0,
    objectFit: 'cover',
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
  heroOverlay: {
    backgroundColor: '#00398699',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 22,
    zIndex: 2,
  },
  brandIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    height: 74,
    justifyContent: 'center',
    width: 74,
  },
  heroBrand: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
  },
  heroSub: {
    color: '#DCE8FF',
    fontSize: 17,
    marginTop: 8,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 39,
    fontWeight: '900',
    lineHeight: 51,
    maxWidth: 560,
    zIndex: 2,
  },
  formPanel: {
    backgroundColor: colors.white,
    flex: 1.25,
    justifyContent: 'center',
    minWidth: 560,
    paddingHorizontal: 88,
    paddingVertical: 44,
    position: 'relative',
  },
  languagePill: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    position: 'absolute',
    right: 78,
    top: 72,
  },
  languageText: {
    color: '#34406B',
    fontSize: 16,
  },
  form: {
    alignSelf: 'center',
    maxWidth: 560,
    width: '100%',
  },
  title: {
    color: '#06113E',
    fontSize: 38,
    fontWeight: '900',
  },
  subtitle: {
    color: '#34406B',
    fontSize: 17,
    marginBottom: 30,
    marginTop: 12,
  },
  label: {
    color: '#06113E',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 18,
  },
  inputWrap: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    height: 62,
    paddingHorizontal: 18,
  },
  input: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    outlineStyle: 'none' as never,
  },
  roleRow: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  roleButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 62,
  },
  roleButtonActive: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  roleText: {
    color: '#34406B',
    fontSize: 16,
    fontWeight: '700',
  },
  roleTextActive: {
    color: colors.primary,
  },
  signInButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 16,
    height: 62,
    justifyContent: 'center',
    marginTop: 36,
  },
  signInText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
});
