const useLoadingState = (key?: string) => ({
  isLoading: false,
  error: null,
  withLoading: async (fn: any) => await fn(),
});

export default useLoadingState;

