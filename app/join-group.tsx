import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { X, UserPlus } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import colors from '@/constants/colors';
import { fonts } from '@/constants/fonts';

export default function JoinHuntScreen() {
  const router = useRouter();
  const { joinGroup } = useApp();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    setIsSubmitting(true);
    try {
      const hunt = await joinGroup(code);
      Alert.alert('Success!', `You've joined "${hunt.name}"`, [
        {
          text: 'Done',
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join hunt';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'Join Hunt',
          presentation: 'modal',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={[styles.content, isWide && { maxWidth: 500, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.iconContainer}>
          <UserPlus size={48} color={colors.primary} />
        </View>

        <Text style={styles.title}>Join a Hunt</Text>
        <Text style={styles.description}>
          Enter the invite code shared by someone to join their apartment search.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Invite Code</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., DT2024X"
            placeholderTextColor={colors.textTertiary}
            value={inviteCode}
            onChangeText={setInviteCode}
            autoFocus
            autoCapitalize="characters"
            maxLength={10}
          />
          <Text style={styles.hint}>
            Ask for the 6-character invite code from the hunt creator.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Joining...' : 'Join Hunt'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center' as const,
    marginBottom: 8,
    fontFamily: fonts.dmSansBold,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
    fontFamily: fonts.dmSansSemiBold,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center' as const,
    letterSpacing: 4,
  },
  hint: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 8,
    textAlign: 'center' as const,
  },
  footer: {
    padding: 20,
    paddingBottom: 34,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.textInverse,
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
