import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      geminiClient = new GoogleGenAI({ apiKey });
    }
  }
  return geminiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Benchmark rates in Indian Rupees (INR ₹) for reference
export const BENCHMARK_RATES = {
  fertilizers: [
    { name: 'Urea (Subsidized Neem-Coated)', unit: '45kg bag', typicalMin: 266, typicalMax: 270, govtSubsidyCeiling: 266.5, note: 'Govt. fixed statutory MRP ₹266.50/bag' },
    { name: 'Nano Urea Liquid (IFFCO)', unit: '500ml bottle', typicalMin: 220, typicalMax: 240, govtSubsidyCeiling: 225, note: 'Equivalent to 1 bag Urea; saves transport & application cost' },
    { name: 'DAP (Di-Ammonium Phosphate)', unit: '50kg bag', typicalMin: 1300, typicalMax: 1400, govtSubsidyCeiling: 1350, note: 'Subsidized MRP approx ₹1,350/50kg' },
    { name: 'Nano DAP Liquid', unit: '500ml bottle', typicalMin: 580, typicalMax: 600, govtSubsidyCeiling: 600, note: 'Cost-effective alternative to bulk DAP' },
    { name: 'MOP (Muriate of Potash)', unit: '50kg bag', typicalMin: 1650, typicalMax: 1800, govtSubsidyCeiling: 1700, note: 'Subsidized through NBS scheme' },
    { name: 'NPK 10:26:26 / 12:32:16', unit: '50kg bag', typicalMin: 1400, typicalMax: 1550, govtSubsidyCeiling: 1470, note: 'Complex fertilizer for balanced nutrition' },
    { name: 'Single Super Phosphate (SSP)', unit: '50kg bag', typicalMin: 450, typicalMax: 550, govtSubsidyCeiling: 500, note: 'Economical source of Phosphorus & Sulphur' },
    { name: 'Vermicompost (Organic)', unit: '50kg bag', typicalMin: 300, typicalMax: 450, govtSubsidyCeiling: 350, note: 'Locally sourced bio-fertilizer cuts long-term chemical bills' },
    { name: 'Zinc Sulphate (21% or 33%)', unit: '5kg pack', typicalMin: 280, typicalMax: 380, govtSubsidyCeiling: 320, note: 'Micro-nutrient for paddy and wheat' }
  ],
  pesticides: [
    { name: 'Chlorpyrifos 20% EC', unit: '1 litre', typicalMin: 320, typicalMax: 450, note: 'Broad spectrum termiticide/insecticide' },
    { name: 'Neem Oil 10000 PPM (Bio-Pesticide)', unit: '1 litre', typicalMin: 380, typicalMax: 550, note: 'Safe natural repellent; lowest residual cost' },
    { name: 'Imidacloprid 17.8% SL', unit: '250 ml', typicalMin: 260, typicalMax: 350, note: 'Sucking pest control in cotton/vegetables' },
    { name: 'Mancozeb 75% WP', unit: '500 gm', typicalMin: 200, typicalMax: 290, note: 'Contact fungicide for blight & rust' },
    { name: 'Trichoderma Viride (Bio-Fungicide)', unit: '1 kg', typicalMin: 120, typicalMax: 180, note: 'Low-cost bio-control agent for soil-borne pathogens' }
  ],
  seeds: [
    { name: 'Certified Paddy/Rice Seed (HYV)', unit: '10 kg bag', typicalMin: 350, typicalMax: 550, note: 'Govt. Krishi Bhavan/NSC rates' },
    { name: 'Certified Wheat Seed (HD-2967 / HD-3086)', unit: '40 kg bag', typicalMin: 1100, typicalMax: 1400, note: 'State seed corporation rates' },
    { name: 'Bt Cotton Hybrid Seed', unit: '450 gm packet', typicalMin: 800, typicalMax: 870, note: 'Govt capped packet rate in India' },
    { name: 'Hybrid Maize / Corn Seed', unit: '4 kg pack', typicalMin: 650, typicalMax: 950, note: 'Check state seed subsidy' }
  ],
  soil: [
    { name: 'Red Loam Soil / Top Soil (Fertile)', unit: '1 Tractor Trolley (~3 Tonnes)', typicalMin: 2200, typicalMax: 3500, note: 'Local quarry/excavation rate' },
    { name: 'Well-Rotted Farm Yard Manure (FYM)', unit: '1 Tractor Trolley (~2.5 Tonnes)', typicalMin: 1800, typicalMax: 2800, note: 'Direct village dairy procurement saves ₹500+' },
    { name: 'Cocopeat Block (High Grade)', unit: '5 kg block', typicalMin: 140, typicalMax: 200, note: 'For nursery bedding and seedling trays' },
    { name: 'Agricultural Gypsum (Alkaline soil reclamation)', unit: '50 kg bag', typicalMin: 160, typicalMax: 240, note: 'Highly subsidized by Dept. of Agriculture' }
  ]
};

// API: Benchmark prices
app.get('/api/benchmarks', (req, res) => {
  res.json({ rates: BENCHMARK_RATES, currency: 'INR', symbol: '₹' });
});

// API: Smart Kisan Savings & Schedule AI Advisor
app.post('/api/ai/advisor', async (req, res) => {
  try {
    const { crop, landSize, acreUnit, currentExpenses, query, category } = req.body;
    const client = getGeminiClient();

    if (!client) {
      // Fallback actionable tips if API key is not configured
      return res.json({
        advice: `### 🌾 Kisan Smart Cost-Reduction Advisory (Indian Farming)
1. **Soil & Basal Fertilizer Savings**:
   - Always do a Soil Health Card test (available for nominal ₹20-50 at nearest KVK or Block Ag office) before purchasing DAP or Potash. Over-application of DAP is the #1 wasted expense.
   - Switch 1 bag of conventional Urea (₹266.50) with Nano Urea Liquid (₹225/500ml) sprayed foliarly; this eliminates 50% nitrogen leaching and cuts transport hassle.
2. **Pesticides & Crop Protection**:
   - For early sucking pests, use 10,000 PPM Neem Oil (₹450/L) or sticky yellow traps (₹10/piece) instead of repeated expensive synthetic pyrethroid sprays.
   - Use Trichoderma Viride (₹140/kg) for seed treatment before sowing; prevents wilt and root rot for less than ₹50/acre.
3. **Purchasing Tips with Less Price**:
   - Purchase certified seeds from National Seeds Corporation (NSC) or State Agro/KVIC depots where government subsidies are directly discounted at billing.
   - Never buy unbranded or loose Urea/DAP above statutory MRP (Urea ₹266.50/45kg, DAP ₹1350/50kg). Check for the POS receipt linked to your Aadhaar card.`,
        suggestedBudgetTip: 'Adopting integrated nutrient management (FYM + Biofertilizer + 75% chemical) typically saves ₹2,800 to ₹4,500 per acre per season.',
        isFallback: true
      });
    }

    const prompt = `You are "விவசாயிகளின் உழைப்பு (Vivasaigalin Uzhaippu) Kisan Sahayak", an expert Indian agricultural economist and agronomist advisor.
A farmer is seeking advice on how to purchase inputs (Fertilizer, Pesticide, Seeds, Soil) at the lowest price in Indian Rupees (₹/INR) and optimize their usage schedule to avoid waste.

Farmer's Context:
- Crop: ${crop || 'General Mixed Crops (Paddy/Wheat/Cotton/Vegetables)'}
- Land size: ${landSize || '2'} ${acreUnit || 'Acres'}
- Specific question/concern: ${query || 'How can I lower my input purchase costs and schedule application efficiently?'}
- Category focus: ${category || 'All inputs (Fertilizer, Pesticides, Seeds, Soil)'}
- Recent monthly expense context: ${JSON.stringify(currentExpenses || [])}

Provide practical, money-saving advice tailored to Indian agricultural conditions with Tamil headings/sub-headings and explanations:
1. "Less Price" Purchasing Strategies (How to get lowest MRP, DBT subsidies, IFFCO / KRIBHCO / TANFED / State seed corp options, avoiding dealer black-market pricing).
2. Cheaper & Higher-Efficiency Substitutes (e.g. Nano Urea vs granular, Biofertilizer/Rhizobium/PSB ₹40 packets vs heavy DAP, Neem oil vs synthetic).
3. Optimal Application Schedule (Exact crop stage, dosage per acre, weather timings to prevent spray washout).
4. Estimated Potential Savings in ₹ (Indian Rupees).

Format with clear markdown headings, bullet points, Tamil terms where helpful, and highlight all monetary figures with '₹' (Indian Rupees). Keep the language simple, respectful, and direct for a hardworking farmer.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({
      advice: response.text,
      isFallback: false
    });
  } catch (err: any) {
    console.error('Gemini Advisor Error:', err);
    res.status(500).json({
      error: 'Failed to generate advice',
      details: err.message || String(err),
      fallbackAdvice: 'Please check your internet connection or verify inputs. In general, buying from primary cooperative societies (PACS) offers the guaranteed statutory MRP in Indian Rupees without dealer markups.'
    });
  }
});

// API: Price check on an item
app.post('/api/ai/price-check', async (req, res) => {
  try {
    const { itemName, category, unit, paidPrice, quantity } = req.body;
    const client = getGeminiClient();

    if (!client) {
      // Local rule-based check
      const normalizedName = (itemName || '').toLowerCase();
      let benchmark = null;
      const allBenchmarks = [
        ...BENCHMARK_RATES.fertilizers,
        ...BENCHMARK_RATES.pesticides,
        ...BENCHMARK_RATES.seeds,
        ...BENCHMARK_RATES.soil
      ];

      for (const b of allBenchmarks) {
        if (normalizedName.includes(b.name.toLowerCase().split(' ')[0])) {
          benchmark = b;
          break;
        }
      }

      const price = Number(paidPrice) || 0;
      let status = 'fair';
      let message = 'Price appears aligned with prevailing market conditions in India.';

      if (benchmark) {
        if (price > benchmark.typicalMax * 1.1) {
          status = 'overpriced';
          message = `Warning: You paid ₹${price}/${unit}, which is above the typical Indian market range of ₹${benchmark.typicalMin} - ₹${benchmark.typicalMax}. Check dealer MRP on the sack or buy via Cooperative/IFFCO.`;
        } else if (price < benchmark.typicalMin * 0.95) {
          status = 'great_deal';
          message = `Great price! You paid ₹${price}/${unit}, below average market rate of ₹${benchmark.typicalMin}. Ensure expiry date and seal integrity.`;
        } else {
          status = 'fair';
          message = `Fair market price. Normal range is ₹${benchmark.typicalMin} - ₹${benchmark.typicalMax}/${benchmark.unit}.`;
        }
      }

      return res.json({
        status,
        message,
        fairRange: benchmark ? `₹${benchmark.typicalMin} - ₹${benchmark.typicalMax}` : '₹ Varies by brand',
        savingsTips: 'Buy during pre-season cooperative booking or pool orders with neighboring farmers for 5-8% bulk discount.'
      });
    }

    const prompt = `Analyze this agricultural input purchase for an Indian farmer:
Item: "${itemName}"
Category: "${category}"
Unit: "${unit}"
Price Paid by Farmer: ₹${paidPrice} per ${unit}
Quantity: ${quantity}

Assess:
1. Is this price in Indian Rupees (₹) Fair, Overpriced, or a Great Deal based on current Indian market & government subsidized MRP norms?
2. Statutory or typical benchmark range in ₹.
3. 2 concise tips on where the farmer could get this item or its equivalent for a lower price (e.g. PACS, IFFCO Bazar, DBT dealer, state seed agency).
Respond in brief JSON format with keys:
{
  "verdict": "Fair" | "Overpriced" | "Great Deal",
  "fairRange": "₹X - ₹Y",
  "differencePercent": number,
  "explanation": "concise explanation",
  "cheaperAlternatives": "specific alternative tips"
}`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Price check error:', err);
    res.status(500).json({ error: 'Price check failed', details: err.message });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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
    console.log(`Kisan Farm Manager Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
