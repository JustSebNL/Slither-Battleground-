import { SphericalPoint } from './spherical-point';

export enum RegionType {
  ICE = 'ice',
  FIRE = 'fire',
  EARTH = 'earth',
  WATER = 'water',
  POISON = 'poison',
  SHADOW = 'shadow'
}

export interface Region {
  center: SphericalPoint;
  type: RegionType;
  radius: number;  // in degrees
}

export class GlobeMap {
  private regions: Region[] = [];
  private readonly EARTH_RADIUS = 6371; // km

  constructor() {
    this.initializeRegions();
  }

  private initializeRegions() {
    // Ice regions at poles
    this.regions.push(
      { center: new SphericalPoint(90, 0, this.EARTH_RADIUS), type: RegionType.ICE, radius: 20 },
      { center: new SphericalPoint(-90, 0, this.EARTH_RADIUS), type: RegionType.ICE, radius: 20 }
    );

    // Fire regions near equator
    this.regions.push(
      { center: new SphericalPoint(0, 30, this.EARTH_RADIUS), type: RegionType.FIRE, radius: 15 },
      { center: new SphericalPoint(0, -30, this.EARTH_RADIUS), type: RegionType.FIRE, radius: 15 }
    );

    // Add other regions...
  }

  getRegionAt(point: SphericalPoint): RegionType | null {
    for (const region of this.regions) {
      if (point.distanceTo(region.center) <= region.radius) {
        return region.type;
      }
    }
    return null;
  }

  // Get environmental effects based on location
  getEnvironmentalEffects(point: SphericalPoint): { speedModifier: number; sizeModifier: number } {
    const region = this.getRegionAt(point);
    
    switch (region) {
      case RegionType.ICE:
        return { speedModifier: 0.8, sizeModifier: 1.0 }; // Slower in ice regions
      case RegionType.FIRE:
        return { speedModifier: 1.2, sizeModifier: 0.95 }; // Faster but smaller in fire regions
      case RegionType.WATER:
        return { speedModifier: 1.1, sizeModifier: 1.0 }; // Slightly faster in water
      case RegionType.POISON:
        return { speedModifier: 0.9, sizeModifier: 0.9 }; // Slower and smaller in poison
      default:
        return { speedModifier: 1.0, sizeModifier: 1.0 }; // Normal in neutral regions
    }
  }
}