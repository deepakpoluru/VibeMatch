import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQlooSearchPayload,
  parseQlooSearchResponse,
  buildQlooCorrelationPayload,
  parseQlooCorrelations,
  buildDatePlannerPrompt,
} from './qloo';

test('buildQlooSearchPayload produces valid search query', () => {
  const payload = buildQlooSearchPayload('  Inception  ');
  assert.equal(payload.query, 'Inception');
  assert.equal(payload.category, 'film');
});

test('parseQlooSearchResponse extracts entityId from response formats', () => {
  // Format 1: data array
  const format1 = {
    data: [
      { id: 'film_12345', name: 'Inception', category: 'film' },
      { id: 'film_99999', name: 'Inception 2', category: 'film' },
    ],
  };
  const res1 = parseQlooSearchResponse(format1);
  assert.ok(res1);
  assert.equal(res1.entityId, 'film_12345');
  assert.equal(res1.title, 'Inception');

  // Format 2: results array
  const format2 = {
    results: [{ entity_id: 'qloo_blade_runner', entity_name: 'Blade Runner 2049' }],
  };
  const res2 = parseQlooSearchResponse(format2);
  assert.ok(res2);
  assert.equal(res2.entityId, 'qloo_blade_runner');
  assert.equal(res2.title, 'Blade Runner 2049');

  // Format 3: empty
  assert.equal(parseQlooSearchResponse({ data: [] }), null);
  assert.equal(parseQlooSearchResponse(null), null);
});

test('buildQlooCorrelationPayload defaults to dining and nightlife with limit 5', () => {
  const payload = buildQlooCorrelationPayload();
  assert.deepEqual(payload.target_categories, ['dining', 'nightlife']);
  assert.equal(payload.limit, 5);
});

test('parseQlooCorrelations correctly parses cultural anchors and tags', () => {
  const mockResponse = {
    data: [
      {
        id: 'venue_1',
        name: 'Neo Bistro Tokyo',
        category: 'dining',
        score: 0.94,
        tags: ['Minimalist', 'Omakase', 'Modernist'],
      },
      {
        id: 'venue_2',
        name: 'Bar High Five',
        category: 'nightlife',
        score: 0.89,
        tags: ['Speakeasy', 'Jazz', 'Craft Cocktails'],
      },
    ],
  };

  const profile = parseQlooCorrelations('Lost in Translation', 'lit_101', mockResponse);
  assert.equal(profile.movieId, 'lit_101');
  assert.equal(profile.movieTitle, 'Lost in Translation');
  assert.equal(profile.correlations.length, 2);
  assert.equal(profile.correlations[0].name, 'Neo Bistro Tokyo');
  assert.equal(profile.correlations[0].category, 'dining');
  assert.equal(profile.correlations[0].affinity_score, 0.94);
  assert.ok(profile.dominantAesthetics.includes('Minimalist'));
  assert.ok(profile.dominantAesthetics.includes('Speakeasy'));
});

test('buildDatePlannerPrompt embeds grounding instructions and taste profile', () => {
  const profile = {
    movieId: 'm1',
    movieTitle: 'Amélie',
    correlations: [
      {
        id: 'c1',
        name: 'Café des Deux Moulins',
        category: 'dining',
        affinity_score: 0.98,
        tags: ['Bohemian', 'Bistro', 'Quirky'],
      },
    ],
    dominantAesthetics: ['Bohemian', 'Whimsical', 'Vintage Parisian'],
    vibeSummary: 'Grounded taste profile',
  };

  const prompt = buildDatePlannerPrompt('Paris', 'Amélie', profile);
  assert.ok(prompt.includes('Amélie'));
  assert.ok(prompt.includes('Paris'));
  assert.ok(prompt.includes('Café des Deux Moulins'));
  assert.ok(prompt.includes('Qloo'));
  assert.ok(prompt.includes('DINING EXPERIENCE'));
  assert.ok(prompt.includes('NIGHTLIFE'));
});
