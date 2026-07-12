import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { Easing, LinearTransition, withTiming } from 'react-native-reanimated';

import { AuthTabs } from '@/components/auth-tabs';
import { SliikWordmark } from '@/components/sliik-wordmark';
import type { AuthMode, UserRole } from '@/interfaces/auth';
import { useSignupFlowStore } from '@/store/signup-flow';

import { SignInForm } from './components/sign-in-form';
import { SignUpForm } from './components/sign-up-form';

// Small nudge, not a carousel swipe - large enough to read as directional
// motion, small enough that forms of very different heights (2 fields vs 5)
// don't look like they're flying across the screen.
const SLIDE_OFFSET = 20;
const ANIM_MS = 220;

const CHROME_TRANSITION = LinearTransition.duration(320).easing(
  Easing.bezier(0.2, 0, 0, 1),
);

// FadeIn/FadeOut's own withInitialValues/withTargetValues are typed to
// opacity only, so a combined fade+slide needs the lower-level custom
// entering/exiting function form instead of the builder classes.
function slideInFrom(offsetX: number) {
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ translateX: offsetX }] },
      animations: {
        opacity: withTiming(1, { duration: ANIM_MS }),
        transform: [{ translateX: withTiming(0, { duration: ANIM_MS }) }],
      },
    };
  };
}

function slideOutTo(offsetX: number) {
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 1, transform: [{ translateX: 0 }] },
      animations: {
        opacity: withTiming(0, { duration: ANIM_MS }),
        transform: [{ translateX: withTiming(offsetX, { duration: ANIM_MS }) }],
      },
    };
  };
}

export function AuthScreen() {
  const router = useRouter();
  const { mode: modeParam, role: roleParam } = useLocalSearchParams<{
    mode?: string;
    role?: string;
  }>();
  const mode: AuthMode = modeParam === 'signup' ? 'signup' : 'signin';
  const role: UserRole = roleParam === 'provider' ? 'provider' : 'customer';

  const rememberedRole = useSignupFlowStore((state) => state.role);
  const rememberRole = useSignupFlowStore((state) => state.setRole);

  // Email is the one field worth carrying across an accidental signup <->
  // signin toggle (it's the most commonly re-typed field); password isn't
  // shared since re-using a signup password on the signin form (or vice
  // versa) doesn't make sense.
  const [email, setEmail] = useState('');

  // The swap's entering animation would otherwise also play on first mount
  // (e.g. a deep link straight to /auth?mode=signin) - only animate once the
  // user has actually triggered a real toggle. Set from the event handler
  // itself (not a mount effect/ref-read-in-render) since both of those trip
  // this project's React Compiler lint rules.
  const [hasToggledOnce, setHasToggledOnce] = useState(false);

  // Mirrors the old register screen's behavior: remember whichever role the
  // signup form was last shown with, so bouncing signup -> signin -> signup
  // via the tabs doesn't force role-select again.
  useEffect(() => {
    if (roleParam) rememberRole(role);
  }, [roleParam, role, rememberRole]);

  function handleModeChange(target: AuthMode) {
    if (target === 'signup' && !rememberedRole && !roleParam) {
      // We don't know provider vs customer yet and won't guess - this is a
      // real navigation away from the toggle, not an in-place param change.
      router.push('/role-select');
      return;
    }

    setHasToggledOnce(true);
    router.setParams({
      mode: target,
      role: target === 'signup' ? (roleParam ?? rememberedRole ?? undefined) : undefined,
    });
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="absolute left-4 top-2 z-10 h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={26} color="#4B2E46" />
        </Pressable>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerClassName="grow justify-center px-6 py-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View layout={CHROME_TRANSITION}>
              <SliikWordmark height={38} />
            </Animated.View>

            <Animated.View style={{ marginTop: 48 }} layout={CHROME_TRANSITION}>
              <AuthTabs active={mode} onChange={handleModeChange} />
            </Animated.View>

            <Animated.View
              style={{ marginTop: 24 }}
              layout={CHROME_TRANSITION}
            >
              {mode === 'signin' ? (
                <Animated.View
                  key="signin"
                  entering={hasToggledOnce ? slideInFrom(SLIDE_OFFSET) : undefined}
                  exiting={slideOutTo(SLIDE_OFFSET)}
                >
                  <SignInForm email={email} onChangeEmail={setEmail} />
                </Animated.View>
              ) : (
                <Animated.View
                  key="signup"
                  entering={hasToggledOnce ? slideInFrom(-SLIDE_OFFSET) : undefined}
                  exiting={slideOutTo(-SLIDE_OFFSET)}
                >
                  <SignUpForm role={role} email={email} onChangeEmail={setEmail} />
                </Animated.View>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
