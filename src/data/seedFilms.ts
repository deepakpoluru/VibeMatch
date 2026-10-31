export interface SeedFilm {
  id: string;
  title: string;
  year: number;
  director: string;
  genre: string;
  defaultCity: string;
  aestheticKeywords: string[];
  qlooEntityId: string;
  qlooCorrelations: Array<{
    name: string;
    category: 'dining' | 'nightlife';
    score: number;
    tags: string[];
    description: string;
  }>;
  curatedItinerary: {
    vibeProfile: string;
    dinner: {
      name: string;
      neighborhood: string;
      dishPairing: string;
      qlooRationale: string;
    };
    nightlife: {
      name: string;
      neighborhood: string;
      activity: string;
      vibeAlignment: string;
    };
    insiderTip: string;
    cinematicSoundtrack: string;
  };
}

export const SEED_FILMS: SeedFilm[] = [
  {
    id: 'film-1',
    title: 'Inception',
    year: 2010,
    director: 'Christopher Nolan',
    genre: 'Sci-Fi / Architectural Thriller',
    defaultCity: 'Tokyo',
    aestheticKeywords: ['Architectural Brutalism', 'Subterranean Speakeasies', 'Bespoke Omurice', 'High-Ceiling Minimalist'],
    qlooEntityId: 'qloo_ent_inception_2010_01',
    qlooCorrelations: [
      {
        name: 'The Peninsula Peter Bar & Grill',
        category: 'dining',
        score: 0.94,
        tags: ['Panoramic', 'Sleek Geometric', 'Modernist'],
        description: 'Suspended glass and chrome aesthetic echoing Cobb’s architectural mind mazes.'
      },
      {
        name: 'Bar BenFiddich',
        category: 'nightlife',
        score: 0.96,
        tags: ['Alchemical Mixology', 'Wood-carved', 'Subconscious'],
        description: 'Farm-to-glass cocktail wizardry without a menu—pure dream architect execution.'
      },
      {
        name: 'Narisawa',
        category: 'dining',
        score: 0.91,
        tags: ['Sensory Gastronomy', 'Surrealist'],
        description: 'Multi-layered culinary philosophy challenging perception of reality.'
      },
      {
        name: 'Bar Trench Ebisu',
        category: 'nightlife',
        score: 0.89,
        tags: ['Intimate Herbalist', 'Victorian Modern'],
        description: 'Absinthe and herbal elixirs tucked into a narrow labyrinthine alleyway.'
      },
      {
        name: 'Mori Building Digital Art Museum',
        category: 'nightlife',
        score: 0.93,
        tags: ['Infinite Mirror Rooms', 'Non-Euclidean'],
        description: 'Reality-bending spatial immersion mirroring Paris folding onto itself.'
      }
    ],
    curatedItinerary: {
      vibeProfile: 'Inception embodies architectural precision, temporal suspension, and high-stakes cerebral elegance. In Tokyo, this demands spaces that treat geometry, mixology, and gastronomy as controlled psychological experiments.',
      dinner: {
        name: 'Peter Bar & Grill (The Peninsula Tokyo)',
        neighborhood: 'Yurakucho / Hibiya',
        dishPairing: 'Hokkaido Wagyu Sirloin paired with a Smoked Hinoki Old Fashioned infused under a glass bell jar',
        qlooRationale: 'Echoing the film’s sky-high Tokyo helipad meeting scenes, Peter features floor-to-ceiling geometric glass looking out over the Imperial Palace, giving diners the sensation of standing inside a living dream construct.'
      },
      nightlife: {
        name: 'Bar BenFiddich',
        neighborhood: 'Shinjuku (Subterranean 9th Floor)',
        activity: 'Custom sensory mixology where bartender Hiroyasu Kayama crushes wild botanicals and wormwood into bespoke hypnotic elixirs',
        vibeAlignment: 'Like Miles’ alchemical lab or Yusuf’s subterranean sleep chamber, BenFiddich has no cocktail menu; you surrender control to the dream architect.'
      },
      insiderTip: 'Reserve Peter exactly 30 minutes before twilight, and request Window Table #14 facing the Tokyo Tower axis. Carry an idiosyncratic pocket totem to break the ice.',
      cinematicSoundtrack: 'Hans Zimmer - "Time" & Johnny Marr guitar motifs'
    }
  },
  {
    id: 'film-2',
    title: 'Chungking Express',
    year: 1994,
    director: 'Wong Kar-wai',
    genre: 'Urban Romance / Neon Melancholy',
    defaultCity: 'New York',
    aestheticKeywords: ['Neon-drenched', 'Subterranean Canteen', 'Low-Intervention Wine', 'Step-printed Grain'],
    qlooEntityId: 'qloo_ent_chungking_1994_99',
    qlooCorrelations: [
      {
        name: 'Potluck Club',
        category: 'dining',
        score: 0.97,
        tags: ['Chinatown Neo-Canteen', 'Nostalgic Cantonese', 'Vibrant'],
        description: 'Irreverent, electric modern Chinatown dining with Pineapple-glazed pork belly.'
      },
      {
        name: 'Apotheke Chinatown',
        category: 'nightlife',
        score: 0.95,
        tags: ['Hidden Alleyway', 'Prescription Elixirs', 'Subterranean'],
        description: 'Tucked down Doyers Street’s blood alley behind an unmarked gold chemist door.'
      },
      {
        name: 'Wo Hop (Downstairs)',
        category: 'dining',
        score: 0.92,
        tags: ['Late-Night Cult', 'Vinyl Booths', 'Steamy Woks'],
        description: '3 AM basement noodle sanctuary matching Cop 223’s wandering existential nights.'
      },
      {
        name: 'Dr. Clark',
        category: 'nightlife',
        score: 0.91,
        tags: ['Kotatsu Tables', 'Karaoke', 'Lofi Melancholy'],
        description: 'Chinatown table grills with retro cassette audio and misty neon lighting.'
      },
      {
        name: 'Clandestino',
        category: 'nightlife',
        score: 0.88,
        tags: ['Lower East Side', 'Dim Glow', 'Unpretentious Romance'],
        description: 'Corner tavern where strangers linger to the sound of California Dreamin’.'
      }
    ],
    curatedItinerary: {
      vibeProfile: 'Chungking Express is all about fleeting proximity, canned pineapples with expiration dates, and romantic serendipity set against saturated amber neon. In New York, Chinatown is its spiritual twin.',
      dinner: {
        name: 'Potluck Club',
        neighborhood: 'Chinatown / Lower East Side',
        dishPairing: 'Salt & Pepper French Toast with Cantonese BBQ Pork belly paired with Chilled Pet-Nat Riesling',
        qlooRationale: 'Fast-paced, vibrant, deeply soulful Chinatown cuisine that feels like Midnight Express sandwich shop reborn with high culinary pedigree.'
      },
      nightlife: {
        name: 'Apotheke (Doyers Street)',
        neighborhood: 'Chinatown',
        activity: 'Midnight absinthe & herbal tincture cocktails sipped beneath vintage pharmaceutical chandeliers',
        vibeAlignment: 'Navigating the sharp bend of historic Doyers Street in the mist directly channels Faye Wong wandering the labyrinthine corridors of Chungking Mansions in sunglasses.'
      },
      insiderTip: 'Wear a vintage trench coat or sunglasses at night. Ask for the secret corner booth at Apotheke and split an order of fresh pineapple slices on the walk between venues.',
      cinematicSoundtrack: 'The Mamas & The Papas - "California Dreamin\'" on loop'
    }
  },
  {
    id: 'film-3',
    title: 'Blade Runner 2049',
    year: 2017,
    director: 'Denis Villeneuve',
    genre: 'Cyberpunk Noir / Existential',
    defaultCity: 'London',
    aestheticKeywords: ['Monolithic Concrete', 'Sepia Dust', 'Analog Synthesizer', 'Brutalist Glaze'],
    qlooEntityId: 'qloo_ent_bladerunner2049_02',
    qlooCorrelations: [
      {
        name: '1882 at the Barbican',
        category: 'dining',
        score: 0.95,
        tags: ['Brutalist Architecture', 'Smoked Charcoal', 'Industrial'],
        description: 'Dining inside London’s premier brutalist concrete cultural mothership.'
      },
      {
        name: 'Nightjar Shoreditch',
        category: 'nightlife',
        score: 0.94,
        tags: ['Subterranean Speakeasy', 'Vintage Crystal', 'Distilled Smoke'],
        description: 'Hidden basement bar serving drinks in antique decanters with theatrical dry ice.'
      },
      {
        name: 'Brat Hackney',
        category: 'dining',
        score: 0.90,
        tags: ['Open Wood Fire', 'Minimalist Basque', 'Amber Glow'],
        description: 'Whole turbot roasted over blazing embers in a converted 1930s pub.'
      },
      {
        name: 'Discount Suit Company',
        category: 'nightlife',
        score: 0.92,
        tags: ['Unmarked Tailor Door', 'Cellar Cocktails'],
        description: 'Down a rusted metal staircase behind an old East London tailor shop.'
      },
      {
        name: 'The Alchemist Bevis Marks',
        category: 'nightlife',
        score: 0.89,
        tags: ['Molecular Smoke', 'Neon Copper'],
        description: 'Dramatic color-changing theatrical elixirs reflecting futuristic neon rain.'
      }
    ],
    curatedItinerary: {
      vibeProfile: 'Blade Runner 2049 balances massive scale with tender melancholy—monolithic concrete, amber rain, and hologram warmth. In London, this translates into brutalist architecture and clandestine subterranean craft.',
      dinner: {
        name: 'Osteria & Martini Bar at the Barbican Centre',
        neighborhood: 'The City / Barbican Estate',
        dishPairing: 'Handmade Pappardelle with Wild Boar Ragù paired with a Smoked Islay Peated Single Malt Highball',
        qlooRationale: 'The Barbican’s towering bush-hammered concrete pillars and serene reflective ponds mirror Wallace Corporation’s brutalist headquarters with uncanny precision.'
      },
      nightlife: {
        name: 'Nightjar',
        neighborhood: 'Old Street / Shoreditch',
        activity: 'Live speakeasy blues and clandestine cocktails served with aromatic woodsmoke and vintage vinyl warmth',
        vibeAlignment: 'A shadowy underground enclave where the lighting is dialed to near-zero, creating an intimate haven isolated from the drizzle above.'
      },
      insiderTip: 'Arrive at the Barbican 45 minutes before dinner to stroll the elevated highwalks over the water gardens as dusk settles.',
      cinematicSoundtrack: 'Benjamin Wallfisch & Hans Zimmer - "Tears In The Rain"'
    }
  },
  {
    id: 'film-4',
    title: 'Amélie',
    year: 2001,
    director: 'Jean-Pierre Jeunet',
    genre: 'Whimsical Romantic / Vintage Paris',
    defaultCity: 'Paris',
    aestheticKeywords: ['Crème Brûlée Cracking', 'Montmartre Cobblestones', 'Accordion Warmth', 'Quirky Vintage'],
    qlooEntityId: 'qloo_ent_amelie_2001_88',
    qlooCorrelations: [
      {
        name: 'Le Pantruche',
        category: 'dining',
        score: 0.96,
        tags: ['Neo-Bistrot', 'Antiqued Mirrors', 'Warm Zinc Bar'],
        description: 'Artisanal modern bistro cooking with warm neighborhood intimacy.'
      },
      {
        name: 'L’Entrée des Artistes Pigalle',
        category: 'nightlife',
        score: 0.94,
        tags: ['Natural Wine', 'Vinyl Grooves', 'Soft Amber'],
        description: 'Two-story vintage salon pouring biodynamic Chenin with gentle soul music.'
      },
      {
        name: 'Café des Deux Moulins',
        category: 'dining',
        score: 0.93,
        tags: ['Original Amélie Café', 'Montmartre Icon', 'Zinc Counter'],
        description: 'The real café where Amélie worked, famous for cracking spoon crème brûlée.'
      },
      {
        name: 'Le Très Particulier',
        category: 'nightlife',
        score: 0.95,
        tags: ['Hidden Garden', 'Botanical Wallpaper', 'Secret Oasis'],
        description: 'Tucked inside the private garden grounds of a Montmartre boutique hôtel.'
      },
      {
        name: 'Bar Hemingway (Ritz Paris)',
        category: 'nightlife',
        score: 0.89,
        tags: ['Literary Heritage', 'Rose Cocktails'],
        description: 'Historic micro-lounge with antique books and handwritten love notes.'
      }
    ],
    curatedItinerary: {
      vibeProfile: 'Amélie celebrates tactile joy: skimming flat stones across the Canal Saint-Martin, cracking the caramelized crust of a crème brûlée, and the quiet pleasure of unexpected romance.',
      dinner: {
        name: 'Le Pantruche',
        neighborhood: '9th Arrondissement (South Pigalle)',
        dishPairing: 'Roasted Duck Breast with Caramelized Salsify and Warm Grand Marnier Soufflé with Salted Butter Caramel',
        qlooRationale: 'A luminous corner bistro with distressed zinc, curved wood chairs, and a kitchen that treats traditional French soul food with whimsical modern flair.'
      },
      nightlife: {
        name: 'Le Très Particulier (Hôtel Particulier Montmartre)',
        neighborhood: 'Montmartre',
        activity: 'Botanical floral cocktails in a glass conservatory surrounded by private ivy-covered gardens',
        vibeAlignment: 'Entering through an unmarked buzzer-operated wrought iron gate on Passage de la Sorcière feels like discovering Nino Quincampoix’s hidden photo album.'
      },
      insiderTip: 'Carry a vintage post-it pad in your pocket to leave playful clues for your date on the walk up Rue Lepic.',
      cinematicSoundtrack: 'Yann Tiersen - "Comptine d\'un autre été: L\'après-midi"'
    }
  },
  {
    id: 'film-5',
    title: 'La La Land',
    year: 2016,
    director: 'Damien Chazelle',
    genre: 'Musical Romance / Twilight Golden Hour',
    defaultCity: 'Los Angeles',
    aestheticKeywords: ['Golden Hour Violet', 'Unapologetic Bebop', 'Classic Old Hollywood', 'Art Deco Rooftops'],
    qlooEntityId: 'qloo_ent_lalaland_2016_44',
    qlooCorrelations: [
      {
        name: 'Musso & Frank Grill',
        category: 'dining',
        score: 0.98,
        tags: ['Hollywood Golden Age', 'Red Leather Booths', 'Martini Cart'],
        description: 'Oldest restaurant in Hollywood where F. Scott Fitzgerald and Bogart dined.'
      },
      {
        name: 'The Dresden Room',
        category: 'nightlife',
        score: 0.95,
        tags: ['Live Lounge Piano', 'Vintage Vinyl Booths', 'Old Hollywood'],
        description: 'Classic Los Feliz cocktail den with retro velvet and live jazz piano nightly.'
      },
      {
        name: 'Lighthouse Café Hermosa Beach',
        category: 'nightlife',
        score: 0.97,
        tags: ['Original Filming Location', 'Historic Bebop Haven'],
        description: 'The real jazz club where Sebastian and Mia fell in love listening to trumpets.'
      },
      {
        name: 'Yamashiro Hollywood',
        category: 'dining',
        score: 0.91,
        tags: ['Hilltop Panoramas', 'Japanese Pagoda', 'Twilight Lights'],
        description: 'Sweeping panoramic vistas over the glimmering grid of Los Angeles at dusk.'
      },
      {
        name: 'Bar Flores',
        category: 'nightlife',
        score: 0.90,
        tags: ['Echo Park Patio', 'Floral Mezcal', 'Sunset Strings'],
        description: 'Upstairs balcony cocktail spot overlooking Sunset Boulevard with twinkling fairy bulbs.'
      }
    ],
    curatedItinerary: {
      vibeProfile: 'La La Land is a love letter to purple twilight, tap-dancing on hilltops, unapologetic jazz passion, and the bittersweet romance of pursuing artistic dreams in the City of Angels.',
      dinner: {
        name: 'Musso & Frank Grill',
        neighborhood: 'Hollywood Boulevard',
        dishPairing: 'Classic Filet Mignon with Béchamel creamed spinach, accompanied by the iconic stirred Gin Gibson with pickled onions',
        qlooRationale: 'The quintessential Old Hollywood dining room with mahogany wood and jacketed waiters, celebrating classic cinematic romanticism.'
      },
      nightlife: {
        name: 'The Lighthouse Café',
        neighborhood: 'Hermosa Beach',
        activity: 'Live four-piece bebop jazz quartet, acoustic upright bass, and craft cocktails by the ocean breeze',
        vibeAlignment: 'The sacred filming location where Ryan Gosling’s character introduced Mia to pure, spontaneous jazz.'
      },
      insiderTip: 'Start the date at the Griffith Observatory overlook just as the sun dips below the horizon to watch the streetlights click on across the basin.',
      cinematicSoundtrack: 'Damien Chazelle & Justin Hurwitz - "City of Stars" (Twilight Duet)'
    }
  },
  {
    id: 'film-6',
    title: 'The Grand Budapest Hotel',
    year: 2014,
    director: 'Wes Anderson',
    genre: 'Pastel Nostalgia / European Aristocratic Farce',
    defaultCity: 'Vienna',
    aestheticKeywords: ['Symmetrical Pastries', 'Courtesan au Chocolat', 'Art Nouveau Velvet', 'Gilded Rococo'],
    qlooEntityId: 'qloo_ent_grandbudapest_2014_12',
    qlooCorrelations: [
      {
        name: 'Café Sacher & Restaurant Rote Bar',
        category: 'dining',
        score: 0.97,
        tags: ['Damask Silk Walls', 'Crystal Chandeliers', 'Legendary Torte'],
        description: 'Deep red velvet banquettes and piano music channeling Monsieur Gustave H.'
      },
      {
        name: 'Loos American Bar',
        category: 'nightlife',
        score: 0.96,
        tags: ['Adolf Loos 1908', 'Onyx Marble Tiles', 'Micro-Jewel Box'],
        description: 'Compact architectural marvel with coffered ceilings and impeccable classic martinis.'
      },
      {
        name: 'Café Central',
        category: 'dining',
        score: 0.93,
        tags: ['Gothic Vaulting', 'Grand Pastry Trays', 'Viennese Literature'],
        description: 'High vaulted ceilings and pastry display cases resembling Mendl’s Bakery.'
      },
      {
        name: 'Krokiet / Kleinod Bar',
        category: 'nightlife',
        score: 0.91,
        tags: ['Gilded Brass', 'Bespoke Old Fashioneds'],
        description: 'Lavish Viennese cocktail salon tucked into the first district alleys.'
      },
      {
        name: 'Demel K.u.K. Hofzuckerbäcker',
        category: 'dining',
        score: 0.95,
        tags: ['Imperial Confectioner', 'Glass Pastry Kitchen'],
        description: 'Watch master pastry chefs construct pastel multi-tier cakes behind glass.'
      }
    ],
    curatedItinerary: {
      vibeProfile: 'The Grand Budapest Hotel is defined by obsessive symmetry, pastel pink and lavender color palettes, refined etiquette, and a profound nostalgia for a vanished world of courtly romance.',
      dinner: {
        name: 'Rote Bar at Hotel Sacher',
        neighborhood: 'Innere Stadt (First District)',
        dishPairing: 'Tafelspitz with apple horseradish and warm brioche dumplings, finished with an authentic Sacher-Torte and Viennese Melange',
        qlooRationale: 'Draped in crimson damask silk with oil paintings and gold-leaf cornices, this room feels like the dining carriage of the Trans-Alpine Yubatja Express.'
      },
      nightlife: {
        name: 'Loos American Bar (Kärntner Bar)',
        neighborhood: 'Kärntner Durchgang',
        activity: 'Intimate champagne cocktails surrounded by translucent onyx marble tiles and walnut panelling designed in 1908',
        vibeAlignment: 'A micro-jewel-box of geometric perfection that Monsieur Gustave and Zero would frequent for clandestine post-auction debriefs.'
      },
      insiderTip: 'Wear a splash of cologne (preferably L\'Air de Panache) and ask the concierge to seat you directly under the portrait in the back corner of the Rote Bar.',
      cinematicSoundtrack: 'Alexandre Desplat - "The Society of the Crossed Keys"'
    }
  }
];
