import { queryClient } from '@/services/queryClient';
import { clearAppWidget } from '@/widgets/voltraWidgetService';

export const useQuotaStore = () => ({
  clearQuota: () => {
    queryClient.clear();
    clearAppWidget();
  },
});
