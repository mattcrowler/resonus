/**
 * The progress bar and the two times under it, for the player and the lyrics
 * screen.
 *
 * A component of its own, and not markup repeated on both screens, for what it
 * has to hold: while the thumb is being dragged the numbers follow IT and not
 * the song. The left one is where you are about to land, which is the whole
 * point of dragging it, and the song goes on playing underneath — so its
 * position has to stop reaching the slider until the finger lifts, or the thumb
 * is pulled back out from under it twice a second.
 *
 * It subscribes to the position itself, which is what keeps a tick from
 * repainting the screen around it: the player is one large component (#50) and
 * the lyrics screen is following the song word by word.
 */
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useT } from '@/i18n';
import { formatDuration } from '@/lib/format';
import { usePlayerStore } from '@/store/player';
import { useSettings } from '@/store/settings';
import { colors, fontSize, gradientStopsFor, themed, useTheme } from '@/theme';

export function SeekBar({
  duration,
  style,
  tint,
}: {
  duration: number;
  style?: StyleProp<ViewStyle>;
  /** The played part and the thumb, the text colour if not given. */
  tint?: string;
}) {
  // Its own subscription to the theme: the screens around it have one, but a
  // component that reads a colour is the one that has to be told to paint again.
  useTheme();
  const t = useT();
  const positionSec = usePlayerStore((s) => s.positionSec);
  const seekTo = usePlayerStore((s) => s.seekTo);
  // Null while nobody is touching it, which is when the song is in charge.
  const [held, setHeld] = useState<number | null>(null);
  const shown = held ?? positionSec;
  // Tapping the right-hand time switches it between the length and what is
  // left, and the choice is kept.
  const remaining = useSettings((s) => s.showRemainingTime);
  const setRemaining = useSettings((s) => s.setShowRemainingTime);

  const pct = duration > 0 ? Math.min(100, Math.max(0, (shown / duration) * 100)) : 0;
  const [gradStart, gradEnd] = tint
    ? gradientStopsFor(tint)
    : [colors.accentGradientStart, colors.accentGradientEnd];

  return (
    <View style={style}>
      <View style={styles.trackContainer}>
        <View pointerEvents="none" style={styles.trackBg}>
          <LinearGradient
            colors={[gradStart, gradEnd]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.trackFill, { width: `${pct}%` }]}
          />
        </View>
        <View
          pointerEvents="none"
          style={[
            styles.thumbOuter,
            { left: `${pct}%` },
            held !== null && styles.thumbOuterActive,
          ]}
        >
          <View style={[styles.thumbInner, { backgroundColor: gradStart }]} />
        </View>
        <Slider
          style={[styles.slider, Platform.OS === 'ios' && styles.sliderIos]}
          minimumValue={0}
          maximumValue={Math.max(duration, 1)}
          value={shown}
          // Held down without moving yet: the thumb is already the finger's, so
          // the position stops being sent to it from here on.
          onSlidingStart={() => setHeld(positionSec)}
          onValueChange={setHeld}
          onSlidingComplete={(value) => {
            // Let go before the store is told, since `seekTo` writes the new
            // position straight away: there is no moment showing the old one.
            setHeld(null);
            seekTo(value);
          }}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="transparent"
        />
      </View>
      <View style={styles.times}>
        <Text style={styles.time}>{formatDuration(shown)}</Text>
        <Pressable
          // Not upward: that is the end of the bar, which has to seek.
          hitSlop={{ top: 0, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={remaining ? t('Show total time') : t('Show remaining time')}
          onPress={() => setRemaining(!remaining)}
        >
          <Text style={styles.time}>
            {remaining ? `-${formatDuration(Math.max(0, duration - shown))}` : formatDuration(duration)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = themed((colors) => ({
  trackContainer: {
    height: 30,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.mediaTrack,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
  },
  thumbOuter: {
    position: 'absolute',
    marginLeft: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbOuterActive: {
    transform: [{ scale: 1.15 }],
  },
  thumbInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  slider: {
    ...StyleSheet.absoluteFillObject,
    marginHorizontal: Platform.OS === 'android' ? -14 : 0,
    opacity: 0.01,
  },
  sliderIos: { marginHorizontal: 0 },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  time: { color: colors.textTime, fontSize: fontSize.xs, fontWeight: '500' },
}));
