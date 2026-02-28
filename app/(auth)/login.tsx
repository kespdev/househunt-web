import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, LogIn } from 'lucide-react-native';
import colors from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Sign in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, isWide && styles.contentWide]}>
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Home size={48} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>HouseHunt</Text>
          <Text style={styles.subtitle}>
            Find your perfect place together.{'\n'}Rate, compare, and decide as a group.
          </Text>
        </View>

        <View style={styles.authSection}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={isSigningIn}
            activeOpacity={0.8}
          >
            {isSigningIn ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <>
                <LogIn size={20} color={colors.textInverse} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  contentWide: {
    maxWidth: 440,
    alignSelf: 'center',
    width: '100%',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    fontFamily: fonts.dmSansBold,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  authSection: {
    gap: 16,
  },
  errorContainer: {
    backgroundColor: '#FCEAEE',
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  googleButtonText: {
    color: colors.textInverse,
    fontSize: 17,
    fontWeight: '600',
    fontFamily: fonts.dmSansSemiBold,
  },
  terms: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
});
