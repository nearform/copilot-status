import i18n from '@/services/i18n';
import { themes, type Theme } from '@/src/styles/unistyles';
import { useThemeStore } from '@/stores/theme';
import { QuotaInfo } from '@/types/quota';
import { getAvailableColorByPercent, getColorByPercent } from '@/utils/colorUtils';
import { formatFullDate } from '@/utils/dateTimeUtils';
import { formatPercent } from '@/utils/numberUtils';
import { Voltra } from 'voltra';
import { VoltraAndroid } from 'voltra/android';
import { createWidgetStyles } from './widgetStyles';

export interface WidgetData {
  username: string;
  quota: QuotaInfo;
}

export function getTheme(): Theme {
  return useThemeStore.getState().isDarkMode() ? themes.dark : themes.light;
}

export function IOSCopilotWidget({ quota, username }: WidgetData) {
  const theme = getTheme();
  const styles = createWidgetStyles(theme);
  const consumedColor = getColorByPercent(quota.consumedPercent, theme.colors);
  const remainingColor = getAvailableColorByPercent(quota.remainingPercent, theme.colors);

  const smallWidget = (
    <Voltra.VStack spacing={4} alignment="center" style={styles.container}>
      <Voltra.HStack spacing={16} alignment="center">
        <Voltra.VStack spacing={2} alignment="center">
          <Voltra.Text style={{ ...styles.mediumValue, color: consumedColor }}>
            {formatPercent(quota.consumedPercent)}
          </Voltra.Text>
          <Voltra.Text style={styles.label}>{i18n.t('widget.used')}</Voltra.Text>
        </Voltra.VStack>
      </Voltra.HStack>
      <Voltra.HStack spacing={16} alignment="center">
        <Voltra.VStack spacing={2} alignment="center">
          <Voltra.Text style={{ ...styles.mediumValue, color: theme.colors.text }}>
            {quota.usedQuota}
          </Voltra.Text>
          <Voltra.Text style={styles.label}>{i18n.t('widget.requestsUsed')}</Voltra.Text>
        </Voltra.VStack>
      </Voltra.HStack>
      <Voltra.HStack spacing={16} alignment="center">
        <Voltra.VStack spacing={2} alignment="center">
          <Voltra.Text style={{ ...styles.mediumValue, color: remainingColor }}>
            {quota.remainingQuota}
          </Voltra.Text>
          <Voltra.Text style={styles.label}>{i18n.t('widget.requestsLeft')}</Voltra.Text>
        </Voltra.VStack>
      </Voltra.HStack>
      <Voltra.Text style={styles.smallFooter}>
        {username} - {formatFullDate(i18n.t, quota.lastUpdated)}
      </Voltra.Text>
    </Voltra.VStack>
  );

  const mediumWidget = (
    <Voltra.VStack spacing={4} alignment="center" style={styles.container}>
      <Voltra.HStack spacing={16} alignment="center">
        <Voltra.VStack spacing={2} alignment="center">
          <Voltra.Text style={{ ...styles.largeValue, color: consumedColor }}>
            {formatPercent(quota.consumedPercent)}
          </Voltra.Text>
          <Voltra.Text style={styles.label}>{i18n.t('widget.used')}</Voltra.Text>
        </Voltra.VStack>
        <Voltra.VStack spacing={2} alignment="center">
          <Voltra.Text style={{ ...styles.largeValue, color: theme.colors.text }}>
            {quota.usedQuota}
          </Voltra.Text>
          <Voltra.Text style={styles.label}>{i18n.t('widget.requestsUsed')}</Voltra.Text>
        </Voltra.VStack>
        <Voltra.VStack spacing={2} alignment="center">
          <Voltra.Text style={{ ...styles.largeValue, color: remainingColor }}>
            {quota.remainingQuota}
          </Voltra.Text>
          <Voltra.Text style={styles.label}>{i18n.t('widget.requestsLeft')}</Voltra.Text>
        </Voltra.VStack>
      </Voltra.HStack>
      <Voltra.Text style={styles.footer}>
        {username} - {formatFullDate(i18n.t, quota.lastUpdated)}
      </Voltra.Text>
    </Voltra.VStack>
  );

  return {
    systemSmall: smallWidget,
    systemMedium: mediumWidget,
  };
}

export function IOSCopilotWidgetLoading() {
  const theme = getTheme();
  const styles = createWidgetStyles(theme);

  const loadingWidget = (
    <Voltra.VStack alignment="center" style={styles.container}>
      <Voltra.Text style={styles.loadingText}>{i18n.t('widget.loading')}</Voltra.Text>
    </Voltra.VStack>
  );

  return {
    systemSmall: loadingWidget,
    systemMedium: loadingWidget,
  };
}

export function IOSCopilotWidgetError() {
  const theme = getTheme();
  const styles = createWidgetStyles(theme);

  const errorWidget = (
    <Voltra.VStack alignment="center" style={styles.container}>
      <Voltra.Text style={styles.errorText}>{i18n.t('widget.signInToView')}</Voltra.Text>
    </Voltra.VStack>
  );

  return {
    systemSmall: errorWidget,
  };
}

/**
 * Android Copilot Widget - uses VoltraAndroid components
 * Maps to Jetpack Compose Glance on Android (Column, Row, Text)
 */
export function AndroidCopilotWidget({ quota, username }: WidgetData) {
  const theme = getTheme();
  const styles = createWidgetStyles(theme);
  const consumedColor = getColorByPercent(quota.consumedPercent, theme.colors);
  const remainingColor = getAvailableColorByPercent(quota.remainingPercent, theme.colors);

  return (
    <VoltraAndroid.Column
      horizontalAlignment="center-horizontally"
      verticalAlignment="center-vertically"
      style={styles.androidContainer}
    >
      <VoltraAndroid.Row
        horizontalAlignment="center-horizontally"
        verticalAlignment="center-vertically"
        style={styles.row}
      >
        <VoltraAndroid.Column horizontalAlignment="center-horizontally" style={styles.column}>
          <VoltraAndroid.Text style={{ ...styles.largeValue, color: consumedColor }}>
            {formatPercent(quota.consumedPercent)}
          </VoltraAndroid.Text>
          <VoltraAndroid.Text style={styles.label}>{i18n.t('widget.used')}</VoltraAndroid.Text>
        </VoltraAndroid.Column>

        <VoltraAndroid.Column horizontalAlignment="center-horizontally" style={styles.column}>
          <VoltraAndroid.Text style={{ ...styles.largeValue, color: theme.colors.text }}>
            {quota.usedQuota}
          </VoltraAndroid.Text>
          <VoltraAndroid.Text style={styles.label}>
            {i18n.t('widget.requestsUsed')}
          </VoltraAndroid.Text>
        </VoltraAndroid.Column>

        <VoltraAndroid.Column horizontalAlignment="center-horizontally" style={styles.column}>
          <VoltraAndroid.Text style={{ ...styles.largeValue, color: remainingColor }}>
            {quota.remainingQuota}
          </VoltraAndroid.Text>
          <VoltraAndroid.Text style={styles.label}>
            {i18n.t('widget.requestsLeft')}
          </VoltraAndroid.Text>
        </VoltraAndroid.Column>
      </VoltraAndroid.Row>

      <VoltraAndroid.Text style={styles.footerWithMargin}>
        {username} - {formatFullDate(i18n.t, quota.lastUpdated)}
      </VoltraAndroid.Text>
    </VoltraAndroid.Column>
  );
}

export function AndroidCopilotWidgetLoading() {
  const theme = getTheme();
  const styles = createWidgetStyles(theme);

  return (
    <VoltraAndroid.Column
      horizontalAlignment="center-horizontally"
      verticalAlignment="center-vertically"
      style={styles.androidContainer}
    >
      <VoltraAndroid.Text style={styles.loadingText}>{i18n.t('widget.loading')}</VoltraAndroid.Text>
    </VoltraAndroid.Column>
  );
}

export function AndroidCopilotWidgetError() {
  const theme = getTheme();
  const styles = createWidgetStyles(theme);

  return (
    <VoltraAndroid.Column
      horizontalAlignment="center-horizontally"
      verticalAlignment="center-vertically"
      style={styles.androidContainer}
    >
      <VoltraAndroid.Text style={styles.errorText}>
        {i18n.t('widget.signInToView')}
      </VoltraAndroid.Text>
    </VoltraAndroid.Column>
  );
}
