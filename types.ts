/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HdiCategory = 'Very High' | 'High' | 'Medium' | 'Low';

export interface CountryData {
  country: string;
  lifeExpectancy: number;
  expectedSchooling: number;
  meanSchooling: number;
  gniPerCapita: number;
  hdiCategory: HdiCategory;
  hdiValue: number;
}

export interface PredictionInput {
  lifeExpectancy: number;
  expectedSchooling: number;
  meanSchooling: number;
  gniPerCapita: number;
}

export interface PredictionResult {
  predictedCategory: HdiCategory;
  calculatedHdi: number;
  confidence: number; // probability score of the leaf node
  decisionPath: string[]; // steps taken in the decision tree
  indices: {
    lifeExpectancyIndex: number;
    educationIndex: number;
    incomeIndex: number;
  };
  aiAnalysis?: string;
}

export interface ModelStats {
  trainAccuracy: number;
  testAccuracy: number;
  featureImportances: {
    feature: keyof PredictionInput;
    label: string;
    importance: number;
  }[];
  confusionMatrix: {
    labels: HdiCategory[];
    matrix: number[][]; // Actual (rows) vs Predicted (cols)
  };
  treeDepth: number;
  totalSamples: number;
}

export interface CategoryStats {
  category: HdiCategory;
  count: number;
  avgLifeExpectancy: number;
  avgExpectedSchooling: number;
  avgMeanSchooling: number;
  avgGniPerCapita: number;
  avgHdiValue: number;
}

export interface DatasetStats {
  totalCountries: number;
  categoryBreakdown: Record<HdiCategory, number>;
  averages: CategoryStats[];
}
