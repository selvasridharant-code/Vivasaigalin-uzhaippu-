export type AgriCategory = 'fertilizer' | 'pesticide' | 'seed' | 'soil';

export interface PurchaseItem {
  id: string;
  date: string; // YYYY-MM-DD
  itemName: string;
  tamilName?: string; // Tamil product name (e.g. "யூரியா (Urea)", "டி.ஏ.பி")
  category: AgriCategory;
  brand: string;
  dealerName: string;
  dealerUpiId?: string; // e.g. "krishisevakendra@upi", "9842100000@okaxis"
  quantity: number;
  unit: string; // 'kg', '50kg bag', '45kg bag', 'litre', '500ml bottle', 'quintal', 'tractor trolley'
  unitPriceINR: number; // ₹ per unit
  totalCostINR: number; // ₹ total
  isSubsidized?: boolean;
  mrpPrintedINR?: number;
  invoiceNumber?: string;
  remainingQuantity: number;
  notes?: string;
  priceVerdict?: 'Great Deal' | 'Fair Price' | 'Overpriced';
  priceBenchmarkNote?: string;
  // UPI Payment Integration
  paymentStatus?: 'paid' | 'pending';
  paymentMethod?: 'GPay' | 'PhonePe' | 'Paytm' | 'BHIM' | 'Cash' | 'Credit';
  upiRefId?: string;
  paidAt?: string;
}

export interface UsageSchedule {
  id: string;
  purchaseItemId?: string;
  itemName: string;
  tamilName?: string;
  category: AgriCategory;
  plotName: string; // e.g. "North Field (Plot A)"
  plotSizeAcres: number;
  cropName: string; // e.g. "Paddy / நெல்", "Wheat", "Cotton"
  cropStage: string; // "Basal / நில தயாரிப்பு", "Sowing / விதைப்பு", "Vegetative / தூர் கட்டும் பருவம்", "Flowering / பூக்கும் பருவம்"
  plannedDate: string; // YYYY-MM-DD
  plannedDosagePerAcre: string; // e.g. "25 kg/acre" or "2 ml/litre water"
  totalQuantity: number;
  unit: string;
  applicationMethod: 'Soil Broadcast' | 'Foliar Spray' | 'Drip Fertigation' | 'Seed Treatment' | 'Basal Placement' | 'Soil Mixing';
  status: 'scheduled' | 'completed' | 'skipped';
  completedDate?: string;
  notes?: string;
  costINR?: number; // Estimated proportional cost of this application
  safetyPrecaution?: string;
}

export interface FarmPlot {
  id: string;
  name: string;
  sizeAcres: number;
  currentCrop: string;
  soilType: string;
}

export interface FarmProfile {
  farmerName: string;
  farmName: string;
  villageState: string;
  totalLandAcres: number;
  plots: FarmPlot[];
  defaultUpiId?: string;
}

export interface PriceBenchmark {
  name: string;
  tamilName: string;
  unit: string;
  typicalMin: number;
  typicalMax: number;
  govtSubsidyCeiling?: number;
  note: string;
}
