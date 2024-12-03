class GuestService {
  private static instance: GuestService;
  private readonly STORAGE_KEY = 'guest_remaining_analyses';
  private readonly DEFAULT_DAILY_LIMIT = 3;

  private constructor() {
    this.initializeRemainingAnalyses();
  }

  public static getInstance(): GuestService {
    if (!GuestService.instance) {
      GuestService.instance = new GuestService();
    }
    return GuestService.instance;
  }

  private initializeRemainingAnalyses(): void {
    const remaining = localStorage.getItem(this.STORAGE_KEY);
    if (!remaining) {
      localStorage.setItem(this.STORAGE_KEY, this.DEFAULT_DAILY_LIMIT.toString());
    }
  }

  public getRemainingAnalyses(): number {
    return parseInt(localStorage.getItem(this.STORAGE_KEY) || '0', 10);
  }

  public decrementRemainingAnalyses(): void {
    const remaining = this.getRemainingAnalyses();
    if (remaining > 0) {
      localStorage.setItem(this.STORAGE_KEY, (remaining - 1).toString());
    }
  }

  public resetDailyLimit(): void {
    localStorage.setItem(this.STORAGE_KEY, this.DEFAULT_DAILY_LIMIT.toString());
  }
}

export const guestService = GuestService.getInstance();
