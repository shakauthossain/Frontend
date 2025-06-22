
export interface SpeedResult {
  performanceScore: number;
  loadTime: number;
  firstPaint: number;
  pageSize: string;
  recommendations: Recommendation[];
  url: string;
  timestamp: Date;
}

export interface Recommendation {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}
