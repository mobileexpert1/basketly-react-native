import { Pressable, ScrollView, Text, View } from 'react-native';

const layoutAnimation: object = new Proxy(
  {},
  { get: (_target, key) => (key === 'then' ? undefined : () => layoutAnimation) },
);

export default {
  View,
  Text,
  ScrollView,
  createAnimatedComponent: <T>(component: T) => component,
};

export const useSharedValue = <T>(initial: T) => {
  let value = initial;
  return { value, get: () => value, set: (next: T) => (value = next) };
};
export const useAnimatedStyle = (factory: () => object) => factory();
export const useAnimatedRef = () => ({ current: null });
export const useScrollOffset = () => ({ value: 0 });
export const withSpring = <T>(value: T) => value;
export const withTiming = <T>(value: T) => value;
export const interpolate = () => 0;
export const FadeIn = layoutAnimation;
export const FadeOut = layoutAnimation;
export const FadeInUp = layoutAnimation;
export const FadeOutUp = layoutAnimation;
export const LinearTransition = layoutAnimation;
export { Pressable };
