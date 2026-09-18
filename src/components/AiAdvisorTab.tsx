import React, { useState } from 'react';
import { Sparkles, Send, Bot, Lightbulb, Wheat, AlertCircle, RefreshCw, CheckCircle2, IndianRupee } from 'lucide-react';
import { FarmProfile } from '../types';

interface AiAdvisorTabProps {
  farmProfile: FarmProfile;
  initialQuery?: string;
}

export const AiAdvisorTab: React.FC<AiAdvisorTabProps> = ({
  farmProfile,
  initialQuery = '',
}) => {
  const [selectedCrop, setSelectedCrop] = useState('நெல் / Paddy (ADT 53 / CR 1009)');
  const [landAcres, setLandAcres] = useState(farmProfile.totalLandAcres.toString());
  const [query, setQuery] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [advisorResponse, setAdvisorResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const QUICK_QUESTIONS = [
    'நானோ யூரியா மற்றும் உயிர் உரம் பயன்படுத்தி உரச்செலவை 30% குறைப்பது எப்படி?',
    'காய்கறி பயிர்களில் சாறு உறிஞ்சும் பூச்சிகளுக்கு குறைந்த விலையில் இயற்கை பூச்சிக்கொல்லி என்ன?',
    'அரசு மானிய விலையில் விதைகள் மற்றும் உரங்களை வாங்குவது எப்படி?',
    'களர் மற்றும் உவர் நிலத்தை குறைந்த செலவில் சரிசெய்யும் ஜிப்சம் மற்றும் தொழுஉர அட்டவணை என்ன?',
    'மழைக்காலத்தில் யூரியா & டிஏபி சத்துக்கள் வீணாகாமல் இருக்க எந்த பருவத்தில் இடவேண்டும்?'
  ];

  const handleAskAdvisor = async (customText?: string) => {
    const textToAsk = customText || query;
    if (!textToAsk.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: selectedCrop,
          landSize: landAcres,
          acreUnit: 'Acres',
          query: textToAsk,
          category: 'Fertilizer, Pesticides, Seeds & Soil',
        }),
      });

      const data = await res.json();
      if (data.advice) {
        setAdvisorResponse(data.advice);
      } else if (data.fallbackAdvice) {
        setAdvisorResponse(data.fallbackAdvice);
      } else {
        throw new Error(data.error || 'Failed to get advisory');
      }
    } catch (err: any) {
      console.error('Advisor fetch error:', err);
      setError('Could not reach the Kisan AI server. Showing standard recommendations below.');
      setAdvisorResponse(`### 🌾 விவசாயிகளின் உழைப்பு • குறைந்த விலை வழிகாட்டி (Indian Rupees ₹)
1. **மண் பரிசோதனை அவசியம் (Soil Health Card)**:
   - மண் பரிசோதனை செய்யாமல் கண்மூடித்தனமாக டிஏபி (DAP) வாங்க வேண்டாம். அருகிலுள்ள வட்டார வேளாண்மை விரிவாக்க மையம் அல்லது KVK-ல் குறைந்த கட்டணத்தில் (₹30) பரிசோதிக்கலாம். அளவுக்கு அதிகமான டிஏபி ஜிங்க் சத்தை முடக்கி ₹1,350 வீணடிக்கும்.
2. **நானோ யூரியா பயன்பாடு (Nano Urea Liquid)**:
   - ஒரு 500 மி.லி நானோ யூரியா பாட்டில் விலை வெறும் **₹225** மட்டுமே! இது 45 கிலோ மூட்டை யூரியாவிற்கு இணையானது, இலைவழி தெளிப்பதால் 80% மேல் பயிரால் கிரகிக்கப்படுகிறது.
3. **இயற்கை பூச்சி விரட்டி (Neem Oil & Bio-control)**:
   - அதிக விலை கொண்ட ரசாயன பூச்சிக்கொல்லிகளுக்கு மாற்றாக வேப்பெண்ணெய் 10,000 PPM (சுமார் **₹450/லி**) ஆரம்ப கட்டத்திலேயே பயன்படுத்தலாம்.
4. **அரசு மானிய விதைகள் (Certified Seeds)**:
   - தமிழ்நாடு மாநில விதை மேம்பாட்டு முகமை அல்லது தேசிய விதை கழகம் (NSC) மூலம் 50% அரசு மானிய விலையில் தரமான விதைகளைப் பெறலாம்.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-tamil">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-2 border-emerald-500/20">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-amber-400 text-emerald-950 rounded-2xl shadow-md shrink-0">
            <Bot className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/90 text-amber-300 text-xs font-bold mb-2 border border-emerald-600/50">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>விவசாயிகளின் உழைப்பு • AI வேளாண் ஆலோசகர்</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              குறைந்த விலையில் இடுபொருட்கள் & பயன்பாட்டு அட்டவணை ஆலோசனை
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed font-medium">
              உரங்கள், பூச்சிக்கொல்லிகள், விதைகள் மற்றும் மண் மேம்பாட்டுப் பொருட்களை இந்திய ரூபாய் (₹) மதிப்பீட்டில் குறைந்த விலையில் வாங்குவது மற்றும் செலவை மிச்சப்படுத்தும் அட்டவணை முறைகளை அறிந்து கொள்ளுங்கள்.
            </p>
          </div>
        </div>
      </div>

      {/* Farm Context Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-900/10 shadow-md flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-stone-700">பயிர் விபரம்:</span>
          <select
            id="advisor-select-crop"
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-1.5 bg-emerald-50/70 border border-emerald-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="நெல் / Paddy (ADT 53 / CR 1009)">நெல் (Paddy / Rice)</option>
            <option value="கரும்பு / Sugarcane">கரும்பு (Sugarcane)</option>
            <option value="பருத்தி / Bt Cotton">பருத்தி (Cotton)</option>
            <option value="மக்காச்சோளம் / Maize">மக்காச்சோளம் (Maize / Corn)</option>
            <option value="உளுந்து / பாசிப்பயறு (Pulses)">பயறு வகைகள் (Blackgram / Greengram)</option>
            <option value="வாழை / Banana">வாழை (Banana)</option>
            <option value="காய்கறிகள் (தக்காளி, மிளகாய், வெங்காயம்)">காய்கறிகள் (Tomato, Chili, Onion)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-extrabold text-stone-700">நிலப் பரப்பு:</span>
          <div className="flex items-center gap-1">
            <input
              id="advisor-input-acres"
              type="number"
              value={landAcres}
              onChange={(e) => setLandAcres(e.target.value)}
              className="w-16 px-2.5 py-1.5 bg-emerald-50/70 border border-emerald-300 rounded-xl font-extrabold text-stone-900 text-center focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <span className="text-stone-700 font-bold">ஏக்கர் (Acres)</span>
          </div>
        </div>

        <div className="ml-auto text-stone-600 hidden sm:block font-medium">
          கிராமம்: <strong className="text-emerald-950 font-bold">{farmProfile.villageState}</strong>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-2.5">
        <span className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" /> செலவு மிச்சப்படுத்தும் விரைவு கேள்விகள்:
        </span>
        <div className="flex flex-wrap gap-2.5">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(q);
                handleAskAdvisor(q);
              }}
              className="text-left text-xs bg-white hover:bg-emerald-50 text-stone-800 hover:text-emerald-950 px-3.5 py-2.5 rounded-2xl border-2 border-emerald-900/10 hover:border-emerald-600 shadow-sm transition-all cursor-pointer font-bold leading-relaxed"
            >
              🌾 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Query Input Form */}
      <div className="bg-white rounded-3xl p-5 border-2 border-emerald-900/10 shadow-lg space-y-3">
        <label className="block text-xs font-extrabold text-stone-800">
          குறைந்த விலையில் பொருட்கள் வாங்குதல் அல்லது இடும் அட்டவணை பற்றிய உங்கள் கேள்வி:
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <textarea
            id="advisor-query-textarea"
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="எடுத்துக்காட்டு: டிஏபி மூட்டை ₹1,350க்கு பதில் குறைந்த விலையில் மாற்று உரம் என்ன? பூச்சி மருந்து செலவை குறைப்பது எப்படி?"
            className="flex-1 p-3.5 text-xs sm:text-sm bg-emerald-50/40 border border-emerald-200 rounded-2xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none font-medium"
          />
          <button
            id="advisor-btn-submit"
            onClick={() => handleAskAdvisor()}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-amber-300 rounded-2xl font-black text-xs sm:text-sm flex sm:flex-col items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-amber-300" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>கேட்கவும் (Ask)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Response Display Box */}
      {advisorResponse && (
        <div id="advisor-response-box" className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-600 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b-2 border-emerald-100 pb-3.5">
            <div className="flex items-center gap-2.5 text-emerald-950 font-black text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>விவசாயிகளின் உழைப்பு • உழவர் வழிகாட்டுதல் & பரிந்துரை</span>
            </div>
            <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
              நாணயம்: இந்திய ரூபாய் (₹ INR)
            </span>
          </div>

          <div className="prose prose-sm max-w-none text-stone-800 text-xs sm:text-sm leading-relaxed space-y-3 font-medium">
            {advisorResponse.split('\n\n').map((paragraph, i) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={i} className="text-base font-extrabold text-emerald-950 mt-4 first:mt-0 border-b border-emerald-100 pb-1">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ') || paragraph.startsWith('4. ')) {
                return (
                  <div key={i} className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200 my-2">
                    <p className="font-bold text-emerald-950 whitespace-pre-line">{paragraph}</p>
                  </div>
                );
              }
              return (
                <p key={i} className="whitespace-pre-line">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
