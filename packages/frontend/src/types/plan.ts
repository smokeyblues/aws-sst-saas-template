export interface Plan {
    id: string;
    name: string;
    description: string;
    monthlyPriceId: string;
    annualPriceId: string;
    monthlyPrice: number;
    annualPrice: number;
    currency: string;
  }