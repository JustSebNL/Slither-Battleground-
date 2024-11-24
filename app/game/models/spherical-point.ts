export class SphericalPoint {
  constructor(
    public latitude: number,  // -90 to 90 degrees
    public longitude: number, // -180 to 180 degrees,
    public radius: number = 1 // Unit sphere by default
  ) {}

  // Convert spherical coordinates to Cartesian (x,y,z)
  toCartesian(): { x: number; y: number; z: number } {
    const latRad = (this.latitude * Math.PI) / 180;
    const lonRad = (this.longitude * Math.PI) / 180;
    
    return {
      x: this.radius * Math.cos(latRad) * Math.cos(lonRad),
      y: this.radius * Math.cos(latRad) * Math.sin(lonRad),
      z: this.radius * Math.sin(latRad)
    };
  }

  // Calculate great circle distance to another point
  distanceTo(other: SphericalPoint): number {
    const lat1 = (this.latitude * Math.PI) / 180;
    const lat2 = (other.latitude * Math.PI) / 180;
    const dLon = ((other.longitude - this.longitude) * Math.PI) / 180;

    return Math.acos(
      Math.sin(lat1) * Math.sin(lat2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(dLon)
    ) * this.radius;
  }

  // Move point along great circle path
  moveAlongGreatCircle(heading: number, distance: number): SphericalPoint {
    const lat1 = (this.latitude * Math.PI) / 180;
    const lon1 = (this.longitude * Math.PI) / 180;
    const headingRad = (heading * Math.PI) / 180;
    const angularDistance = distance / this.radius;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(headingRad)
    );

    const lon2 = lon1 + Math.atan2(
      Math.sin(headingRad) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

    return new SphericalPoint(
      (lat2 * 180) / Math.PI,
      ((lon2 * 180) / Math.PI + 180) % 360 - 180,
      this.radius
    );
  }
}