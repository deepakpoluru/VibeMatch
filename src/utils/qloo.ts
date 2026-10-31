/**
 * Pure logic and utility functions for Qloo cultural intelligence and agentic prompt engineering.
 */

export interface QlooEntity {
  id: string;
  name: string;
  category?: string;
  subtype?: string;
  popularity?: number;
  tags?: string[];
}

export interface QlooCorrelationItem {
  id: string;
  name: string;
  category: 'dining' | 'nightlife' | string;
  affinity_score: number;
  description?: string;
  tags?: string[];
  subcategories?: string[];
}

export interface QlooTasteProfile {
  movieId: string;
  movieTitle: string;
  correlations: QlooCorrelationItem[];
  dominantAesthetics: string[];
  vibeSummary: string;
}

export function buildQlooSearchPayload(movieName: string) {
  return {
    query: movieName.trim(),
    category: 'film',
  };
}

export function parseQlooSearchResponse(responseBody: any): { entityId: string; title: string } | null {
  if (!responseBody) return null;

  // Qloo API responses may have { data: [...] } or { results: [...] } or direct array
  const items = Array.isArray(responseBody)
    ? responseBody
    : responseBody.data || responseBody.results || responseBody.entities || [];

  if (!items || items.length === 0) {
    // If the object itself has an id and name
    if (responseBody.id && (responseBody.name || responseBody.title)) {
      return {
        entityId: String(responseBody.id),
        title: String(responseBody.name || responseBody.title),
      };
    }
    return null;
  }

  const primary = items[0];
  const entityId = primary.id || primary.entity_id || primary._id;
  const title = primary.name || primary.title || primary.entity_name || 'Selected Film';

  if (!entityId) return null;
  return {
    entityId: String(entityId),
    title: String(title),
  };
}

export function buildQlooCorrelationPayload(targetCategories = ['dining', 'nightlife'], limit = 5) {
  return {
    target_categories: targetCategories,
    limit: limit,
  };
}

export function parseQlooCorrelations(movieTitle: string, movieId: string, responseBody: any): QlooTasteProfile {
  const items = Array.isArray(responseBody)
    ? responseBody
    : responseBody?.data || responseBody?.results || responseBody?.correlations || [];

  const correlations: QlooCorrelationItem[] = [];
  const tagSet = new Set<string>();

  for (const item of items) {
    const name = item.name || item.title || item.entity_name || 'Cultural Anchor';
    const id = item.id || item.entity_id || String(Math.random());
    const category = item.category || (item.target_category as string) || 'dining';
    const affinity_score = typeof item.score === 'number'
      ? item.score
      : typeof item.affinity === 'number'
      ? item.affinity
      : typeof item.affinity_score === 'number'
      ? item.affinity_score
      : 0.85;

    const tags = Array.isArray(item.tags)
      ? item.tags
      : Array.isArray(item.genres)
      ? item.genres
      : [];

    tags.forEach((t: string) => tagSet.add(t));

    correlations.push({
      id,
      name,
      category,
      affinity_score: Number(affinity_score.toFixed(3)),
      description: item.description || item.snippet || undefined,
      tags,
    });
  }

  // Derive dominant aesthetic keywords
  const aesthetics = Array.from(tagSet).slice(0, 6);
  if (aesthetics.length === 0) {
    aesthetics.push('Cinematic Ambience', 'Curated Taste', 'Artisanal Character', 'Underground Elegance');
  }

  const diningCount = correlations.filter((c) => c.category === 'dining').length;
  const nightlifeCount = correlations.filter((c) => c.category === 'nightlife').length;

  const vibeSummary = `Empirically grounded taste profile derived from "${movieTitle}" across ${diningCount} dining and ${nightlifeCount} nightlife cultural signals.`;

  return {
    movieId,
    movieTitle,
    correlations,
    dominantAesthetics: aesthetics,
    vibeSummary,
  };
}

export function buildDatePlannerPrompt(
  city: string,
  movie: string,
  tasteProfile: QlooTasteProfile
): string {
  const correlationBulletPoints = tasteProfile.correlations.length > 0
    ? tasteProfile.correlations
        .map(
          (c) =>
            `- [${c.category.toUpperCase()}] ${c.name} (Affinity Score: ${c.affinity_score}${
              c.tags && c.tags.length > 0 ? ` | Tags: ${c.tags.join(', ')}` : ''
            })`
        )
        .join('\n')
    : '- High aesthetic alignment with film cinematography, refined pacing, and mood.';

  return `You are a world-class luxury date concierge and cultural curator specializing in translating cinematic sensibilities into unforgettable real-world evenings.

CONTEXT & GROUND TRUTH:
The user's favorite movie is "${movie}".
Target City: "${city}".

CRITICAL TASTE GRAPH GROUNDING (from Qloo's 250M+ entity cultural graph):
Generic AI models hallucinate touristy, cliché spots (e.g. Times Square or TripAdvisor Top 10). Instead, you MUST anchor your plan in the empirical cultural taste profile extracted from Qloo below:
${correlationBulletPoints}

Aesthetic Pillars:
${tasteProfile.dominantAesthetics.join(', ')}

YOUR MISSION:
Design a highly specific, curated 2-part date itinerary in ${city} that perfectly mirrors the cinematic soul, pacing, and cultural aesthetic of "${movie}".

OUTPUT FORMAT REQUIREMENTS:
Generate a structured, elegant response with:
1. 🎬 THE CULTURAL VIBE PROFILE:
   - A 2-sentence breakdown of why this film correlates with specific culinary and nocturnal sensibilities.
2. 🍽️ PART 1: THE DINING EXPERIENCE (Exact Restaurant Name & Neighborhood in ${city}):
   - Specific restaurant recommendation, the exact dish/cocktail pairing, and why the ambiance connects with the Qloo taste profile.
3. 🍸 PART 2: THE EVENING ACTIVITY OR NIGHTLIFE (Exact Venue Name & Neighborhood in ${city}):
   - Specific activity, bar, speakeasy, or cultural venue to visit afterwards.
4. ✨ THE PRO-TIP:
   - One insider tip (e.g., specific table to ask for, reservation timing, dress code nuance, or a movie-themed conversation starter).

Make all venue recommendations real, reputable, and currently operating in ${city}.`;
}

