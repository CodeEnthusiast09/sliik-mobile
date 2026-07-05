import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useSignupFlowStore } from '@/store/signup-flow';

export type AuthTabsProps = {
  active: 'signin' | 'signup';
};

const TAB_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

export function AuthTabs({ active }: AuthTabsProps) {
  const router = useRouter();
  const rememberedRole = useSignupFlowStore((state) => state.role);

  return (
    <View className="flex-row rounded-full bg-[#EFEAE1] p-1">
      <Pressable
        onPress={() => {
          if (active === 'signup') return;
          if (rememberedRole) {
            router.replace({
              pathname: '/register',
              params: { role: rememberedRole },
            });
          } else {
            router.replace('/role-select');
          }
        }}
        style={active === 'signup' ? TAB_SHADOW : undefined}
        className={`flex-1 items-center rounded-full py-2.5 ${active === 'signup' ? 'bg-white' : ''}`}
      >
        <Text
          className={`text-[14px] font-bold ${active === 'signup' ? 'text-[#26242A]' : 'text-[#948F86]'}`}
        >
          Sign up
        </Text>
      </Pressable>

      <Pressable
        onPress={() => {
          if (active !== 'signin') router.replace('/login');
        }}
        style={active === 'signin' ? TAB_SHADOW : undefined}
        className={`flex-1 items-center rounded-full py-2.5 ${active === 'signin' ? 'bg-white' : ''}`}
      >
        <Text
          className={`text-[14px] font-bold ${active === 'signin' ? 'text-[#26242A]' : 'text-[#948F86]'}`}
        >
          Sign in
        </Text>
      </Pressable>
    </View>
  );
}
