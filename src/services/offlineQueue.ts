import type { ExpenseFormData } from '../types';

interface QueuedExpense {
  id: string;
  data: ExpenseFormData;
  timestamp: number;
}

class OfflineQueue {
  private static instance: OfflineQueue;
  private queue: QueuedExpense[] = [];
  private readonly STORAGE_KEY = 'onepocket_offline_queue';

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  addToQueue(data: ExpenseFormData): string {
    const queueItem: QueuedExpense = {
      id: Math.random().toString(36).substr(2, 9),
      data,
      timestamp: Date.now()
    };

    this.queue.push(queueItem);
    this.saveQueue();
    return queueItem.id;
  }

  async processQueue(): Promise<void> {
    if (!navigator.onLine || this.queue.length === 0) return;

    const itemsToProcess = [...this.queue];

    for (const item of itemsToProcess) {
      try {
        // Here you would call your actual API
        // For now, we'll just simulate success
        await new Promise(resolve => setTimeout(resolve, 100));

        this.removeFromQueue(item.id);
      } catch (error) {
        console.error('Failed to process queued item:', error);
        // Keep item in queue to retry later
      }
    }
  }

  private removeFromQueue(id: string): void {
    this.queue = this.queue.filter(item => item.id !== id);
    this.saveQueue();
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      this.processQueue();
    });
  }

  getQueueSize(): number {
    return this.queue.length;
  }
}

export const offlineQueue = OfflineQueue.getInstance();