export interface Email {
  to: string;
  subject: string;
  body: DailySummaryReport;
}

export interface SkuSummary {
  sku: string;
  totalQuantity: number;
}

export interface DailySummaryReport {
  totalSales: number;
  skuSummary: SkuSummary[];
}
