import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAnalytics, logEvent } from 'firebase/analytics';

interface PerformanceMetric {
  metricName: string;
  value: number;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

interface ModelPerformanceData {
  modelName: string;
  inferenceTime: number;
  imageSize: number;
  success: boolean;
  errorType?: string;
}

class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private metricsBuffer: PerformanceMetric[] = [];
  private readonly BUFFER_SIZE = 10;
  private readonly METRICS_COLLECTION = 'performance_metrics';

  private constructor() {
    // Initialize buffer flush interval (every 5 minutes)
    setInterval(() => this.flushMetricsBuffer(), 5 * 60 * 1000);
  }

  public static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  public async recordMetric(
    metricName: string,
    value: number,
    userId?: string,
    metadata?: Record<string, any>
  ) {
    const metric: PerformanceMetric = {
      metricName,
      value,
      timestamp: new Date(),
      userId,
      metadata,
    };

    this.metricsBuffer.push(metric);
    
    // Log to Firebase Analytics for real-time monitoring
    const analytics = getAnalytics();
    logEvent(analytics, 'performance_metric', {
      metric_name: metricName,
      value: value,
      user_id: userId || 'anonymous'
    });

    if (this.metricsBuffer.length >= this.BUFFER_SIZE) {
      await this.flushMetricsBuffer();
    }
  }

  public async recordModelPerformance(data: ModelPerformanceData) {
    await this.recordMetric('model_inference', data.inferenceTime, undefined, {
      modelName: data.modelName,
      imageSize: data.imageSize,
      success: data.success,
      errorType: data.errorType
    });
  }

  public async recordImageProcessingTime(processingTime: number, imageSize: number) {
    await this.recordMetric('image_processing', processingTime, undefined, {
      imageSize
    });
  }

  public async recordApiLatency(apiName: string, latency: number, success: boolean) {
    await this.recordMetric('api_latency', latency, undefined, {
      apiName,
      success
    });
  }

  private async flushMetricsBuffer() {
    if (this.metricsBuffer.length === 0) return;

    const db = getFirestore();
    const batch = this.metricsBuffer.map(metric => ({
      ...metric,
      timestamp: Timestamp.fromDate(metric.timestamp)
    }));

    try {
      // Store metrics in Firestore
      const metricsCollection = collection(db, this.METRICS_COLLECTION);
      await Promise.all(batch.map(metric => addDoc(metricsCollection, metric)));
      
      // Clear the buffer after successful flush
      this.metricsBuffer = [];
    } catch (error) {
      console.error('Failed to flush metrics:', error);
      // Keep the metrics in buffer to try again later
    }
  }

  // Helper method to calculate percentiles for performance analysis
  public calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }
}

export const performanceMonitoring = PerformanceMonitoringService.getInstance();
