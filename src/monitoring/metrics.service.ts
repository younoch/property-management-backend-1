import { Injectable } from '@nestjs/common';
import { register, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
  });

  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route'],
  });

  private readonly activeUsers = new Gauge({
    name: 'active_users',
    help: 'Number of active users',
  });

  private readonly reportsCreated = new Counter({
    name: 'reports_created_total',
    help: 'Total number of reports created',
  });

  private readonly estimatesGenerated = new Counter({
    name: 'estimates_generated_total',
    help: 'Total number of estimates generated',
  });

  incrementHttpRequests(method: string, route: string, status: number) {
    this.httpRequestsTotal.inc({ method, route, status });
  }

  observeHttpRequestDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }

  incrementReportsCreated() {
    this.reportsCreated.inc();
  }

  incrementEstimatesGenerated() {
    this.estimatesGenerated.inc();
  }

  async getMetrics() {
    return await register.metrics();
  }
} 