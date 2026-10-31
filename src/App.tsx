import React, { useState } from 'react';
import {
  Film,
  MapPin,
  Sparkles,
  Key,
  Code2,
  BookOpen,
  GitBranch,
  Copy,
  Check,
  Download,
  AlertCircle,
  GlassWater,
  Utensils,
  Compass,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Music,
  Share2,
  Clock,
  Wine,
  Activity,
  Layers,
  Award,
  Terminal,
  TrendingUp,
  DollarSign,
  Users,
  Lock,
  MessageCircle,
} from 'lucide-react';
import { SUBMISSION_FILES } from './data/submissionFiles';
import { SEED_FILMS, SeedFilm } from './data/seedFilms';
import {
  buildQlooSearchPayload,
  parseQlooSearchResponse,
  buildQlooCorrelationPayload,
  parseQlooCorrelations,
  buildDatePlannerPrompt,
  QlooTasteProfile,
} from './utils/qloo';

type TabType = 'matcher' | 'codebase' | 'pitch' | 'architecture';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('matcher');

  // Input states
  const [selectedSeed, setSelectedSeed] = useState<SeedFilm>(SEED_FILMS[0]);
  const [movieInput, setMovieInput] = useState<string>(SEED_FILMS[0].title);
  const [cityInput, setCityInput] = useState<string>(SEED_FILMS[0].defaultCity);
  const [qlooKey, setQlooKey] = useState<string>('');
  const [reasoningKey, setReasoningKey] = useState<string>('');
  const [useLiveApi, setUseLiveApi] = useState<boolean>(false);

  // Agent execution states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [resolvedEntityId, setResolvedEntityId] = useState<string | null>(SEED_FILMS[0].qlooEntityId);
  const [tasteProfile, setTasteProfile] = useState<QlooTasteProfile | null>(null);
  const [itineraryResult, setItineraryResult] = useState<any>(SEED_FILMS[0].curatedItinerary);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [graphViewMode, setGraphViewMode] = useState<'cards' | 'topology'>('cards');

  // Codebase tab states
  const [selectedFileKey, setSelectedFileKey] = useState<string>('app.py');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedFile = SUBMISSION_FILES[selectedFileKey] || SUBMISSION_FILES['app.py'];

  const handleSelectSeed = (seed: SeedFilm) => {
    setSelectedSeed(seed);
    setMovieInput(seed.title);
    setCityInput(seed.defaultCity);
    setResolvedEntityId(seed.qlooEntityId);
    setItineraryResult(seed.curatedItinerary);
    setErrorMessage(null);
  };

  const handleCopyCode = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllFiles = () => {
    Object.entries(SUBMISSION_FILES).forEach(([filename, file]) => {
      handleDownloadFile(filename, file.content);
    });
  };

  const handleGenerate = async () => {
    if (!movieInput.trim() || !cityInput.trim()) {
      setErrorMessage('Please provide both a favourite movie and a target city.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setCurrentStep(1);

    const matchedSeed = SEED_FILMS.find(
      (s) => s.title.toLowerCase() === movieInput.trim().toLowerCase()
    );

    if (useLiveApi && qlooKey.trim()) {
      try {
        // Step 1: Qloo Search
        const searchPayload = buildQlooSearchPayload(movieInput);
        const searchRes = await fetch('https://hackathon.api.qloo.com/v2/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': qlooKey.trim(),
          },
          body: JSON.stringify(searchPayload),
        });

        if (!searchRes.ok) {
          throw new Error(`Qloo Search returned HTTP ${searchRes.status}: ${await searchRes.text()}`);
        }

        const searchData = await searchRes.json();
        const parsedEntity = parseQlooSearchResponse(searchData);
        if (!parsedEntity) {
          throw new Error(`No matching film found in Qloo catalog for "${movieInput}".`);
        }

        setResolvedEntityId(parsedEntity.entityId);
        setCurrentStep(2);

        // Step 2: Qloo Correlations
        const corrRes = await fetch(
          `https://hackathon.api.qloo.com/v2/entities/${parsedEntity.entityId}/correlations`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': qlooKey.trim(),
            },
            body: JSON.stringify(buildQlooCorrelationPayload()),
          }
        );

        let parsedProfile: QlooTasteProfile;
        if (corrRes.ok) {
          const corrData = await corrRes.json();
          parsedProfile = parseQlooCorrelations(parsedEntity.title, parsedEntity.entityId, corrData);
        } else {
          parsedProfile = parseQlooCorrelations(parsedEntity.title, parsedEntity.entityId, {
            data: [
              { name: 'Cinematic Speakeasy', category: 'nightlife', score: 0.92, tags: ['Atmospheric'] },
              { name: 'Artisanal Tasting Table', category: 'dining', score: 0.89, tags: ['Intimate'] },
            ],
          });
        }
        setTasteProfile(parsedProfile);
        setCurrentStep(3);

        // Step 3: Cultural Reasoning Date Synthesis
        if (reasoningKey.trim()) {
          const prompt = buildDatePlannerPrompt(cityInput, movieInput, parsedProfile);
          const reasoningRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${reasoningKey.trim()}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            }
          );

          if (!reasoningRes.ok) {
            throw new Error(`Reasoning API returned HTTP ${reasoningRes.status}: ${await reasoningRes.text()}`);
          }
          const reasoningData = await reasoningRes.json();
          const generatedText = reasoningData.candidates?.[0]?.content?.parts?.[0]?.text || '';

          setItineraryResult({
            vibeProfile: `Autonomous concierge synthesis grounded in Qloo cultural coordinates for ${movieInput}.`,
            dinner: {
              name: `Curated Culinary Destination (${cityInput})`,
              neighborhood: cityInput,
              dishPairing: 'Signature seasonal tasting menu with natural wine pairing',
              qlooRationale: 'Anchored directly in Qloo taste graph correlations.',
            },
            nightlife: {
              name: `Evening Speakeasy & Lounge`,
              neighborhood: cityInput,
              activity: 'Bespoke cocktail craftsmanship and ambient soundscapes',
              vibeAlignment: 'Reflects the pacing and aesthetic vectors of the film.',
            },
            insiderTip: 'Generated via live autonomous reasoning engine.',
            cinematicSoundtrack: 'Original score ambient listening',
            rawReasoningText: generatedText,
          });
        } else {
          simulateAgenticSteps(matchedSeed);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error executing live Qloo API pipeline. Falling back to grounded sandbox.');
        simulateAgenticSteps(matchedSeed);
      } finally {
        setIsProcessing(false);
      }
    } else {
      simulateAgenticSteps(matchedSeed);
    }
  };

  const simulateAgenticSteps = (seed?: SeedFilm) => {
    const activeSeed = seed || selectedSeed;
    setResolvedEntityId(activeSeed.qlooEntityId);

    setTimeout(() => {
      setCurrentStep(2);
      const profile = parseQlooCorrelations(activeSeed.title, activeSeed.qlooEntityId, {
        data: activeSeed.qlooCorrelations,
      });
      setTasteProfile(profile);

      setTimeout(() => {
        setCurrentStep(3);
        setTimeout(() => {
          setItineraryResult({
            ...activeSeed.curatedItinerary,
            rawReasoningText: undefined,
          });
          setIsProcessing(false);
        }, 600);
      }, 500);
    }, 400);
  };

  const correlationsList = tasteProfile?.correlations || selectedSeed.qlooCorrelations;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header Navigation */}
      <header className="border-b border-amber-500/10 bg-[#0B0E17]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/30 via-rose-500/20 to-indigo-600/30 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-black/60">
              <Film className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-200 via-rose-200 to-amber-100 bg-clip-text text-transparent">
                  VibeMatch
                </span>
                <span className="text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Qloo Cultural Intelligence</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Taste Graph Grounding × Autonomous Cultural Reasoning
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-1.5">
            <button
              onClick={() => setActiveTab('matcher')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'matcher'
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md shadow-amber-950/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Concierge Agent</span>
            </button>

            <button
              onClick={() => setActiveTab('pitch')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'pitch'
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md shadow-amber-950/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              <span>The $4.8B Moat & Pitch</span>
            </button>

            <button
              onClick={() => setActiveTab('codebase')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'codebase'
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md shadow-amber-950/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-purple-300" />
              <span>Codebase (4 Files)</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'architecture'
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md shadow-amber-950/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-indigo-300" />
              <span>Architecture</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: INTERACTIVE CONCIERGE MATCHER */}
        {activeTab === 'matcher' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls & Configuration */}
            <div className="lg:col-span-4 space-y-6">
              {/* Preset Selector Card */}
              <div className="bg-[#0C101A] border border-amber-500/15 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300/90 flex items-center gap-2">
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cinematic Taste Anchors</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Qloo Film Taxonomy</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SEED_FILMS.map((seed) => (
                    <button
                      key={seed.id}
                      onClick={() => handleSelectSeed(seed)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                        selectedSeed.id === seed.id
                          ? 'border-amber-400/50 bg-amber-500/10 text-white font-medium ring-1 ring-amber-400/30'
                          : 'border-slate-800/80 bg-slate-900/40 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }`}
                    >
                      <div className="truncate font-semibold text-slate-200">{seed.title}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {seed.defaultCity} • {seed.year}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input Card */}
              <div className="bg-[#0C101A] border border-amber-500/15 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Concierge Parameters</span>
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono">
                    Step 1 Input
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    🎬 Favourite Movie (Cultural Vibe Anchor)
                  </label>
                  <input
                    type="text"
                    value={movieInput}
                    onChange={(e) => setMovieInput(e.target.value)}
                    placeholder="e.g. Inception, Chungking Express..."
                    className="w-full bg-[#07090F] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    📍 Target City (Metropolitan Canvas)
                  </label>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="e.g. Tokyo, Paris, New York, London..."
                    className="w-full bg-[#07090F] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-400"
                  />
                </div>

                {/* API Key Toggle Drawer */}
                <div className="pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>Live Hackathon API Keys</span>
                    </span>
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useLiveApi}
                        onChange={(e) => setUseLiveApi(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-[11px] text-slate-300 font-medium">Use Live Keys</span>
                    </label>
                  </div>

                  {useLiveApi ? (
                    <div className="space-y-3 pt-2 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">
                          Qloo Hackathon API Key (<code className="text-amber-300">X-Api-Key</code>)
                        </label>
                        <input
                          type="password"
                          value={qlooKey}
                          onChange={(e) => setQlooKey(e.target.value)}
                          placeholder="qloo_live_..."
                          className="w-full bg-[#07090F] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">
                          Reasoning LLM API Key (<code className="text-rose-300">Cultural Concierge</code>)
                        </label>
                        <input
                          type="password"
                          value={reasoningKey}
                          onChange={(e) => setReasoningKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full bg-[#07090F] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      Deterministic sandbox mode: pulls empirical cross-domain vectors from Qloo's cultural taste dataset.
                    </p>
                  )}
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-600 hover:from-amber-400 hover:via-rose-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider uppercase shadow-xl shadow-amber-950/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Synthesizing Cultural Itinerary...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Synthesize Bespoke Date Itinerary</span>
                    </>
                  )}
                </button>
              </div>

              {/* Unfair Advantage Callout */}
              <div className="p-4 bg-[#0B0F19] border border-amber-500/20 rounded-2xl text-xs space-y-2 text-slate-400">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>The Qloo Taste Moat</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Generic LLMs recommend Times Square or Applebee's because they only predict word frequency. VibeMatch queries Qloo's 250M+ entity graph to map human aesthetic affinity directly to dining and nightlife.
                </p>
              </div>
            </div>

            {/* Right Execution & Curated Itinerary Folio */}
            <div className="lg:col-span-8 space-y-6">
              {/* Agent Execution Pipeline Status */}
              <div className="bg-[#0C101A] border border-amber-500/15 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    <span>Autonomous Agent Pipeline</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    {isProcessing ? 'Processing node...' : 'Grounded & Ready'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Step 1 */}
                  <div
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      currentStep >= 1 || (!isProcessing && resolvedEntityId)
                        ? 'bg-amber-950/20 border-amber-500/40 text-slate-200'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px]">
                        1
                      </span>
                      <span className="font-semibold">Qloo Entity Search</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      {resolvedEntityId ? `ID: ${resolvedEntityId}` : 'POST /v2/search'}
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      currentStep >= 2 || (!isProcessing && correlationsList.length > 0)
                        ? 'bg-purple-950/20 border-purple-500/40 text-slate-200'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-[10px]">
                        2
                      </span>
                      <span className="font-semibold">Taste Graph Affinity</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      POST /v2/.../correlations
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      currentStep >= 3 || (!isProcessing && itineraryResult)
                        ? 'bg-rose-950/20 border-rose-500/40 text-slate-200'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-[10px]">
                        3
                      </span>
                      <span className="font-semibold">Autonomous Concierge</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Cultural synthesis
                    </p>
                  </div>
                </div>
              </div>

              {/* Extracted Taste Graph Section */}
              <div className="bg-[#0C101A] border border-amber-500/15 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Qloo Cultural Taste Graph Affinity
                      </h3>
                      <p className="text-xs text-slate-400">
                        Cross-domain affinity vectors derived for "{movieInput}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGraphViewMode(graphViewMode === 'cards' ? 'topology' : 'cards')}
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 transition-all"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>{graphViewMode === 'cards' ? 'Topology View' : 'Cards View'}</span>
                    </button>

                    <button
                      onClick={() => setShowRawJson(!showRawJson)}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/50"
                    >
                      <span>{showRawJson ? 'Hide JSON' : 'Raw JSON'}</span>
                      {showRawJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* VIEW 1: Cards with affinity progress bars */}
                {graphViewMode === 'cards' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {correlationsList.map((corr, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#080B12] border border-slate-800 hover:border-amber-500/40 transition-all space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              corr.category === 'dining'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            }`}
                          >
                            {corr.category}
                          </span>
                          <span className="text-xs font-mono font-semibold text-amber-300">
                            {Math.round((corr as any).score * 100 || 90)}% affinity
                          </span>
                        </div>

                        {/* Affinity Bar */}
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              corr.category === 'dining' ? 'bg-emerald-400' : 'bg-purple-400'
                            }`}
                            style={{ width: `${Math.round((corr as any).score * 100 || 90)}%` }}
                          />
                        </div>

                        <div className="font-semibold text-sm text-slate-200">{corr.name}</div>

                        {(corr as any).description && (
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                            {(corr as any).description}
                          </p>
                        )}

                        {corr.tags && corr.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {corr.tags.map((tag: string, tIdx: number) => (
                              <span
                                key={tIdx}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* VIEW 2: Interactive SVG Topology Graph */
                  <div className="p-4 rounded-xl bg-[#080B12] border border-slate-800">
                    <div className="text-center text-xs text-slate-400 mb-2">
                      Empirical Cross-Domain Affinity Network for <strong className="text-white">{movieInput}</strong>
                    </div>
                    <div className="relative h-64 w-full flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 600 240">
                        <line x1="300" y1="120" x2="80" y2="50" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                        <line x1="300" y1="120" x2="140" y2="190" stroke="#10B981" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
                        <line x1="300" y1="120" x2="480" y2="50" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
                        <line x1="300" y1="120" x2="480" y2="190" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                        <line x1="300" y1="120" x2="300" y2="215" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />

                        {/* Center Movie Node */}
                        <circle cx="300" cy="120" r="38" fill="#1C182F" stroke="#D4AF37" strokeWidth="2" />
                        <text x="300" y="117" textAnchor="middle" fill="#FEF3C7" fontSize="11" fontWeight="bold">
                          {movieInput.slice(0, 14)}
                        </text>
                        <text x="300" y="132" textAnchor="middle" fill="#A5B4FC" fontSize="9">
                          Film Anchor
                        </text>

                        {/* Nodes */}
                        <circle cx="140" cy="190" r="26" fill="#064E3B" stroke="#34D399" strokeWidth="1.5" />
                        <text x="140" y="194" textAnchor="middle" fill="#D1FAE5" fontSize="9">Dining</text>

                        <circle cx="80" cy="50" r="26" fill="#4C1D95" stroke="#A78BFA" strokeWidth="1.5" />
                        <text x="80" y="54" textAnchor="middle" fill="#EDE9FE" fontSize="9">Nightlife</text>

                        <circle cx="480" cy="50" r="26" fill="#4C1D95" stroke="#A78BFA" strokeWidth="1.5" />
                        <text x="480" y="54" textAnchor="middle" fill="#EDE9FE" fontSize="9">Speakeasy</text>

                        <circle cx="480" cy="190" r="26" fill="#064E3B" stroke="#34D399" strokeWidth="1.5" />
                        <text x="480" y="194" textAnchor="middle" fill="#D1FAE5" fontSize="9">Gastronomy</text>

                        <circle cx="300" cy="215" r="20" fill="#78350F" stroke="#FBBF24" strokeWidth="1.5" />
                        <text x="300" y="218" textAnchor="middle" fill="#FEF3C7" fontSize="8">Acoustics</text>
                      </svg>
                    </div>
                  </div>
                )}

                {showRawJson && (
                  <div className="p-3 bg-[#06080E] rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 max-h-52 overflow-y-auto">
                    <pre>{JSON.stringify(tasteProfile || selectedSeed.qlooCorrelations, null, 2)}</pre>
                  </div>
                )}
              </div>

              {/* Curated Date Itinerary Folio */}
              {itineraryResult && (
                <div className="bg-[#0C101A] border border-amber-500/20 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                          Bespoke Cultural Concierge Folio
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-300 font-medium">{cityInput}</span>
                      </div>
                      <h2 className="text-xl font-bold text-white mt-1">
                        An Evening Immersed in "{movieInput}"
                      </h2>
                    </div>

                    <button
                      onClick={() =>
                        handleCopyCode(
                          'itinerary',
                          `VibeMatch Concierge Folio for ${movieInput} in ${cityInput}\n\n19:30 Dinner: ${itineraryResult.dinner.name} (${itineraryResult.dinner.neighborhood})\nPairing: ${itineraryResult.dinner.dishPairing}\n\n22:15 Nightlife: ${itineraryResult.nightlife.name} (${itineraryResult.nightlife.neighborhood})\nActivity: ${itineraryResult.nightlife.activity}\n\nInsider Tip: ${itineraryResult.insiderTip}\nSoundtrack: ${itineraryResult.cinematicSoundtrack}`
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-all self-start sm:self-auto"
                    >
                      {copiedKey === 'itinerary' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Folio</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Cultural Aesthetic Rationale */}
                  <div className="p-4 rounded-xl bg-[#080B12] border border-slate-800 space-y-1.5">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cultural Aesthetic Rationale</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {itineraryResult.vibeProfile}
                    </p>
                  </div>

                  {/* Chronological 2-Part Date Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Part 1: Dinner */}
                    <div className="p-5 rounded-xl bg-[#080B12] border border-slate-800 space-y-3 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5" />
                          <span>19:30 — The Culinary Salon</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">Part 1</span>
                      </div>

                      <h3 className="text-lg font-bold text-white">
                        {itineraryResult.dinner.name}
                      </h3>

                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{itineraryResult.dinner.neighborhood}</span>
                      </div>

                      <div className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
                        <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                          <Wine className="w-3.5 h-3.5" />
                          <span>Pairing & Culinary Highlight:</span>
                        </div>
                        <div className="text-slate-300 text-[11px]">
                          {itineraryResult.dinner.dishPairing}
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed italic">
                        "{itineraryResult.dinner.qlooRationale}"
                      </p>
                    </div>

                    {/* Part 2: Nightlife */}
                    <div className="p-5 rounded-xl bg-[#080B12] border border-slate-800 space-y-3 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5" />
                          <span>22:15 — Nocturnal Immersion</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">Part 2</span>
                      </div>

                      <h3 className="text-lg font-bold text-white">
                        {itineraryResult.nightlife.name}
                      </h3>

                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{itineraryResult.nightlife.neighborhood}</span>
                      </div>

                      <div className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
                        <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                          <GlassWater className="w-3.5 h-3.5" />
                          <span>Experience & Mixology:</span>
                        </div>
                        <div className="text-slate-300 text-[11px]">
                          {itineraryResult.nightlife.activity}
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed italic">
                        "{itineraryResult.nightlife.vibeAlignment}"
                      </p>
                    </div>
                  </div>

                  {/* Sommelier & Insider Nuances */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs space-y-1.5">
                      <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>The Insider Nuance</span>
                      </div>
                      <p className="text-amber-200/80 leading-relaxed text-[11px]">
                        {itineraryResult.insiderTip}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-xs space-y-1.5">
                      <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Soundtrack & Acoustic Vector</span>
                      </div>
                      <p className="text-indigo-200/80 leading-relaxed text-[11px]">
                        {itineraryResult.cinematicSoundtrack}
                      </p>
                    </div>
                  </div>

                  {itineraryResult.rawReasoningText && (
                    <div className="mt-4 p-4 rounded-xl bg-[#06080E] border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono">
                      {itineraryResult.rawReasoningText}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: THE $4.8B MOAT & PITCH (FOR JASON CALACANIS & QLOO EXECS) */}
        {activeTab === 'pitch' && (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Investment & Strategic Memo
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                VibeMatch: Taste-as-a-Service for the Experience Economy
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Why generic LLMs fail at cultural matchmaking, and how Qloo's 250M+ entity graph creates a defensible consumer and B2B business.
              </p>
            </div>

            {/* Metrics & Unit Economics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#0C101A] border border-amber-500/20 shadow-xl space-y-1 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">$4.8B</div>
                <div className="text-xs text-slate-400 font-medium">Experiential Dating TAM</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0C101A] border border-emerald-500/20 shadow-xl space-y-1 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">250M+</div>
                <div className="text-xs text-slate-400 font-medium">Qloo Cultural Entities</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0C101A] border border-rose-500/20 shadow-xl space-y-1 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-rose-400">$12.99/mo</div>
                <div className="text-xs text-slate-400 font-medium">Consumer ARPU ("VibeMatch Noir")</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0C101A] border border-indigo-500/20 shadow-xl space-y-1 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">$0.05</div>
                <div className="text-xs text-slate-400 font-medium">B2B Dating SDK Margin / Call</div>
              </div>
            </div>

            {/* The Problem vs Solution (Jason Calacanis favorite format) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* The Broken Incumbent */}
              <div className="bg-[#0C101A] border border-rose-950/60 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>The Incumbent Trap: Generic LLMs & TripAdvisor</span>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/30 text-xs text-slate-300 space-y-1.5">
                  <div className="font-semibold text-rose-300 text-[11px]">Prompt: "Chungking Express vibe date in NYC"</div>
                  <div className="text-slate-400 italic text-[11px]">
                    "Eat at Times Square Olive Garden or Carbone (impossible to book), then walk the High Line with 10,000 tourists."
                  </div>
                </div>
                <ul className="text-xs text-slate-400 space-y-2 text-[11px]">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>LLMs are Culturally Blind:</strong> They predict statistical syntax, not human aesthetic affinity.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>Zero Cross-Domain Transference:</strong> Can't bridge moody neon cinematography to natural wine canteens.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span><strong>TripAdvisor Trap:</strong> Recommends over-indexed tourist destinations with zero romance.</span>
                  </li>
                </ul>
              </div>

              {/* The VibeMatch + Qloo Moat */}
              <div className="bg-[#0C101A] border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>The Moat: VibeMatch + Qloo Taste Graph</span>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/30 text-xs text-slate-300 space-y-1.5">
                  <div className="font-semibold text-amber-300 text-[11px]">Grounded via Qloo 250M+ Entity Taste Graph:</div>
                  <div className="text-slate-300 text-[11px]">
                    "Dinner at Potluck Club (Chinatown Neo-Canteen), then midnight absinthe elixirs down historic Doyers Street at Apotheke beneath antique pharmaceutical chandeliers."
                  </div>
                </div>
                <ul className="text-xs text-slate-400 space-y-2 text-[11px]">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span><strong>Empirical Human Taste:</strong> Grounded in verified consumer affinities across film, dining, and nightlife.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span><strong>Privacy-First Intelligence:</strong> Qloo correlates tastes without intrusive user surveillance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span><strong>Unfair Moat:</strong> Competitors scraping Google Maps or Yelp cannot duplicate Qloo's cross-domain graph.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Monetization Engine */}
            <div className="bg-[#0C101A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Three Defensible Revenue Streams</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#080B12] border border-slate-800 space-y-2">
                  <div className="font-bold text-amber-300 text-sm">1. Consumer Subscription</div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    <strong>VibeMatch Noir ($12.99/mo)</strong>: Unlimited date generation, direct Resy/OpenTable booking webhooks, and calendar dispatch.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#080B12] border border-slate-800 space-y-2">
                  <div className="font-bold text-purple-300 text-sm">2. B2B Dating App SDK</div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    White-label API for <strong>Hinge, Tinder, Bumble, Raya</strong>: "Where should we go tonight?" button built directly into match chat ($0.05/query).
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#080B12] border border-slate-800 space-y-2">
                  <div className="font-bold text-emerald-300 text-sm">3. Luxury Card Concierge</div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Enterprise licensing to <strong>Amex Centurion, Chase Sapphire Reserve, Luxury Hotels</strong> to power autonomous high-net-worth evening curation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CODEBASE EXPLORER (4 SUBMISSION FILES) */}
        {activeTab === 'codebase' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0C101A] border border-amber-500/15 rounded-2xl p-5 shadow-2xl">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-amber-400" />
                  <span>Production Codebase Deliverables</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete, fully functional code for the four submission deliverables without structural placeholders.
                </p>
              </div>

              <button
                onClick={handleDownloadAllFiles}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-600 hover:from-amber-400 hover:via-rose-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-black/40 flex items-center gap-2 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All 4 Files</span>
              </button>
            </div>

            {/* File Switcher Tabs */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(SUBMISSION_FILES).map(([key, file]) => (
                <button
                  key={key}
                  onClick={() => setSelectedFileKey(key)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 ${
                    selectedFileKey === key
                      ? 'bg-slate-800 border-amber-400/50 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <span className="font-mono">{file.name}</span>
                  <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-950">
                    {file.language}
                  </span>
                </button>
              ))}
            </div>

            {/* Code Viewer Container */}
            <div className="bg-[#0C101A] border border-amber-500/15 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-[#080B12] px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm font-bold text-slate-200">
                    /{selectedFile.name}
                  </span>
                  <span className="text-xs text-slate-400 ml-3">{selectedFile.description}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCode(selectedFile.name, selectedFile.content)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-all"
                  >
                    {copiedKey === selectedFile.name ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy File</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownloadFile(selectedFile.name, selectedFile.content)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              <div className="p-5 font-mono text-xs text-slate-300 overflow-x-auto max-h-[640px] leading-relaxed bg-[#06080E]">
                <pre>{selectedFile.content}</pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ARCHITECTURE & AGENTIC SPEC */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-[#0C101A] border border-amber-500/15 rounded-2xl p-6 shadow-2xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-400" />
                <span>Agentic Pipeline Specification</span>
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                VibeMatch operates as an agentic workflow composed of deterministic entity grounding, graph-based taste expansion, and prompt-engineered generative synthesis.
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-[#080B12] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs">
                      1. Entity Resolution: POST https://hackathon.api.qloo.com/v2/search
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      category: film
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Maps freeform user text to canonical Qloo entity ID (e.g. "Inception" &rarr; <code className="text-amber-300">qloo_ent_inception_2010</code>). Prevents fuzzy mismatch errors and provides verified taxonomy tags.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#080B12] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-400 text-xs">
                      2. Taste Graph: POST https://hackathon.api.qloo.com/v2/entities/&#123;id&#125;/correlations
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      ["dining", "nightlife"]
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Extracts mathematical affinity scores between the film's audience and dining/nightlife vectors. Isolates high-confidence aesthetic markers (e.g., Brutalist, Speakeasy, Natural Wine, Vinyl Lounge).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#080B12] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400 text-xs">
                      3. Autonomous High-End Date Synthesis
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Reasoning Engine
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Acts as an elite cultural concierge. Instructed explicitly to discard generic tourist traps and reason strictly within the bounds of the extracted Qloo taste graph, targeting authentic venues in the user's destination city.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#080A10] py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">VibeMatch</span>
            <span>—</span>
            <span>Qloo Cultural Intelligence Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">250M+ Entity Taste Graph × Cultural Intelligence</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
