// Map Explorer region types

export interface MapRegion {
  id: string;
  name: string;
  path: string;           // SVG path data
  labelX: number;         // Label position X (in viewBox coords)
  labelY: number;         // Label position Y (in viewBox coords)
  abbreviation?: string;  // e.g. "CA" for California
  funFact: string;
  capital?: string;       // e.g. "Sacramento" for California
  flagEmoji?: string;     // e.g. "🇺🇸" for United States (countries only)
}

export interface MapData {
  id: string;
  name: string;
  viewBox: string;
  regions: MapRegion[];
}

export type Difficulty = 'easy' | 'medium' | 'hard';
