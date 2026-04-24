import { QUERY_KEYS } from '@/hooks/useGitHub';
import { GitHubUser } from '@/services/api';
import i18n from '@/services/i18n';
import { queryClient } from '@/services/queryClient';
import type { AllQuotas, QuotaInfo } from '@/types/quota';
import { getAvailableColorByPercent, getColorByPercent } from '@/utils/colorUtils';
import { formatFullDate } from '@/utils/dateTimeUtils';
import { formatPercent } from '@/utils/numberUtils';
import { Platform } from 'react-native';
import { VoltraAndroid } from 'voltra/android';
import {
  clearAndroidWidget,
  updateAndroidWidget,
  type AndroidWidgetVariants,
} from 'voltra/android/client';
import { clearWidget, updateWidget } from 'voltra/client';
import {
  getTheme,
  IOSCopilotWidget,
  IOSCopilotWidgetError,
  type WidgetData,
} from './VoltraCopilotWidget';
import { createWidgetStyles } from './widgetStyles';

const WIDGET_ID = 'copilot_status';
const DEEP_LINK_URL = 'com.nearform.copilotstatus://';

function getWidgetData(): { quota: QuotaInfo | null; username: string; lastFetch: number | null } {
  const queryState = queryClient.getQueryState<AllQuotas>(QUERY_KEYS.COPILOT_QUOTA);
  const githubUser = queryClient.getQueryData<GitHubUser>(QUERY_KEYS.GITHUB_USER);

  const data = queryState?.data;
  const quota = (data?.hasSubscription && ('premium_interactions' in data ? data.premium_interactions : data.chat)) || null;

  return {
    quota,
    username: githubUser?.login ?? '',
    lastFetch: queryState?.dataUpdatedAt ?? null,
  };
}

/**
 * Builds iOS widget variants for systemSmall and systemMedium
 */
function buildIOSWidgetVariants(quota: QuotaInfo | null, username: string) {
  if (!quota) {
    return IOSCopilotWidgetError();
  }

  const widgetData: WidgetData = {
    username,
    quota,
  };

  return IOSCopilotWidget(widgetData);
}

/**
 * Builds Android widget variants with size breakpoints
 * Creates JSX directly to be processed by Voltra's renderer
 */
function buildAndroidWidgetVariants(
  quota: QuotaInfo | null,
  username: string
): AndroidWidgetVariants {
  const theme = getTheme();
  const styles = createWidgetStyles(theme);

  if (!quota) {
    // Error state widget
    return [
      {
        size: { width: 250, height: 70 },
        content: (
          <VoltraAndroid.Column
            horizontalAlignment="center-horizontally"
            verticalAlignment="center-vertically"
            style={styles.androidContainer}
            deepLinkUrl={DEEP_LINK_URL}
          >
            <VoltraAndroid.Text style={styles.errorText}>
              {i18n.t('widget.signInToView')}
            </VoltraAndroid.Text>
          </VoltraAndroid.Column>
        ),
      },
    ];
  }

  const consumedColor = getColorByPercent(quota.consumedPercent, theme.colors);
  const remainingColor = getAvailableColorByPercent(quota.remainingPercent, theme.colors);

  return [
    {
      size: { width: 250, height: 70 },
      content: (
        <VoltraAndroid.Column
          horizontalAlignment="center-horizontally"
          verticalAlignment="center-vertically"
          style={styles.androidContainer}
          deepLinkUrl={DEEP_LINK_URL}
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
      ),
    },
  ];
}

/**
 * Updates the Copilot Status widget with current quota data
 * Uses platform-specific Voltra APIs
 */
export async function updateCopilotWidget(): Promise<void> {
  try {
    const { quota, username } = getWidgetData();

    if (Platform.OS === 'ios') {
      const variants = buildIOSWidgetVariants(quota, username);
      await updateWidget(WIDGET_ID, variants, { deepLinkUrl: DEEP_LINK_URL });
    } else if (Platform.OS === 'android') {
      const variants = buildAndroidWidgetVariants(quota, username);
      await updateAndroidWidget(WIDGET_ID, variants, { deepLinkUrl: DEEP_LINK_URL });
    }
  } catch {}
}

/**
 * Clears the widget data, showing the sign-in required state
 */
export async function clearCopilotWidget(): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      await clearWidget(WIDGET_ID);
    } else if (Platform.OS === 'android') {
      await clearAndroidWidget(WIDGET_ID);
    }
  } catch {}
}
