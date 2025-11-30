export class RouteRecorder {
  private points: { x: number; y: number }[] = [];
  private recordInterval: number = 100; // ms
  private lastRecord: number = 0;
  
  record(x: number, y: number, time: number) {
    if (time - this.lastRecord > this.recordInterval) {
      this.points.push({ x, y });
      this.lastRecord = time;
    }
  }
  
  toSVG(width: number = 800, height: number = 2400): string {
    if (this.points.length < 2) return '';
    
    let path = `M ${this.points[0].x} ${this.points[0].y}`;
    
    for (let i = 1; i < this.points.length; i++) {
      path += ` L ${this.points[i].x} ${this.points[i].y}`;
    }
    
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rainbow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#DC143C;stop-opacity:1" />
          <stop offset="16.67%" style="stop-color:#FF8C00;stop-opacity:1" />
          <stop offset="33.33%" style="stop-color:#FFD700;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#32CD32;stop-opacity:1" />
          <stop offset="66.67%" style="stop-color:#1E90FF;stop-opacity:1" />
          <stop offset="83.33%" style="stop-color:#4B0082;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8B00FF;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="${path}" stroke="url(#rainbow)" stroke-width="4" fill="none"/>
    </svg>`;
  }
  
  reset() {
    this.points = [];
    this.lastRecord = 0;
  }
}