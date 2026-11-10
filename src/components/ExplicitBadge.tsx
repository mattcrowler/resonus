/**
 * The little "E" next to a title: the file is tagged as explicit.
 *
 * Only the explicit case gets a badge. Servers also report "clean" (a censored
 * edit) and that is worth reading in the song information sheet, but a mark on
 * every row for the absence of swearing is not what anyone is scanning a list
 * for. Nothing at all is what a track with no advisory tag shows, which is most
 * of them.
 *
 * Switched off from Settings › Appearance, and the switch is read
 * here rather than by each of the eight places that draw one, so there is no
 * screen left to remember to check.
 */
import { Text, View } from 'react-native';

import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { radius, themed } from '@/theme';

/**
 * Whether the badge would draw anything at all.
 *
 * Rows ask before they lay themselves out: the badge shares its line with the
 * artist name, and a row with no artist must not keep an empty line open for a
 * badge that is turned off.
 */
export function useExplicitBadge(status?: string): boolean {
  const show = useSettings((s) => s.showExplicitTag);
  return show && status === 'explicit';
}

export function ExplicitBadge({ status }: { status?: string }) {
  const t = useT();
  const visible = useExplicitBadge(status);
  if (!visible) return null;
  return (
    <View style={styles.badge} accessibilityLabel={t('Explicit')}>
      <Text style={styles.letter} allowFontScaling={false}>
        explicit
      </Text>
    </View>
  );
}

const styles = themed((colors) => ({
  badge: {
    paddingHorizontal: 6,
    height: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: colors.background,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.2,
    lineHeight: 13,
  },
}));
