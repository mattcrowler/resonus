/**
 * Soft warm ambient gradient glow at the top of screens, inspired by the
 * reference player aesthetic (warm amber/peach fading through rose into the
 * deep midnight background).
 */
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { colors, transparentOf, useTheme } from '@/theme';

interface Props {
  /** Optional custom primary tint color (e.g. cover-derived tint). */
  topColor?: string;
  /** Height of the glow wash in dp (default 300). */
  height?: number;
}

export function AmbientGlow({ topColor, height = 300 }: Props) {
  useTheme();
  const clear = transparentOf(colors.background);
  const start = topColor ?? colors.ambientGlowTop;
  const mid = topColor ? `${topColor}44` : colors.ambientGlowMid;

  return (
    <View pointerEvents="none" style={[styles.wrap, { height }]}>
      <LinearGradient
        colors={[start, mid, clear]}
        locations={[0, 0.52, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.75, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
