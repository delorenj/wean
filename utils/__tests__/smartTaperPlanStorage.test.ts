import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearSmartTaperPlan,
  loadSmartTaperPlan,
  saveSmartTaperPlan,
} from '../smartTaperPlanStorage';
import { generateSmartTaperPlan } from '../../pages/plan.helpers';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('smartTaperPlanStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const samplePlan = generateSmartTaperPlan({
    substance: 'Kratom',
    currentDose: 20,
    targetDose: 5,
    timelineDays: 28,
    unit: 'g',
    strategy: 'gradual',
    reductionPercent: 5,
    reductionEveryDays: 7,
    startDateISO: '2026-03-01T00:00:00.000Z',
  });

  it('loads null when no plan exists', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const result = await loadSmartTaperPlan();

    expect(result).toBeNull();
  });

  it('loads a valid plan', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(samplePlan));

    const result = await loadSmartTaperPlan();

    expect(result?.id).toBe(samplePlan.id);
    expect(result?.schedule).toHaveLength(samplePlan.schedule.length);
  });

  it('returns null for malformed stored payloads', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({ not: 'a-plan' }));

    const result = await loadSmartTaperPlan();

    expect(result).toBeNull();
  });

  it('saves valid plans', async () => {
    await saveSmartTaperPlan(samplePlan);

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      '@wean:smart_taper_plan',
      JSON.stringify(samplePlan)
    );
  });

  it('throws when saving invalid plans', async () => {
    await expect(saveSmartTaperPlan({ invalid: true } as never)).rejects.toThrow('Invalid smart taper plan');
  });

  it('clears saved plan', async () => {
    await clearSmartTaperPlan();

    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@wean:smart_taper_plan');
  });
});
