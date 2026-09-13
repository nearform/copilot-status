import { queryClient } from '@/services/queryClient';
import { useQuotaStore } from '@/stores/quota';
import { clearAppWidget } from '@/widgets/voltraWidgetService';

jest.mock('@/services/queryClient', () => ({
  queryClient: {
    clear: jest.fn(),
  },
}));

jest.mock('@/widgets/voltraWidgetService', () => ({
  clearAppWidget: jest.fn(),
}));

describe('stores/quota', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useQuotaStore', () => {
    it('should clear queryClient when clearQuota is called', () => {
      const store = useQuotaStore();
      store.clearQuota();

      expect(queryClient.clear).toHaveBeenCalled();
    });

    it('should clear widget when clearQuota is called', () => {
      const store = useQuotaStore();
      store.clearQuota();

      expect(clearAppWidget).toHaveBeenCalled();
    });
  });
});
