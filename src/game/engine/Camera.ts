import { clamp, lerp } from '../utils/math';

export class Camera {
  x = 0;
  y = 0;
  zoom = 1;
  targetX = 0;
  targetY = 0;
  targetZoom = 1;
  minZoom = 0.3;
  maxZoom = 2.5;
  lerpSpeed = 0.1;
  screenW = 0;
  screenH = 0;

  // Pan state
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private camStartX = 0;
  private camStartY = 0;

  setScreenSize(w: number, h: number) {
    this.screenW = w;
    this.screenH = h;
  }

  centerOn(wx: number, wy: number) {
    this.targetX = wx;
    this.targetY = wy;
  }

  snapTo(wx: number, wy: number) {
    this.x = this.targetX = wx;
    this.y = this.targetY = wy;
  }

  zoomBy(delta: number) {
    this.targetZoom = clamp(this.targetZoom + delta, this.minZoom, this.maxZoom);
  }

  setZoom(z: number) {
    this.targetZoom = clamp(z, this.minZoom, this.maxZoom);
  }

  update() {
    this.x = lerp(this.x, this.targetX, this.lerpSpeed);
    this.y = lerp(this.y, this.targetY, this.lerpSpeed);
    this.zoom = lerp(this.zoom, this.targetZoom, this.lerpSpeed);
  }

  // ── Mouse Pan ───────────────────────
  startPan(screenX: number, screenY: number) {
    this.isPanning = true;
    this.panStartX = screenX;
    this.panStartY = screenY;
    this.camStartX = this.targetX;
    this.camStartY = this.targetY;
  }

  movePan(screenX: number, screenY: number) {
    if (!this.isPanning) return;
    const dx = (screenX - this.panStartX) / this.zoom;
    const dy = (screenY - this.panStartY) / this.zoom;
    this.targetX = this.camStartX - dx;
    this.targetY = this.camStartY - dy;
  }

  endPan() {
    this.isPanning = false;
  }

  get panning() {
    return this.isPanning;
  }
}
