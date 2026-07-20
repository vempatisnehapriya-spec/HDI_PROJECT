/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { countryDataset, calculateHdiValue, getDatasetStats } from './src/lib/dataset.ts';
import { DecisionTree } from './src/lib/decisionTree.ts';
import { PredictionInput } from './src/types.ts';

// Initialize the Decision Tree model
const model = new DecisionTree(4, 2);
console.log('Training HDI Decision Tree model with country dataset...');
model.fit(countryDataset);
console.log('Model trained successfully.');

// Get model statistics/evaluation metrics
const modelEvaluation = DecisionTree.evaluate(countryDataset, 0.8, 4, 2);

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini AI Client initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Gemini AI Client:', err);
  }
} else {
  console.log('No GEMINI_API_KEY found in environment variables. Gemini insights will run in fallback rule-based mode.');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // 1. GET /api/countries - Fetch all countries in the dataset
  app.get('/api/countries', (req, res) => {
    try {
      res.json(countryDataset);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch country dataset', message: err.message });
    }
  });

  // 2. GET /api/stats - Fetch dataset statistics
  app.get('/api/stats', (req, res) => {
    try {
      const stats = getDatasetStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to compute dataset statistics', message: err.message });
    }
  });

  // 3. GET /api/model - Fetch Decision Tree parameters and performance metrics
  app.get('/api/model', (req, res) => {
    try {
      res.json({
        modelName: 'CART Decision Tree Classifier',
        evaluation: modelEvaluation,
        treeRoot: model.root, // send tree structure for frontend visual tree graph
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch model metrics', message: err.message });
    }
  });

  // 4. POST /api/predict - Receives indicators, calculates exact HDI, predicts via Decision Tree, and returns Gemini analysis
  app.post('/api/predict', async (req, res) => {
    try {
      const { lifeExpectancy, expectedSchooling, meanSchooling, gniPerCapita } = req.body as PredictionInput;

      // Basic input validation
      if (
        lifeExpectancy === undefined ||
        expectedSchooling === undefined ||
        meanSchooling === undefined ||
        gniPerCapita === undefined
      ) {
        return res.status(400).json({ error: 'Missing required development indicators.' });
      }

      if (
        lifeExpectancy < 20 || lifeExpectancy > 85 ||
        expectedSchooling < 0 || expectedSchooling > 18 ||
        meanSchooling < 0 || meanSchooling > 15 ||
        gniPerCapita < 100 || gniPerCapita > 75000
      ) {
        return res.status(400).json({ error: 'Indicators are outside valid standard boundaries.' });
      }

      // Calculate mathematical HDI indices and benchmark category
      const mathResult = calculateHdiValue(lifeExpectancy, expectedSchooling, meanSchooling, gniPerCapita);

      // Predict category via trained Decision Tree model
      const modelPrediction = model.predict({
        lifeExpectancy,
        expectedSchooling,
        meanSchooling,
        gniPerCapita,
      });

      // Generate AI prompt for country analysis and development recommendations
      const aiPrompt = `
You are a senior data analyst and development economist specializing in the UN Human Development Index (HDI).
An analyst entered the following development indicators for a simulated country:
- Life Expectancy: ${lifeExpectancy} years (Theoretical Index: ${mathResult.lei.toFixed(3)})
- Expected Years of Schooling: ${expectedSchooling} years (Theoretical Index: ${mathResult.eysi.toFixed(3)})
- Mean Years of Schooling: ${meanSchooling} years (Theoretical Index: ${mathResult.mysi.toFixed(3)})
- Education Index: ${mathResult.ei.toFixed(3)}
- GNI per Capita: $${gniPerCapita.toLocaleString()} PPP (Theoretical Index: ${mathResult.ii.toFixed(3)})
- Overall Calculated HDI Index: ${mathResult.hdiValue.toFixed(3)} (Standard formula)
- Trained Decision Tree Predicted Category: ${modelPrediction.predictedCategory} (Confidence: ${(modelPrediction.confidence * 100).toFixed(1)}%)

Please provide a highly professional, well-structured, Markdown-formatted analysis covering:
1. **Comparative Benchmarks**: Which real-world countries currently have a similar development profile? Give 2-3 specific actual country examples.
2. **Category Assessment**: Explain the main factors leading to this Human Development classification.
3. **Targeted Policy Recommendations**: What are the top 2-3 highly specific developmental policies or resource investments this simulated nation should adopt to boost its index (e.g., healthcare expansion, educational infrastructure, economic diversification)?

Format rules: Use elegant headings, clear paragraphs, bullet points, and highlight key metrics. Do not include any meta comments, references to port numbers or local systems, or general pleasantries. Keep it highly authoritative and dense.
`;

      let aiAnalysis = '';
      if (aiClient) {
        try {
          const response = await aiClient.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: aiPrompt,
          });
          aiAnalysis = response.text || '';
        } catch (err: any) {
          console.error('Gemini API call failed, using fallback:', err.message);
          aiAnalysis = generateFallbackAnalysis(lifeExpectancy, expectedSchooling, meanSchooling, gniPerCapita, mathResult, modelPrediction);
        }
      } else {
        aiAnalysis = generateFallbackAnalysis(lifeExpectancy, expectedSchooling, meanSchooling, gniPerCapita, mathResult, modelPrediction);
      }

      res.json({
        predictedCategory: modelPrediction.predictedCategory,
        calculatedHdi: Number(mathResult.hdiValue.toFixed(3)),
        confidence: modelPrediction.confidence,
        decisionPath: modelPrediction.decisionPath,
        indices: {
          lifeExpectancyIndex: Number(mathResult.lei.toFixed(3)),
          educationIndex: Number(mathResult.ei.toFixed(3)),
          incomeIndex: Number(mathResult.ii.toFixed(3)),
        },
        aiAnalysis,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to calculate prediction', message: err.message });
    }
  });

  // Serve static assets and handle SPA routing
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

// Rule-based high-quality fallback generator when Gemini API is unavailable
function generateFallbackAnalysis(
  le: number,
  es: number,
  ms: number,
  gni: number,
  math: any,
  pred: any
): string {
  const cat = pred.predictedCategory;

  let benchmark = '';
  let assessment = '';
  let policies = '';

  if (cat === 'Very High') {
    benchmark = '- **Switzerland** (HDI: 0.962)\n- **Japan** (HDI: 0.925)\n- **Uruguay** (HDI: 0.809)';
    assessment = `The country exhibits exceptional performance across all development vectors. Life expectancy (${le} years) and education index (${math.ei.toFixed(3)}) align with the world's most advanced societies. GNI per Capita ($${gni.toLocaleString()}) provides robust material standards of living, creating a self-reinforcing cycle of excellent health, high education, and solid prosperity.`;
    policies = `1. **Sustain High-Tech Innovation**: Invest in advanced digital infrastructure and R&D to maintain global competitiveness.\n2. **Promote Lifelong Learning**: Expand tertiary and adult retraining systems to prepare the workforce for future automation.\n3. **Address Healthcare Efficiency**: Focus on preventative medicine and active aging to manage rising senior healthcare costs.`;
  } else if (cat === 'High') {
    benchmark = '- **China** (HDI: 0.768)\n- **Brazil** (HDI: 0.754)\n- **South Africa** (HDI: 0.713)';
    assessment = `The country has achieved solid progress. Health indicators are strong (${le} years of life expectancy), and educational enrollment is extensive. However, there are bottlenecks. The gap between Mean Years of Schooling (${ms} years) and Expected Years of Schooling (${es} years) suggests historical deficits that require modern reform. Income ($${gni.toLocaleString()}) reflects a robust, growing middle-income profile.`;
    policies = `1. **Improve Tertiary Completion**: Create targeted scholarships and vocational pipelines to translate enrollment into actual degrees.\n2. **Industrial Diversification**: Move from agriculture/primary exports toward advanced manufacturing and service sectors.\n3. **Universal Health Coverage**: Strengthen primary healthcare facilities in semi-rural and secondary cities.`;
  } else if (cat === 'Medium') {
    benchmark = '- **India** (HDI: 0.633)\n- **Ghana** (HDI: 0.632)\n- **Nepal** (HDI: 0.602)';
    assessment = `The country faces standard structural challenges typical of transitioning economies. While educational metrics are steadily improving, GNI per capita ($${gni.toLocaleString()}) and life expectancy (${le} years) limit comprehensive human capabilities. Low mean years of schooling (${ms} years) reflects significant historical educational deficits in the adult population.`;
    policies = `1. **Universal Secondary Education**: Mandate school completion up to age 16 and provide free school meals to increase retention.\n2. **Basic Healthcare Infrastructure**: Invest heavily in sanitation, clean drinking water, and infant immunization campaigns.\n3. **Micro-enterprise Support**: Create accessible credit programs and vocational training to transition informal-sector workers into formal employment.`;
  } else {
    benchmark = '- **Ethiopia** (HDI: 0.498)\n- **Afghanistan** (HDI: 0.478)\n- **Niger** (HDI: 0.400)';
    assessment = `The country exhibits severe, urgent development shortages across all major pillars. High infant and child mortality rates constrain overall life expectancy (${le} years). Low income ($${gni.toLocaleString()}) prevents essential public investments, while short educational achievement limits human agency. The system is locked in an extreme low-development trap.`;
    policies = `1. **Basic Needs and Primary Health**: Direct all international aid and national budgets toward clean water, maternal health clinics, and eradicating preventable infectious diseases.\n2. **Primary School Access**: Guarantee free primary school education, recruit local instructors, and invest in basic literacy campaigns.\n3. **Agricultural Modernization**: Introduce modern irrigation, seed storage facilities, and transport infrastructure to establish domestic food security.`;
  }

  return `
### Professional Fallback Development Analysis

#### 1. Comparative Benchmarks
Real-world nations with an identical development signature:
${benchmark}

#### 2. Development Assessment
${assessment}

#### 3. Targeted Policy Recommendations
To elevate the development category and improve human capability, the following actions are highly recommended:
${policies}

---
*Note: This report was compiled using our local rule-based economic analyzer because no active Gemini AI API key was detected in the environment secrets.*
`;
}

startServer();
