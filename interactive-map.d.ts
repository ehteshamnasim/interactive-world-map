/**
 * Interactive World Map Library
 * TypeScript Definitions
 */

export interface MapConfig {
  containerId?: string;
  minColor?: string;
  maxColor?: string;
  landDefaultColor?: string;
  waterColor?: string;
  colorBarX?: number;
  colorBarY?: number;
  colorBarLen?: number;
  colorBarThickness?: number;
  markers?: Marker[];
  theme?: 'light' | 'dark';
  projection?: 'miller' | 'equirectangular' | 'mercator' | 'natural earth';
  width?: number | string;
  height?: number | string;
  enableClick?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableHover?: boolean;
  responsive?: boolean;
  chartTitle?: string;
  description?: string;
}

export interface Marker {
  location: string;
  lat: number;
  lon: number;
  size: number;
  text: string;
  color?: string;
  value?: number;
}

export interface ColorThreshold {
  min: number;
  max: number;
  color: string;
}

export interface CountryData {
  [countryCode: string]: number;
}

export interface MapCallbacks {
  onCountryClick?: (countryCode: string, value: number) => void;
  onMarkerClick?: (marker: Marker) => void;
  onCountryHover?: (countryCode: string, value: number) => void;
  onMarkerHover?: (marker: Marker) => void;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onDataUpdate?: (data: CountryData) => void;
}

export interface LoadDataOptions {
  url?: string;
  data?: CountryData;
  useCountryNames?: boolean;
  validateCodes?: boolean;
}

export interface ColorPreset {
  name: string;
  minColor: string;
  maxColor: string;
  landDefaultColor: string;
  waterColor: string;
}

export class InteractiveMap {
  constructor(containerId: string, config?: MapConfig);
  
  /**
   * Render the map with data
   * @param data - Country data as ISO 3-letter codes mapped to values
   * @param markers - Optional array of markers to display
   */
  render(data?: CountryData, markers?: Marker[]): Promise<void>;
  
  /**
   * Load data from URL or object
   * @param options - Data loading options
   */
  loadData(options: LoadDataOptions): Promise<void>;
  
  /**
   * Update map data without full re-render
   * @param data - New country data
   */
  updateData(data: CountryData): void;
  
  /**
   * Add or update markers
   * @param markers - Array of markers
   */
  updateMarkers(markers: Marker[]): void;
  
  /**
   * Set bubble size multiplier for all markers
   * @param multiplier - Size multiplier (e.g., 1.5 for 150% size)
   */
  setBubbleSizeMultiplier(multiplier: number): this;
  
  /**
   * Set color scale for bubbles based on their values
   * @param colorScale - Array of colors for gradient, or null to disable
   */
  setBubbleColorScale(colorScale: string[] | null): this;
  
  /**
   * Set custom colors for specific value ranges
   * @param colorMap - Array of threshold objects with min, max, and color, or null to disable
   */
  setBubbleColorByValue(colorMap: ColorThreshold[] | null): this;
  
  /**
   * Set event callbacks
   * @param callbacks - Object with callback functions
   */
  setCallbacks(callbacks: MapCallbacks): void;
  
  /**
   * Change map theme
   * @param theme - Theme name ('light' or 'dark')
   */
  setTheme(theme: 'light' | 'dark'): void;
  
  /**
   * Apply color preset
   * @param preset - Preset name or preset object
   */
  applyColorPreset(preset: string | ColorPreset): void;
  
  /**
   * Resize map to fit container
   */
  resize(): this;
  
  /**
   * Destroy map instance and clean up
   */
  destroy(): this;
  
  /**
   * Export current configuration
   */
  exportConfig(): MapConfig;
  
  /**
   * Export current data
   */
  exportData(): {
    countries: CountryData;
    markers: Marker[];
  };
  
  /**
   * Validate country codes
   * @param data - Country data to validate
   * @returns Array of invalid country codes
   */
  validateCountryCodes(data: CountryData): string[];
  
  /**
   * Convert country names to ISO codes
   * @param name - Country name
   * @returns ISO 3-letter code or null if not found
   */
  static countryNameToCode(name: string): string | null;
  
  /**
   * Get all available color presets
   */
  static getColorPresets(): ColorPreset[];
}

export default InteractiveMap;
