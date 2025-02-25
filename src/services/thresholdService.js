const MEMORY_THRESHOLD_KEY = 'memoryThresholdGB';
const CPU_THRESHOLD_KEY = 'cpuThreshold';

export const getStoredThreshold = (key) => {
  const value = localStorage.getItem(key);
  return value ? parseFloat(value) : null;
};

export const storeThreshold = (key, value) => {
  localStorage.setItem(key, value.toString());
};

export const getDefaultThresholds = () => ({
  memory: getStoredThreshold(MEMORY_THRESHOLD_KEY) || 4,
  cpu: getStoredThreshold(CPU_THRESHOLD_KEY) || 80
});

export { MEMORY_THRESHOLD_KEY, CPU_THRESHOLD_KEY };
