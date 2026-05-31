import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { colors, radius } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const { signup } = useApp();
  const [name, setName] = useState('Anar Mammadov');
  const [email, setEmail] = useState('anar@example.com');

  const create = () => {
    signup(name, email);
    router.replace('/map');
  };

  return (
    <>
      <Header onBack={() => router.back()} title="Create Account" subtitle="User accounts only" />
      <Screen>
        <Card style={styles.card}>
          <Text style={styles.note}>Admin accounts are managed by the district authority. New sign ups enter as users.</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={colors.subtle} style={styles.input} />
          <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Phone or email" placeholderTextColor={colors.subtle} style={styles.input} />
          <TextInput placeholder="Password" placeholderTextColor={colors.subtle} secureTextEntry style={styles.input} />
          <TextInput placeholder="Confirm password" placeholderTextColor={colors.subtle} secureTextEntry style={styles.input} />
          <AppButton icon="account-plus-outline" onPress={create}>Create User Account</AppButton>
          <AppButton onPress={() => router.replace('/')} style={styles.backButton} tone="secondary">Back to Login</AppButton>
        </Card>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginTop: 10,
  },
  card: {
    padding: 20,
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
  note: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
});
