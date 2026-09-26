/*
 * The tiny planet in the hero: a low-poly world with blueprint edge lines
 * that turns from night to day with the site theme. Plain three.js (no
 * React) so the render loop never touches React state. createWorld()
 * returns handles for the wrapper component.
 */
import {
  AmbientLight,
  BackSide,
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DataTexture,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  NearestFilter,
  NormalBlending,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  Quaternion,
  RedFormat,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const DEG = Math.PI / 180;
const UP = new Vector3(0, 1, 0);
const ONE = new Vector3(1, 1, 1);

/* ------------------------------------------------------------------ */
/* Deterministic helpers                                               */
/* ------------------------------------------------------------------ */

function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash3(x, y, z) {
  let h =
    Math.imul(x, 374761393) ^
    Math.imul(y, 668265263) ^
    Math.imul(z, 1440662683);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

function valueNoise(x, y, z) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const w = zf * zf * (3 - 2 * zf);
  const lerp = (a, b, t) => a + (b - a) * t;
  const x00 = lerp(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u);
  const x10 = lerp(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u);
  const x01 = lerp(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u);
  const x11 = lerp(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u);
  return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w);
}

function fbm(x, y, z) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 3; i++) {
    sum += amp * valueNoise(x * freq, y * freq, z * freq);
    freq *= 2;
    amp *= 0.5;
  }
  return sum / 0.875;
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

/* Local planet frame: rotation axis is +Z (towards the camera). psi is the
 * latitude from the walking path (the z = 0 great circle), phi the angle
 * around the axis. */
function sph(phi, psi, out = new Vector3()) {
  const c = Math.cos(psi);
  return out.set(c * Math.cos(phi), c * Math.sin(phi), Math.sin(psi));
}

/* ------------------------------------------------------------------ */
/* Terrain                                                             */
/* ------------------------------------------------------------------ */

const LAND_H = 0.014;
const WATER_H = 0.007;
const PATH_HALF = 6.5 * DEG;

// Seas as ellipses in (phi, psi). The first holds the vessel, the second is
// the reservoir where the dragon boat trains.
const SEAS = [
  {
    phi: 200 * DEG,
    psi: 25 * DEG,
    rPhi: 52 * DEG,
    rPsi: 13 * DEG,
    wobble: 0.3,
  },
  {
    phi: -60 * DEG,
    psi: 56 * DEG,
    rPhi: 36 * DEG,
    rPsi: 8 * DEG,
    wobble: 0.08,
  },
  {
    phi: 20 * DEG,
    psi: -44 * DEG,
    rPhi: 55 * DEG,
    rPsi: 20 * DEG,
    wobble: 0.36,
  },
];

function terrain(p) {
  const psi = Math.asin(clamp(p.z, -1, 1));
  const phi = Math.atan2(p.y, p.x);
  const n = fbm(p.x * 2.4 + 11.3, p.y * 2.4 + 3.1, p.z * 2.4 + 7.7);
  let sea = 0;
  let coast = 0;
  for (const s of SEAS) {
    const dphi = wrapAngle(phi - s.phi) / s.rPhi;
    const dpsi = (psi - s.psi) / s.rPsi;
    const d = Math.sqrt(dphi * dphi + dpsi * dpsi) + (n - 0.5) * s.wobble;
    sea = Math.max(sea, 1 - smoothstep(0.84, 1.0, d));
    coast = Math.max(coast, 1 - smoothstep(1.0, 1.7, d));
  }
  const pathEdge = smoothstep(PATH_HALF, PATH_HALF + 5 * DEG, Math.abs(psi));
  sea *= pathEdge;
  const land = 1 - smoothstep(0.3, 0.7, sea);
  const hills = Math.max(0, n - 0.48) * 0.1 * (1 - coast);
  return {
    h: WATER_H + land * (LAND_H - WATER_H + pathEdge * hills),
    sea,
    pathEdge,
    n,
    phi,
    psi,
  };
}

const PALETTE = {
  deep: new Color("#0d1e31"),
  shallow: new Color("#143049"),
  shore: new Color("#2a3a4b"),
  path: new Color("#3a4757"),
  grassLow: new Color("#15302e"),
  grassMid: new Color("#1a3935"),
  grassHigh: new Color("#20433c"),
  rock: new Color("#2d3d38"),
};

const PALETTE_DAY = {
  deep: new Color("#2d78b0"),
  shallow: new Color("#4f9fd0"),
  shore: new Color("#e8d9ad"),
  path: new Color("#eadfc4"),
  grassLow: new Color("#6c9f60"),
  grassMid: new Color("#7aab69"),
  grassHigh: new Color("#8cb879"),
  rock: new Color("#a3ab9c"),
};

function faceColor(t, palette, out) {
  if (t.sea > 0.5)
    return out
      .copy(palette.shallow)
      .lerp(palette.deep, smoothstep(0.6, 1, t.sea));
  if (t.sea > 0.16) return out.copy(palette.shore);
  if (t.pathEdge < 0.5) return out.copy(palette.path);
  if (t.n > 0.78) return out.copy(palette.rock);
  if (t.n > 0.56) return out.copy(palette.grassHigh);
  if (t.n > 0.44) return out.copy(palette.grassMid);
  return out.copy(palette.grassLow);
}

// Lifts a night colour into its daytime counterpart (lighter, a touch more
// saturated), worked out in sRGB so it matches what the eye expects.
function dayify(color) {
  const hsl = {};
  color.getHSL(hsl, SRGBColorSpace);
  return new Color().setHSL(
    hsl.h,
    Math.min(1, hsl.s * 1.1 + 0.08),
    Math.min(0.86, 0.3 + hsl.l * 1.9),
    SRGBColorSpace,
  );
}

function buildTerrain() {
  const geo = new IcosahedronGeometry(1, 26);
  const pos = geo.attributes.position;
  const v = new Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    v.multiplyScalar(1 + terrain(v).h);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();

  const colors = new Float32Array(pos.count * 3);
  const colorsDay = new Float32Array(pos.count * 3);
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  const tint = new Color();
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    c.fromBufferAttribute(pos, i + 2);
    const t = terrain(a.add(b).add(c).normalize());
    for (const [palette, arr] of [
      [PALETTE, colors],
      [PALETTE_DAY, colorsDay],
    ]) {
      faceColor(t, palette, tint);
      for (let k = 0; k < 3; k++) {
        arr[(i + k) * 3] = tint.r;
        arr[(i + k) * 3 + 1] = tint.g;
        arr[(i + k) * 3 + 2] = tint.b;
      }
    }
  }
  geo.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geo.userData.night = colors.slice();
  geo.userData.day = colorsDay;
  return geo;
}

function buildContours(geo) {
  const pos = geo.attributes.position;
  const levels = [0.007, 0.014, 0.021, 0.028, 0.035].map((l) => LAND_H + l);
  const pts = [];
  const v = [new Vector3(), new Vector3(), new Vector3()];
  const h = [0, 0, 0];
  const cut = (a, b, level) => {
    const t = (level - h[a]) / (h[b] - h[a]);
    return v[a].clone().lerp(v[b], t).multiplyScalar(1.0015);
  };
  for (let i = 0; i < pos.count; i += 3) {
    for (let k = 0; k < 3; k++) {
      v[k].fromBufferAttribute(pos, i + k);
      h[k] = v[k].length() - 1;
    }
    const lo = Math.min(h[0], h[1], h[2]);
    const hi = Math.max(h[0], h[1], h[2]);
    for (const level of levels) {
      if (level <= lo || level >= hi) continue;
      const hits = [];
      for (const [a, b] of [
        [0, 1],
        [1, 2],
        [2, 0],
      ]) {
        if ((h[a] - level) * (h[b] - level) < 0) hits.push(cut(a, b, level));
      }
      if (hits.length === 2)
        pts.push(
          hits[0].x,
          hits[0].y,
          hits[0].z,
          hits[1].x,
          hits[1].y,
          hits[1].z,
        );
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pts, 3));
  return g;
}

/* ------------------------------------------------------------------ */
/* Geometry assembly                                                   */
/* ------------------------------------------------------------------ */

// Collects many small parts into one mesh + one edge-line geometry.
class Batch {
  constructor() {
    this.solids = [];
    this.edges = [];
    this.glows = [];
  }

  add(geo, color, matrix, { edges = true, edgeAngle = 25, day } = {}) {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.deleteAttribute("uv");
    g.computeVertexNormals();
    const col = new Color(color);
    const colDay = day ? new Color(day) : dayify(col);
    const arr = new Float32Array(g.attributes.position.count * 3);
    const arrDay = new Float32Array(arr.length);
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] = col.r;
      arr[i + 1] = col.g;
      arr[i + 2] = col.b;
      arrDay[i] = colDay.r;
      arrDay[i + 1] = colDay.g;
      arrDay[i + 2] = colDay.b;
    }
    g.setAttribute("color", new Float32BufferAttribute(arr, 3));
    g.setAttribute("colorDay", new Float32BufferAttribute(arrDay, 3));
    if (edges) {
      const e = new EdgesGeometry(g, edgeAngle);
      e.applyMatrix4(matrix);
      this.edges.push(e);
    }
    g.applyMatrix4(matrix);
    this.solids.push(g);
  }

  glow(geo, matrix) {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.deleteAttribute("uv");
    g.deleteAttribute("normal");
    g.applyMatrix4(matrix);
    this.glows.push(g);
  }
}

const tmpQ = new Quaternion();
const tmpM = new Matrix4();

// Matrix that stands an object on the surface at (phi, psi), local +X along
// the given heading (radians from "east" towards "north").
function surfaceMatrix(phi, psi, heading = 0, lift = 0, scale = 1) {
  const up = sph(phi, psi);
  const east = new Vector3(-Math.sin(phi), Math.cos(phi), 0);
  const north = new Vector3().crossVectors(up, east).normalize();
  const forward = east
    .clone()
    .multiplyScalar(Math.cos(heading))
    .addScaledVector(north, Math.sin(heading));
  const side = new Vector3().crossVectors(forward, up).normalize();
  const basis = new Matrix4().makeBasis(forward, up, side);
  const h = terrain(up).h;
  const position = up.clone().multiplyScalar(1 + h + lift);
  tmpQ.setFromRotationMatrix(basis);
  return new Matrix4().compose(
    position,
    tmpQ,
    new Vector3(scale, scale, scale),
  );
}

function local(x, y, z, sx = 1, sy = 1, sz = 1) {
  return tmpM
    .clone()
    .compose(new Vector3(x, y, z), new Quaternion(), new Vector3(sx, sy, sz));
}

// Lit windows on the four sides of a box-shaped building.
function addWindows(batch, base, w, h, d, rand, density = 0.55) {
  const win = new PlaneGeometry(0.0052, 0.0068);
  const cols = Math.max(1, Math.floor(w / 0.011));
  const colsD = Math.max(1, Math.floor(d / 0.011));
  const rows = Math.max(1, Math.floor((h - 0.012) / 0.014));
  const faces = [
    { n: 1, count: cols, span: w, rot: 0, off: d / 2 },
    { n: -1, count: cols, span: w, rot: Math.PI, off: d / 2 },
    { n: 1, count: colsD, span: d, rot: Math.PI / 2, off: w / 2 },
    { n: -1, count: colsD, span: d, rot: -Math.PI / 2, off: w / 2 },
  ];
  faces.forEach((f, fi) => {
    for (let r = 0; r < rows; r++) {
      for (let c2 = 0; c2 < f.count; c2++) {
        if (rand() > density) continue;
        const u = (c2 + 0.5) / f.count - 0.5;
        const y = 0.012 + r * 0.014;
        const m = new Matrix4();
        if (fi < 2) {
          m.compose(
            new Vector3(u * f.span * 0.86, y, f.n * (f.off + 0.0012)),
            new Quaternion().setFromAxisAngle(UP, f.rot),
            ONE,
          );
        } else {
          m.compose(
            new Vector3(f.n * (f.off + 0.0012), y, u * f.span * 0.86),
            new Quaternion().setFromAxisAngle(UP, f.rot),
            ONE,
          );
        }
        batch.glow(win, base.clone().multiply(m));
      }
    }
  });
}

function addTower(batch, base, { w, h, d, color, rand, crown = false }) {
  batch.add(
    new BoxGeometry(w, h, d),
    color,
    base.clone().multiply(local(0, h / 2, 0)),
  );
  addWindows(batch, base, w, h, d, rand);
  if (crown) {
    const ch = h * 0.12;
    batch.add(
      new BoxGeometry(w * 0.62, ch, d * 0.62),
      color,
      base.clone().multiply(local(0, h + ch / 2, 0)),
    );
  }
}

function buildSkyline(batch, rand) {
  // Marina Bay Sands: three towers joined by the SkyPark.
  const mbs = surfaceMatrix(118 * DEG, -20 * DEG, 0.15);
  for (let i = -1; i <= 1; i++) {
    const tower = mbs.clone().multiply(local(i * 0.036, 0, 0));
    batch.add(
      new BoxGeometry(0.026, 0.17, 0.016),
      "#2c3d57",
      tower.clone().multiply(local(0, 0.085, 0)),
    );
    addWindows(batch, tower, 0.026, 0.17, 0.016, rand, 0.5);
  }
  batch.add(
    new BoxGeometry(0.15, 0.008, 0.024),
    "#34486a",
    mbs.clone().multiply(local(0.012, 0.174, 0)),
  );

  // CBD towers behind the path, so they rise over the horizon as the world turns.
  const cbd = [
    [96, -16, 0.034, 0.21, 0.03, true],
    [101, -24, 0.03, 0.16, 0.028, false],
    [89, -21, 0.026, 0.19, 0.026, true],
    [84, -14, 0.028, 0.13, 0.024, false],
    [106, -13, 0.024, 0.12, 0.022, false],
    [92, -28, 0.03, 0.14, 0.03, false],
    [79, -24, 0.022, 0.1, 0.022, false],
    [110, -27, 0.026, 0.11, 0.024, false],
  ];
  const tones = ["#22324a", "#26384f", "#1f2d43", "#2a3c56"];
  cbd.forEach(([phi, psi, w, h, d, crown], i) => {
    const m = surfaceMatrix(phi * DEG, psi * DEG, rand() * 0.3);
    addTower(batch, m, {
      w,
      h,
      d,
      color: tones[i % tones.length],
      rand,
      crown,
    });
  });

  // A few HDB slab blocks on the other side.
  const hdb = [
    [-8, -16],
    [-14, -22],
    [-3, -24],
    [-20, -15],
    [-26, -24],
  ];
  hdb.forEach(([phi, psi]) => {
    const m = surfaceMatrix(phi * DEG, psi * DEG, rand() * 0.6);
    addTower(batch, m, {
      w: 0.052,
      h: 0.062,
      d: 0.014,
      color: "#2b3a4f",
      rand,
    });
  });
}

function buildEsplanade(batch) {
  const base = surfaceMatrix(142 * DEG, 14 * DEG, -0.4);
  const dome = new SphereGeometry(0.03, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2);
  batch.add(
    dome,
    "#3a4b61",
    base.clone().multiply(local(-0.022, 0, 0, 1, 0.8, 1.25)),
    { edgeAngle: 1 },
  );
  batch.add(
    dome,
    "#3a4b61",
    base.clone().multiply(local(0.03, 0, 0.01, 0.9, 0.7, 1.1)),
    { edgeAngle: 1 },
  );
}

function buildTrees(batch, rand) {
  const cone = new ConeGeometry(0.016, 0.05, 5);
  const crown = new IcosahedronGeometry(0.018, 0);
  const trunk = new CylinderGeometry(0.0022, 0.0028, 0.016, 4);
  const greens = ["#1a3b36", "#1e4640", "#173430", "#21493f"];
  const greensDay = ["#4d8a4c", "#5b9957", "#437d45", "#66a35e"];
  const up = new Vector3();
  let placed = 0;
  let guard = 0;
  const forests = [
    [150, 58, 14],
    [40, 42, 12],
    [-130, 38, 12],
    [-20, 70, 10],
    [95, 20, 10],
    [-100, 16, 9],
    [170, -18, 12],
    [-60, -30, 14],
    [60, -45, 12],
  ];
  while (placed < 150 && guard < 6000) {
    guard++;
    const [fPhi, fPsi, spread] = forests[Math.floor(rand() * forests.length)];
    const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;
    const psi = clamp((fPsi + gauss() * spread) * DEG, -85 * DEG, 85 * DEG);
    const phi = wrapAngle(
      (fPhi + (gauss() * spread) / Math.max(0.3, Math.cos(psi))) * DEG,
    );
    sph(phi, psi, up);
    const t = terrain(up);
    if (t.sea > 0.08 || Math.abs(psi) < PATH_HALF + 5 * DEG) continue;
    // keep the skyline and landmarks clear
    const inCity =
      Math.abs(wrapAngle(phi - 105 * DEG)) < 36 * DEG &&
      psi < -8 * DEG &&
      psi > -36 * DEG;
    const inHdb =
      Math.abs(wrapAngle(phi + 14 * DEG)) < 18 * DEG &&
      psi < -10 * DEG &&
      psi > -30 * DEG;
    const nearDome =
      Math.abs(wrapAngle(phi - 142 * DEG)) < 9 * DEG &&
      Math.abs(psi - 14 * DEG) < 7 * DEG;
    const nearHouse = HOUSES.some(
      ([hp, hs]) =>
        Math.abs(wrapAngle(phi - hp * DEG)) < 5 * DEG &&
        Math.abs(psi - hs * DEG) < 5 * DEG,
    );
    if (inCity || inHdb || nearDome || nearHouse) continue;
    const s = 0.75 + rand() * 0.6;
    const m = surfaceMatrix(phi, psi, rand() * Math.PI, -0.002, s);
    const pick = Math.floor(rand() * greens.length);
    const leaf = { edges: false, day: greensDay[pick] };
    batch.add(trunk, "#2a2522", m.clone().multiply(local(0, 0.008, 0)), {
      edges: false,
      day: "#8a6a4f",
    });
    if (rand() < 0.6)
      batch.add(
        cone,
        greens[pick],
        m.clone().multiply(local(0, 0.04, 0)),
        leaf,
      );
    else
      batch.add(
        crown,
        greens[pick],
        m.clone().multiply(local(0, 0.032, 0)),
        leaf,
      );
    placed++;
  }
}

// Small cottages along the path, each with one lit window.
const HOUSES = [
  [-40, 13],
  [-28, 15],
  [8, 12],
  [22, 14],
  [40, 12],
  [58, 15],
  [262, 13],
  [286, 14],
  // villages on the planet's face
  [118, 62],
  [128, 66],
  [112, 69],
  [20, 50],
  [30, 53],
  [14, 56],
  [-150, 58],
  [-140, 62],
  [-158, 64],
  [-20, 34],
  [-8, 38],
];

function buildHouses(batch, rand) {
  const wall = new BoxGeometry(0.026, 0.018, 0.022);
  const roof = new ConeGeometry(0.021, 0.014, 4);
  const win = new PlaneGeometry(0.007, 0.007);
  const porch = new BoxGeometry(0.0055, 0.0055, 0.0055);
  const walls = ["#3a4a5e", "#344357", "#3f4f63"];
  const wallsDay = ["#efe6d6", "#e7dcc8", "#f4ede1"];
  HOUSES.forEach(([phi, psi], i) => {
    const m = surfaceMatrix(phi * DEG, psi * DEG, (rand() - 0.5) * 0.6);
    batch.add(
      wall,
      walls[i % walls.length],
      m.clone().multiply(local(0, 0.009, 0)),
      { day: wallsDay[i % wallsDay.length] },
    );
    const r = new Matrix4().compose(
      new Vector3(0, 0.025, 0),
      new Quaternion().setFromAxisAngle(UP, Math.PI / 4),
      new Vector3(1.25, 1, 1.1),
    );
    batch.add(roof, "#233146", m.clone().multiply(r), { day: "#d27d56" });
    batch.glow(
      win,
      m
        .clone()
        .multiply(local(0.004, 0.009, -0.0115))
        .multiply(new Matrix4().makeRotationY(Math.PI)),
    );
    batch.glow(porch, m.clone().multiply(local(-0.006, 0.004, -0.018)));
  });
}

function buildLamps(batch) {
  const pole = new CylinderGeometry(0.0014, 0.0018, 0.1, 4);
  const head = new BoxGeometry(0.009, 0.006, 0.009);
  for (let i = 0; i < 18; i++) {
    const phi = (i / 18) * Math.PI * 2 + 5 * DEG;
    const psi = (i % 2 === 0 ? 1 : -1) * (PATH_HALF + 1.5 * DEG);
    const m = surfaceMatrix(phi, psi, 0);
    batch.add(pole, "#3b4a5c", m.clone().multiply(local(0, 0.05, 0)), {
      edges: false,
    });
    batch.glow(head, m.clone().multiply(local(0, 0.102, 0)));
  }
}

function buildWaves(rand) {
  const pts = [];
  const up = new Vector3();
  let made = 0;
  let guard = 0;
  while (made < 70 && guard < 3000) {
    guard++;
    const phi = rand() * Math.PI * 2 - Math.PI;
    const psi = Math.asin(rand() * 2 - 1);
    sph(phi, psi, up);
    if (terrain(up).sea < 0.9) continue;
    const m = surfaceMatrix(phi, psi, rand() * 0.4, 0.003);
    const zig = [
      [-0.012, 0],
      [-0.006, 0.004],
      [0, 0],
      [0.006, 0.004],
      [0.012, 0],
    ];
    for (let k = 0; k < zig.length - 1; k++) {
      const p0 = new Vector3(zig[k][0], 0, zig[k][1]).applyMatrix4(m);
      const p1 = new Vector3(zig[k + 1][0], 0, zig[k + 1][1]).applyMatrix4(m);
      pts.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
    }
    made++;
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pts, 3));
  return g;
}

// Lane markers down the reservoir, like a regatta course.
function buildLanes() {
  const pts = [];
  const p = new Vector3();
  for (const off of [-2.6, 0, 2.6]) {
    for (let i = 0; i <= 26; i++) {
      const phi = (-60 - 24 + (i / 26) * 48) * DEG;
      sph(phi, (56 + off) * DEG, p).multiplyScalar(1.004);
      pts.push(p.x, p.y, p.z);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pts, 3));
  return g;
}

/* ------------------------------------------------------------------ */
/* Movers: vessel, dragon boat, flyer, paper plane, character          */
/* ------------------------------------------------------------------ */

function toonMesh(geo, color, gradientMap, extra = {}) {
  return new Mesh(geo, new MeshToonMaterial({ color, gradientMap, ...extra }));
}

function edgeLines(geo, material, angle = 25) {
  return new LineSegments(new EdgesGeometry(geo, angle), material);
}

function buildVessel(gradientMap, lineMat, glowMat) {
  const g = new Group();
  const hullShape = new BoxGeometry(0.15, 0.022, 0.034);
  // taper the bow: pull the +X end vertices in on z
  const hp = hullShape.attributes.position;
  for (let i = 0; i < hp.count; i++) {
    const x = hp.getX(i);
    const y = hp.getY(i);
    if (x > 0) hp.setZ(i, hp.getZ(i) * 0.35);
    if (y < 0) hp.setX(i, hp.getX(i) * 0.9);
  }
  hullShape.computeVertexNormals();
  const hull = toonMesh(hullShape, "#5a2f2f", gradientMap);
  hull.position.y = 0.006;
  hull.add(edgeLines(hullShape, lineMat));
  g.add(hull);

  const containerColors = [
    "#4b6282",
    "#6e5b40",
    "#3f5c58",
    "#5b4f6e",
    "#4b6282",
  ];
  containerColors.forEach((c, i) => {
    const box = new BoxGeometry(0.018, 0.012, 0.026);
    const m = toonMesh(box, c, gradientMap);
    m.position.set(0.028 - i * 0.02, 0.023, 0);
    m.add(edgeLines(box, lineMat));
    g.add(m);
  });

  const bridgeGeo = new BoxGeometry(0.018, 0.026, 0.03);
  const bridge = toonMesh(bridgeGeo, "#c8d2de", gradientMap);
  bridge.position.set(-0.062, 0.03, 0);
  bridge.add(edgeLines(bridgeGeo, lineMat));
  g.add(bridge);

  const funnelGeo = new CylinderGeometry(0.004, 0.005, 0.016, 6);
  const funnel = toonMesh(funnelGeo, "#2b3647", gradientMap);
  funnel.position.set(-0.07, 0.05, 0);
  g.add(funnel);

  const lampGeo = new BoxGeometry(0.004, 0.004, 0.004);
  const lamp = new Mesh(lampGeo, glowMat);
  lamp.position.set(-0.055, 0.045, 0);
  g.add(lamp);
  const bowLamp = new Mesh(lampGeo, glowMat);
  bowLamp.position.set(0.07, 0.02, 0);
  g.add(bowLamp);
  return g;
}

function buildDragonBoat(gradientMap, lineMat) {
  const g = new Group();
  const hullGeo = new BoxGeometry(0.13, 0.01, 0.018);
  const hp = hullGeo.attributes.position;
  for (let i = 0; i < hp.count; i++) {
    const x = hp.getX(i);
    const taper = 1 - smoothstep(0.035, 0.065, Math.abs(x)) * 0.75;
    hp.setZ(i, hp.getZ(i) * taper);
  }
  hullGeo.computeVertexNormals();
  const hull = toonMesh(hullGeo, "#d08a36", gradientMap);
  hull.position.y = 0.004;
  hull.add(edgeLines(hullGeo, lineMat));
  g.add(hull);

  // Dragon head and tail.
  const headGeo = new BoxGeometry(0.012, 0.022, 0.008);
  const head = toonMesh(headGeo, "#d08a36", gradientMap);
  head.position.set(0.066, 0.016, 0);
  head.rotation.z = -0.35;
  head.add(edgeLines(headGeo, lineMat));
  g.add(head);
  const tailGeo = new ConeGeometry(0.005, 0.02, 4);
  const tail = toonMesh(tailGeo, "#d08a36", gradientMap);
  tail.position.set(-0.066, 0.014, 0);
  tail.rotation.z = 0.5;
  g.add(tail);

  // Ten benches of paddlers, a drummer at the bow, a steerer at the stern.
  const paddlerGeo = new BoxGeometry(0.0045, 0.009, 0.0045);
  const crew = new Group();
  for (let i = 0; i < 10; i++) {
    for (const side of [-1, 1]) {
      const p = toonMesh(paddlerGeo, "#e6ecf2", gradientMap);
      p.position.set(-0.042 + i * 0.0092, 0.012, side * 0.0045);
      crew.add(p);
    }
  }
  const drummer = toonMesh(
    new SphereGeometry(0.0045, 6, 5),
    "#f4b55b",
    gradientMap,
  );
  drummer.position.set(0.054, 0.013, 0);
  crew.add(drummer);
  const steerer = toonMesh(paddlerGeo, "#e6ecf2", gradientMap);
  steerer.position.set(-0.056, 0.014, 0);
  crew.add(steerer);
  g.add(crew);
  return g;
}

function buildFlyer(gradientMap, lineMat, glowMat) {
  const g = new Group();
  const legGeo = new BoxGeometry(0.004, 0.07, 0.004);
  for (const s of [-1, 1]) {
    const leg = toonMesh(legGeo, "#3b4a5c", gradientMap);
    leg.position.set(s * 0.012, 0.033, 0);
    leg.rotation.z = -s * 0.28;
    g.add(leg);
  }
  const wheel = new Group();
  wheel.position.y = 0.068;
  const rimGeo = new TorusGeometry(0.052, 0.0024, 4, 30);
  const rim = new Mesh(rimGeo, new MeshBasicMaterial({ color: "#6f86a3" }));
  wheel.add(rim);
  const spokes = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    spokes.push(0, 0, 0, Math.cos(a) * 0.052, Math.sin(a) * 0.052, 0);
    const cap = new Mesh(new BoxGeometry(0.0062, 0.0062, 0.0062), glowMat);
    cap.position.set(Math.cos(a) * 0.052, Math.sin(a) * 0.052, 0);
    wheel.add(cap);
  }
  const sg = new BufferGeometry();
  sg.setAttribute("position", new Float32BufferAttribute(spokes, 3));
  wheel.add(new LineSegments(sg, lineMat));
  g.add(wheel);
  return { group: g, wheel };
}

function buildPaperPlane(gradientMap, lineMat) {
  const v = [
    // left wing
    0.06, 0, 0, -0.04, 0.004, 0.038, -0.04, 0, 0,
    // right wing
    0.06, 0, 0, -0.04, 0, 0, -0.04, 0.004, -0.038,
    // keel
    0.06, 0, 0, -0.04, -0.016, 0, -0.04, 0, 0,
  ];
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(v, 3));
  geo.computeVertexNormals();
  const mesh = toonMesh(geo, "#eef2f6", gradientMap, { side: DoubleSide });
  mesh.add(new LineSegments(new EdgesGeometry(geo, 1), lineMat));
  return mesh;
}

function buildCharacter(gradientMap) {
  const root = new Group();
  const body = new Group();
  root.add(body);
  const shirt = new MeshToonMaterial({ color: "#eef2f6", gradientMap });
  const pants = new MeshToonMaterial({ color: "#1a212c", gradientMap });
  const skin = new MeshToonMaterial({ color: "#e0b995", gradientMap });
  const hair = new MeshToonMaterial({ color: "#14161b", gradientMap });

  const legGeo = new CapsuleGeometry(0.0058, 0.03, 3, 6);
  legGeo.translate(0, -0.021, 0);
  const legL = new Mesh(legGeo, pants);
  const legR = new Mesh(legGeo, pants);
  legL.position.set(0, 0.044, 0.0068);
  legR.position.set(0, 0.044, -0.0068);

  const torso = new Mesh(new CapsuleGeometry(0.0138, 0.022, 4, 10), shirt);
  torso.position.y = 0.069;
  torso.scale.set(0.88, 1, 1.08);

  const armGeo = new CapsuleGeometry(0.0046, 0.025, 3, 6);
  armGeo.translate(0, -0.016, 0);
  const armL = new Mesh(armGeo, shirt);
  const armR = new Mesh(armGeo, shirt);
  armL.position.set(0, 0.085, 0.0178);
  armR.position.set(0, 0.085, -0.0178);
  const handGeo = new SphereGeometry(0.0042, 6, 5);
  for (const arm of [armL, armR]) {
    const hand = new Mesh(handGeo, skin);
    hand.position.y = -0.034;
    arm.add(hand);
  }

  const head = new Mesh(new SphereGeometry(0.0168, 16, 12), skin);
  head.position.y = 0.108;
  const cap = new Mesh(
    new SphereGeometry(0.0178, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
    hair,
  );
  cap.position.y = 0.11;
  cap.rotation.z = 0.32;
  const fringe = new Mesh(new BoxGeometry(0.012, 0.006, 0.026), hair);
  fringe.position.set(0.011, 0.119, 0);
  fringe.rotation.z = -0.45;
  const eyeGeo = new SphereGeometry(0.0021, 6, 5);
  const eyeMat = new MeshBasicMaterial({ color: "#0b0e13" });
  const eyeL = new Mesh(eyeGeo, eyeMat);
  const eyeR = new Mesh(eyeGeo, eyeMat);
  eyeL.position.set(0.0158, 0.106, 0.0058);
  eyeR.position.set(0.0158, 0.106, -0.0058);

  body.add(legL, legR, torso, armL, armR, head, cap, fringe, eyeL, eyeR);

  const shadow = new Mesh(
    new CircleGeometry(0.03, 20),
    new MeshBasicMaterial({
      color: "#05080c",
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.0015;
  root.add(shadow);
  return { root, body, legL, legR, armL, armR };
}

function buildStars(rand) {
  const make = (count, size, opacity) => {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const theta = rand() * Math.PI * 2;
      const z = rand() * 2 - 1;
      const r = 22 + rand() * 8;
      const c = Math.sqrt(1 - z * z);
      pts.push(Math.cos(theta) * c * r, z * r, Math.sin(theta) * c * r - 6);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pts, 3));
    return new Points(
      g,
      new PointsMaterial({
        color: "#c9d6e6",
        size,
        sizeAttenuation: false,
        transparent: true,
        opacity,
        depthWrite: false,
      }),
    );
  };
  const group = new Group();
  group.add(make(520, 1.3, 0.55), make(90, 2.2, 0.85));
  return group;
}

// Place a mover on the planet surface at (phi, psi) heading along its path.
function placeMover(obj, phi, psi, heading, lift) {
  const up = sph(phi, psi);
  const east = new Vector3(-Math.sin(phi), Math.cos(phi), 0);
  const north = new Vector3().crossVectors(up, east).normalize();
  const forward = east
    .multiplyScalar(Math.cos(heading))
    .addScaledVector(north, Math.sin(heading));
  const side = new Vector3().crossVectors(forward, up).normalize();
  obj.quaternion.setFromRotationMatrix(
    new Matrix4().makeBasis(forward, up, side),
  );
  obj.position.copy(up).multiplyScalar(1 + lift);
}

/* ------------------------------------------------------------------ */
/* World                                                               */
/* ------------------------------------------------------------------ */

export function createWorld(
  canvas,
  { reducedMotion = false, onFrame, day = false } = {},
) {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(28, 1, 0.1, 100);
  const target = new Vector3(0, 0.16, 0);

  const gradientMap = new DataTexture(
    new Uint8Array([70, 150, 255]),
    3,
    1,
    RedFormat,
  );
  gradientMap.minFilter = NearestFilter;
  gradientMap.magFilter = NearestFilter;
  gradientMap.generateMipmaps = false;
  gradientMap.needsUpdate = true;

  // Everything that changes between night and day registers here and is
  // blended by applyTheme(k), k = 0 night .. 1 day.
  const themed = [];
  const themeColor = (obj, key, night, dayValue) =>
    themed.push({
      obj,
      key,
      night: new Color(night),
      day: new Color(dayValue),
    });
  const themeNumber = (obj, key, night, dayValue) =>
    themed.push({ obj, key, night, day: dayValue });

  const lineMat = new LineBasicMaterial({ transparent: true });
  themeColor(lineMat, "color", "#8fb0d6", "#2c4f7c");
  themeNumber(lineMat, "opacity", 0.42, 0.34);
  const terrainLineMat = new LineBasicMaterial({ transparent: true });
  themeColor(terrainLineMat, "color", "#8fb0d6", "#2c4f7c");
  themeNumber(terrainLineMat, "opacity", 0.24, 0.16);
  const glowMat = new MeshBasicMaterial({ toneMapped: false });
  themeColor(glowMat, "color", "#ffc46b", "#cfdbe7");
  const rand = mulberry32(20260926);

  // Lights: moonlight (or sunlight) from the upper left, a rim from behind.
  const hemi = new HemisphereLight();
  themeColor(hemi, "color", "#2f4a66", "#d6e9ff");
  themeColor(hemi, "groundColor", "#0b1220", "#7d9a6a");
  themeNumber(hemi, "intensity", 0.9, 1.5);
  const ambient = new AmbientLight();
  themeColor(ambient, "color", "#1b2940", "#ffffff");
  themeNumber(ambient, "intensity", 0.5, 0.55);
  const keyLight = new DirectionalLight();
  keyLight.position.set(-3, 3.2, 2.4);
  themeColor(keyLight, "color", "#d6e4ff", "#fff0d2");
  themeNumber(keyLight, "intensity", 4.4, 3.6);
  const rim = new DirectionalLight();
  rim.position.set(3, 1.5, -3.5);
  themeColor(rim, "color", "#7b9bd0", "#ffffff");
  themeNumber(rim, "intensity", 2.2, 1.2);
  scene.add(hemi, ambient, keyLight, rim);

  const planet = new Group();
  scene.add(planet);

  const terrainGeo = buildTerrain();
  const terrainMesh = new Mesh(
    terrainGeo,
    new MeshToonMaterial({
      vertexColors: true,
      gradientMap,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
  );
  planet.add(terrainMesh);
  planet.add(
    new LineSegments(new EdgesGeometry(terrainGeo, 16), terrainLineMat),
  );
  const contourMat = new LineBasicMaterial({ transparent: true });
  themeColor(contourMat, "color", "#8fb0d6", "#2c4f7c");
  themeNumber(contourMat, "opacity", 0.16, 0.12);
  planet.add(new LineSegments(buildContours(terrainGeo), contourMat));

  // Static props, batched into one mesh, one edge set and one glow set.
  const batch = new Batch();
  buildSkyline(batch, rand);
  buildEsplanade(batch);
  buildHouses(batch, rand);
  buildTrees(batch, rand);
  buildLamps(batch);
  const propsGeo = mergeGeometries(batch.solids);
  propsGeo.userData.night = propsGeo.attributes.color.array.slice();
  propsGeo.userData.day = propsGeo.attributes.colorDay.array;
  propsGeo.deleteAttribute("colorDay");
  planet.add(
    new Mesh(
      propsGeo,
      new MeshToonMaterial({
        vertexColors: true,
        gradientMap,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      }),
    ),
  );
  planet.add(new LineSegments(mergeGeometries(batch.edges), lineMat));
  planet.add(new Mesh(mergeGeometries(batch.glows), glowMat));

  // Thin atmosphere: the inside of a slightly larger sphere, brightest at the
  // planet's edge and fading outwards. Normal blending so it also shows up
  // against the light daytime page.
  const atmosphereMat = new ShaderMaterial({
    uniforms: {
      glowColor: { value: new Color() },
      strength: { value: 0.32 },
    },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform vec3 glowColor; uniform float strength;
      varying vec3 vN; varying vec3 vV;
      void main() {
        float d = dot(normalize(vN), normalize(vV));
        float f = pow(clamp(-d / 0.4, 0.0, 1.0), 2.2);
        gl_FragColor = vec4(glowColor, f * strength);
      }`,
    transparent: true,
    depthWrite: false,
    side: BackSide,
    blending: NormalBlending,
  });
  themeColor(atmosphereMat.uniforms.glowColor, "value", "#4f7bb8", "#7fb4ea");
  themeNumber(atmosphereMat.uniforms.strength, "value", 0.32, 0.5);
  scene.add(new Mesh(new SphereGeometry(1.09, 48, 32), atmosphereMat));

  const cityGlow = new PointLight("#ffb454", 1.6, 0.9, 2);
  cityGlow.position.copy(sph(98 * DEG, -20 * DEG)).multiplyScalar(1.12);
  themeNumber(cityGlow, "intensity", 1.6, 0);
  planet.add(cityGlow);

  const waveMat = new LineBasicMaterial({ transparent: true });
  themeColor(waveMat, "color", "#8fb0d6", "#ffffff");
  themeNumber(waveMat, "opacity", 0.35, 0.75);
  planet.add(new LineSegments(buildWaves(rand), waveMat));
  planet.add(
    new Points(
      buildLanes(),
      new PointsMaterial({
        color: "#f4b55b",
        size: 1.6,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.75,
      }),
    ),
  );

  // The walking route, drawn as a dashed line along the path.
  const routePts = [];
  for (let i = 0; i <= 180; i++) {
    const a = (i / 180) * Math.PI * 2;
    routePts.push(
      new Vector3(Math.cos(a), Math.sin(a), 0).multiplyScalar(
        1 + LAND_H + 0.0015,
      ),
    );
  }
  const routeMat = new LineDashedMaterial({
    dashSize: 0.012,
    gapSize: 0.014,
    transparent: true,
  });
  themeColor(routeMat, "color", "#8fb0d6", "#8a7a5a");
  themeNumber(routeMat, "opacity", 0.5, 0.55);
  const route = new Line(
    new BufferGeometry().setFromPoints(routePts),
    routeMat,
  );
  route.computeLineDistances();
  planet.add(route);

  const flyer = buildFlyer(gradientMap, lineMat, glowMat);
  flyer.group.applyMatrix4(surfaceMatrix(132 * DEG, -24 * DEG, 0.3));
  planet.add(flyer.group);

  const vessel = buildVessel(gradientMap, lineMat, glowMat);
  planet.add(vessel);
  const dragonBoat = buildDragonBoat(gradientMap, lineMat);
  planet.add(dragonBoat);

  // Paper plane on a tilted, dashed orbit.
  const orbit = new Group();
  orbit.rotation.set(1.04, 0.08, 0.32);
  scene.add(orbit);
  const orbitR = 1.62;
  const orbitPts = [];
  for (let i = 0; i <= 200; i++) {
    const a = (i / 200) * Math.PI * 2;
    orbitPts.push(new Vector3(Math.cos(a) * orbitR, Math.sin(a) * orbitR, 0));
  }
  const orbitMat = new LineDashedMaterial({
    dashSize: 0.035,
    gapSize: 0.03,
    transparent: true,
  });
  themeColor(orbitMat, "color", "#8fb0d6", "#2c4f7c");
  themeNumber(orbitMat, "opacity", 0.3, 0.3);
  const orbitLine = new Line(
    new BufferGeometry().setFromPoints(orbitPts),
    orbitMat,
  );
  orbitLine.computeLineDistances();
  orbit.add(orbitLine);
  const plane = buildPaperPlane(gradientMap, lineMat);
  const planeHolder = new Group();
  planeHolder.add(plane);
  orbit.add(planeHolder);

  const character = buildCharacter(gradientMap);
  character.root.position.set(0, 1 + LAND_H, 0);
  character.root.scale.setScalar(1.35);
  const shadowMat = character.root.children.find((c) => c.isMesh).material;
  themeColor(shadowMat, "color", "#05080c", "#1d2b3a");
  themeNumber(shadowMat, "opacity", 0.45, 0.22);
  scene.add(character.root);

  const stars = buildStars(rand);
  stars.children.forEach((points) =>
    themeNumber(points.material, "opacity", points.material.opacity, 0),
  );
  scene.add(stars);

  // Moon by night, sun by day. They swap places with a small set and rise.
  const fading = (color, opacity = 1) =>
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    });
  const moon = new Group();
  const moonHaloMat = fading("#8fb0d6", 0.035);
  const moonDiscMat = fading("#dfe7f0");
  const moonShadeMat = fading("#0a0f16");
  const moonHalo = new Mesh(new CircleGeometry(0.6, 40), moonHaloMat);
  moonHalo.position.z = -0.02;
  const moonDisc = new Mesh(new CircleGeometry(0.26, 40), moonDiscMat);
  const moonShade = new Mesh(new CircleGeometry(0.25, 40), moonShadeMat);
  moonShade.position.set(0.1, 0.07, 0.01);
  moon.add(moonHalo, moonDisc, moonShade);
  themeNumber(moonHaloMat, "opacity", 0.035, 0);
  themeNumber(moonDiscMat, "opacity", 1, 0);
  themeNumber(moonShadeMat, "opacity", 1, 0);
  scene.add(moon);

  const sun = new Group();
  const sunHaloMat = fading("#ffe3a1", 0);
  const sunDiscMat = fading("#ffd166", 0);
  const sunRayMat = new LineBasicMaterial({
    color: "#f2a93b",
    transparent: true,
    opacity: 0,
  });
  const sunHalo = new Mesh(new CircleGeometry(0.62, 48), sunHaloMat);
  sunHalo.position.z = -0.02;
  const sunDisc = new Mesh(new CircleGeometry(0.27, 48), sunDiscMat);
  const rays = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    rays.push(
      Math.cos(a) * 0.36,
      Math.sin(a) * 0.36,
      0.01,
      Math.cos(a) * 0.5,
      Math.sin(a) * 0.5,
      0.01,
    );
  }
  const rayGeo = new BufferGeometry();
  rayGeo.setAttribute("position", new Float32BufferAttribute(rays, 3));
  const sunRays = new LineSegments(rayGeo, sunRayMat);
  sun.add(sunHalo, sunDisc, sunRays);
  themeNumber(sunHaloMat, "opacity", 0, 0.22);
  themeNumber(sunDiscMat, "opacity", 0, 1);
  themeNumber(sunRayMat, "opacity", 0, 0.9);
  scene.add(sun);
  const skyAnchor = new Vector3();

  function applyTheme(k) {
    for (const t of themed) {
      if (t.night instanceof Color) t.obj[t.key].lerpColors(t.night, t.day, k);
      else t.obj[t.key] = t.night + (t.day - t.night) * k;
    }
    for (const geo of [terrainGeo, propsGeo]) {
      const attr = geo.attributes.color;
      const { night, day: dayArr } = geo.userData;
      for (let i = 0; i < attr.array.length; i++)
        attr.array[i] = night[i] + (dayArr[i] - night[i]) * k;
      attr.needsUpdate = true;
    }
    // The moon sets as the sun rises from below the same spot.
    moon.position.copy(skyAnchor).y -= k * 1.1;
    sun.position.copy(skyAnchor).y -= (1 - k) * 1.1;
    moon.visible = k < 0.999;
    sun.visible = k > 0.001;
  }

  /* ---------------- state ---------------- */
  const BASE_SPEED = reducedMotion ? 0 : 0.085; // rad/s, ground moves left
  const AXIS_Z = new Vector3(0, 0, 1);
  const AXIS_X = new Vector3(1, 0, 0);
  const qStep = new Quaternion();
  const qInverse = new Quaternion();
  const under = new Vector3();
  planet.quaternion.setFromAxisAngle(AXIS_Z, -0.62);
  let spin = BASE_SPEED; // about the view axis: the walker's direction
  let tilt = 0; // about the horizontal axis: tumbles the world towards you
  let scrollBoost = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let lastMoveTime = 0;
  let walkPhase = 0;
  let facing = 0;
  let walkerY = 1 + LAND_H;
  let boatPhase = 1;
  // Reduced motion shows one still frame with every labelled landmark in view.
  let time = reducedMotion ? 0.5 : 0;
  let timeScale = 1;
  let pauseTarget = 1;
  let dayTarget = day ? 1 : 0;
  let dayProgress = dayTarget;
  let running = false;
  let rafId = 0;
  let lastT = 0;
  let width = 1;
  let height = 1;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const anchors = [
    { id: "boat", obj: dragonBoat, lift: 0.02 },
    { id: "vessel", obj: vessel, lift: 0.03 },
    { id: "plane", obj: plane, lift: 0 },
  ];
  const tmp = new Vector3();
  const tmpN = new Vector3();
  const toCam = new Vector3();

  function frameCamera() {
    const aspect = width / height;
    camera.aspect = aspect;
    const vHalf = (camera.fov * DEG) / 2;
    const hHalf = Math.atan(Math.tan(vHalf) * aspect);
    const fitRadius = 1.52;
    const dist = fitRadius / Math.sin(Math.min(vHalf, hHalf));
    const elev = 9 * DEG;
    camera.userData.base = new Vector3(
      0,
      Math.sin(elev) * dist,
      Math.cos(elev) * dist,
    ).add(target);
    camera.updateProjectionMatrix();
    // Moon and sun sit in the upper left of the frame, far behind the planet.
    camera.position.copy(camera.userData.base);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    const ray = new Vector3(-0.66, 0.7, 0.5)
      .unproject(camera)
      .sub(camera.position)
      .normalize();
    skyAnchor.copy(camera.position).addScaledVector(ray, 16);
    moon.lookAt(camera.position);
    sun.lookAt(camera.position);
    applyTheme(ease(dayProgress));
  }

  function ease(x) {
    return x * x * (3 - 2 * x);
  }

  function resize(w, h) {
    width = Math.max(1, w);
    height = Math.max(1, h);
    const dpr = Math.min(window.devicePixelRatio || 1, width < 600 ? 1.75 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    frameCamera();
    requestRender();
  }

  function rotateWorld(aboutZ, aboutX) {
    if (aboutZ) {
      qStep.setFromAxisAngle(AXIS_Z, aboutZ);
      planet.quaternion.premultiply(qStep);
    }
    if (aboutX) {
      qStep.setFromAxisAngle(AXIS_X, aboutX);
      planet.quaternion.premultiply(qStep);
    }
    planet.quaternion.normalize();
  }

  function updateMovers(t) {
    // Vessel loops around the big sea.
    const wV = 0.1;
    const vPhi = 200 * DEG + 30 * DEG * Math.cos(wV * t);
    const vPsi = 25 * DEG + 4 * DEG * Math.sin(wV * t);
    const vHead = Math.atan2(
      4 * Math.cos(wV * t),
      -30 * Math.sin(wV * t) * Math.cos(vPsi),
    );
    placeMover(vessel, vPhi, vPsi, vHead, 0.001 + Math.sin(t * 1.6) * 0.0012);
    vessel.rotateX(Math.sin(t * 1.3) * 0.04);

    // Dragon boat laps the reservoir course, surging on every stroke.
    const bPhi = -60 * DEG + 24 * DEG * Math.cos(boatPhase);
    const bPsi = 56 * DEG + 2.6 * DEG * Math.sin(boatPhase);
    const bHead = Math.atan2(
      2.6 * Math.cos(boatPhase),
      -24 * Math.sin(boatPhase) * Math.cos(bPsi),
    );
    placeMover(dragonBoat, bPhi, bPsi, bHead, 0.001);

    flyer.wheel.rotation.z = -t * 0.12;
    sunRays.rotation.z = t * 0.05;

    const a = t * 0.24 + 2.2;
    planeHolder.position.set(Math.cos(a) * orbitR, Math.sin(a) * orbitR, 0);
    planeHolder.rotation.set(Math.PI / 2, 0, a + Math.PI / 2, "ZYX");
    plane.rotation.x = Math.sin(t * 1.4) * 0.25;
  }

  function updateCharacter(dt) {
    // Walk towards wherever the ground under the walker is coming from.
    const speed = Math.hypot(spin, tilt);
    const pace = Math.min(speed / 0.085, 3.2);
    walkPhase += dt * (4.2 + pace * 2.2) * Math.min(pace, 1);
    const swing = Math.min(0.62, 0.45 * pace);
    const s = Math.sin(walkPhase);
    character.legL.rotation.z = s * swing;
    character.legR.rotation.z = -s * swing;
    character.armL.rotation.z = -s * swing * 0.8;
    character.armR.rotation.z = s * swing * 0.8;
    character.body.position.y =
      Math.abs(Math.cos(walkPhase)) * 0.003 * Math.min(pace, 1.5);
    if (speed > 0.01) {
      const want = Math.atan2(tilt, spin);
      facing += wrapAngle(want - facing) * (1 - Math.exp(-dt * 10));
    }
    character.root.rotation.y = facing;

    // Stand on whatever terrain is underfoot; wade when it is water.
    qInverse.copy(planet.quaternion).invert();
    under.set(0, 1, 0).applyQuaternion(qInverse);
    const ground = terrain(under);
    const groundY = 1 + ground.h - (ground.sea > 0.5 ? 0.012 : 0);
    walkerY += (groundY - walkerY) * (dt ? 1 - Math.exp(-dt * 12) : 1);
    character.root.position.y = walkerY;
  }

  const centre = new Vector3();
  function projectAnchors() {
    if (!onFrame) return;
    centre.set(0, 0, 0).project(camera);
    const out = anchors.map((a) => {
      a.obj.getWorldPosition(tmp);
      let visible;
      if (a.id === "plane") {
        // occluded when the planet sits between camera and plane
        const dir = toCam.copy(tmp).sub(camera.position);
        const len = dir.length();
        dir.divideScalar(len);
        const oc = tmpN.copy(camera.position).negate();
        const along = oc.dot(dir);
        const closest = oc.lengthSq() - along * along;
        const hit = along > 0 && along < len && closest < 1.02 * 1.02;
        visible = hit ? 0 : 1;
      } else {
        tmpN.copy(tmp).normalize();
        toCam.copy(camera.position).sub(tmp).normalize();
        visible = smoothstep(-0.02, 0.22, tmpN.dot(toCam));
        tmp.addScaledVector(tmpN, a.lift);
      }
      tmp.project(camera);
      return {
        id: a.id,
        x: (tmp.x * 0.5 + 0.5) * width,
        y: (-tmp.y * 0.5 + 0.5) * height,
        visible,
      };
    });
    onFrame(out, {
      x: (centre.x * 0.5 + 0.5) * width,
      y: (-centre.y * 0.5 + 0.5) * height,
    });
  }

  function render(dt) {
    timeScale += (pauseTarget - timeScale) * (1 - Math.exp(-dt * 5));
    scrollBoost *= Math.exp(-dt * 2.5);
    if (!dragging) {
      const settle = 1 - Math.exp(-dt * (pauseTarget ? 1.1 : 5));
      spin += (BASE_SPEED * timeScale + scrollBoost - spin) * settle;
      tilt *= Math.exp(-dt * 1.6);
    }
    rotateWorld(spin * dt, tilt * dt);
    boatPhase += dt * timeScale * 0.32 * (1 + 0.55 * Math.sin(time * 6.2));

    if (dayProgress !== dayTarget) {
      const step = dt / 1.4;
      dayProgress =
        dayTarget > dayProgress
          ? Math.min(dayTarget, dayProgress + step)
          : Math.max(dayTarget, dayProgress - step);
      applyTheme(ease(dayProgress));
    }

    updateMovers(time);
    updateCharacter(dt);

    // Pointer parallax on a soft spring.
    pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt * 3));
    pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt * 3));
    camera.position.copy(camera.userData.base);
    camera.position.x += pointer.sx * 0.28;
    camera.position.y += pointer.sy * 0.18;
    camera.lookAt(target);
    stars.rotation.y = pointer.sx * 0.02;

    renderer.render(scene, camera);
    projectAnchors();
  }

  function isSettled() {
    return (
      reducedMotion &&
      !dragging &&
      Math.abs(spin) < 0.0005 &&
      Math.abs(tilt) < 0.0005
    );
  }

  function loop(now) {
    const t = now / 1000;
    const dt = lastT ? Math.min(0.05, t - lastT) : 0.016;
    lastT = t;
    if (!reducedMotion) time += dt * timeScale;
    render(dt);
    if (isSettled()) {
      running = false;
      lastT = 0;
      return;
    }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    lastT = 0;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  function requestRender() {
    if (!running) {
      render(0);
    }
  }

  /* ---------------- input ---------------- */
  // Drag in any direction: sideways spins the world under the walker,
  // up and down tumbles it towards or away from you.
  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    lastMoveTime = performance.now();
    canvas.setPointerCapture?.(e.pointerId);
    start();
  }

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.y = ((e.clientY - rect.top) / rect.height - 0.5) * -2;
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const dtm = Math.max(1, now - lastMoveTime) / 1000;
    lastX = e.clientX;
    lastY = e.clientY;
    lastMoveTime = now;
    const radPerPx = 2.2 / Math.max(240, rect.width);
    rotateWorld(-dx * radPerPx, dy * radPerPx);
    spin = clamp((-dx * radPerPx) / dtm, -3, 3);
    tilt = clamp((dy * radPerPx) / dtm, -3, 3);
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    canvas.releasePointerCapture?.(e.pointerId);
    // A drag that stopped before release should not fling the world.
    if (performance.now() - lastMoveTime > 80) {
      spin = BASE_SPEED;
      tilt = 0;
    }
  }

  function onPointerLeave() {
    pointer.x = 0;
    pointer.y = 0;
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerLeave);

  function dispose() {
    stop();
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    canvas.removeEventListener("pointerleave", onPointerLeave);
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];
        mats.forEach((m) => m.dispose());
      }
    });
    gradientMap.dispose();
    renderer.dispose();
  }

  return {
    resize,
    start: () => (reducedMotion ? requestRender() : start()),
    stop,
    dispose,
    setPaused(paused) {
      pauseTarget = paused ? 0 : 1;
    },
    // Page scroll speed (px/s) briefly speeds the walk up.
    nudge(velocity) {
      if (reducedMotion || !running) return;
      scrollBoost = clamp(velocity / 2600, -1.1, 1.1);
    },
    setDay(isDay) {
      dayTarget = isDay ? 1 : 0;
      if (reducedMotion || !running) {
        dayProgress = dayTarget;
        applyTheme(dayProgress);
        requestRender();
      }
    },
  };
}
