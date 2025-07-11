// === Improved Aim Assist Script for Shadowrocket ===

const url = $request.url;

// === Optimized Utility Functions ===
function expandKeys(obj) {
  const result = {};
  const cache = new Map();

  for (const key in obj) {
    if (cache.has(key)) continue;

    const parts = key.split('.');
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) current[part] = {};
      current = current[part];
    }

    current[parts[parts.length - 1]] = obj[key];
    cache.set(key, true);
  }

  return result;
}

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      target[key] = target[key] || {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// === Enhanced Vector3 Class ===
class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  static normalize(v) {
    const mag = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return mag === 0 ? new Vector3(0, 0, 0) : new Vector3(v.x / mag, v.y / mag, v.z / mag);
  }

  static subtract(a, b) {
    return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  static add(a, b) {
    return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
  }

  static multiplyScalar(v, s) {
    return new Vector3(v.x * s, v.y * s, v.z * s);
  }

  static lerp(a, b, t) {
    return new Vector3(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t,
      a.z + (b.z - a.z) * t
    );
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalized() {
    const mag = this.magnitude();
    return mag === 0 ? new Vector3(0, 0, 0) : new Vector3(this.x / mag, this.y / mag, this.z / mag);
  }
}

// === Enhanced Bone Configuration ===
const BONE_HEAD_CONFIG = {
  name: "bone_Head",
  offset: new Vector3(-0.0456970781, -0.004478302, -0.0200432576),
  position: new Vector3(-0.0456970781, -0.004478302, -0.0200432576),
  rotation: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
  scale: { x: 0.99999994, y: 1.00000012, z: 1.0 },
  radius: 0.028,
  lockRadius: 360.0,
  priority: 1.0
};

// === Enhanced Weapon Profiles ===
const WEAPON_PROFILES = {
  default: { trackingSpeed: 15.0, flickSpeed: 1.6, recoilX: 0.08, recoilY: 0.25 },
  m1887: { trackingSpeed: 20.0, flickSpeed: 1.7, snapBias: 1.35, pullStrength: 1.35, recoilX: 0.1, recoilY: 0.35 },
  mp40: { trackingSpeed: 19.5, flickSpeed: 1.68, recoilX: 0.08, recoilY: 0.25 },
  ak: { trackingSpeed: 15.2, flickSpeed: 1.55, recoilX: 0.1, recoilY: 0.35 },
  scar: { trackingSpeed: 15.0, flickSpeed: 1.52, recoilX: 0.095, recoilY: 0.33 },
  awm: { trackingSpeed: 10.5, flickSpeed: 1.37, recoilX: 0.12, recoilY: 0.42 },
  m82b: { trackingSpeed: 10.0, flickSpeed: 1.35, recoilX: 0.13, recoilY: 0.45 }
};

// === Aim Assist Engine ===
class AimAssistEngine {
  constructor(config = {}) {
    this.config = {
      maxRange: config.maxRange || 999.0,
      aimSpeed: config.aimSpeed || 10.0,
      snapThreshold: config.snapThreshold || 0.1,
      predictionFactor: config.predictionFactor || 0.18,
      smoothingFactor: config.smoothingFactor || 0.85,
      ...config
    };
    this.currentTarget = null;
    this.lastUpdate = 0;
    this.aimHistory = [];
  }

  findOptimalTarget(enemies, playerPosition) {
    let bestTarget = null;
    let bestScore = -1;

    for (const enemy of enemies) {
      if (!enemy.bone_Head) continue;
      const distance = Vector3.distance(playerPosition, enemy.bone_Head);
      if (distance > this.config.maxRange) continue;
      const score = this.calculateTargetScore(enemy, playerPosition, distance);
      if (score > bestScore) {
        bestScore = score;
        bestTarget = enemy;
      }
    }

    return bestTarget;
  }

  calculateTargetScore(enemy, playerPosition, distance) {
    const distanceScore = Math.max(0, 1 - distance / this.config.maxRange);
    const visibilityScore = this.isTargetVisible(enemy, playerPosition) ? 1.0 : 0.5;
    return distanceScore * visibilityScore;
  }

  isTargetVisible(enemy, playerPosition) {
    const distance = Vector3.distance(playerPosition, enemy.bone_Head);
    return distance < this.config.maxRange * 999.0;
  }

  calculateAimPosition(enemy, weapon = 'default') {
    if (!enemy || !enemy.bone_Head) return null;
    const basePosition = Vector3.add(enemy.bone_Head, BONE_HEAD_CONFIG.offset);
    if (enemy.velocity) {
      const prediction = Vector3.multiplyScalar(enemy.velocity, this.config.predictionFactor);
      return Vector3.add(basePosition, prediction);
    }
    return basePosition;
  }

  smoothAimTransition(currentAim, targetAim, deltaTime) {
    const smoothingFactor = this.config.smoothingFactor * deltaTime;
    return Vector3.lerp(currentAim, targetAim, smoothingFactor);
  }

  applyMagneticSnap(currentAim, targetAim, distance) {
    if (distance < BONE_HEAD_CONFIG.lockRadius) return targetAim;
    if (distance < BONE_HEAD_CONFIG.lockRadius * 360) {
      const snapStrength = 1.0 - (distance / (BONE_HEAD_CONFIG.lockRadius * 360));
      return Vector3.lerp(currentAim, targetAim, snapStrength);
    }
    return currentAim;
  }

  applyRecoilCompensation(weapon = 'default') {
    const profile = WEAPON_PROFILES[weapon] || WEAPON_PROFILES.default;
    return new Vector3(-profile.recoilX, -profile.recoilY, 0);
  }

  update(enemies, playerPosition, currentAim, weapon = 'default', deltaTime = 0.016) {
    const target = this.findOptimalTarget(enemies, playerPosition);
    if (!target) return currentAim;

    const targetAim = this.calculateAimPosition(target, weapon);
    if (!targetAim) return currentAim;

    const distance = Vector3.distance(currentAim, targetAim);
    let newAim = this.applyMagneticSnap(currentAim, targetAim, distance);
    newAim = this.smoothAimTransition(currentAim, newAim, deltaTime);

    this.currentTarget = target;

    return newAim;
  }
}

// === Shadowrocket API Config Patch ===
if (url.includes("/api/config") || url.includes("/api/aim")) {
  const aimEngine = new AimAssistEngine({
    maxRange: 999.0,
    aimSpeed: 15.0,
    snapThreshold: 0.1,
    predictionFactor: 0.18,
    smoothingFactor: 0.85
  });

  const dotNotationConfig = JSON.parse(`{
    "input_lock_on_precision_mode": "head_3d_tracking",
    "input_lock_on_track_velocity": true,
    "input_lock_on_rotation_tracking": true,
    "input_lock_on_predict_movement": true,
    "input_lock_on_keep_xy": true,
    "input_lock_on_offset_x": ${BONE_HEAD_CONFIG.offset.x},
    "input_lock_on_offset_y": ${BONE_HEAD_CONFIG.offset.y},
    "input_lock_on_offset_z": ${BONE_HEAD_CONFIG.offset.z},
    "fire.gesture.drag_assist": true,
    "fire.gesture.drag_force_multiplier": 4.0,
    "fire.gesture.input_response_speed": 98.0,
    "fire.gesture.velocity_amplifier": 1.75,
    "fire.gesture.drag_consistency": 1.0,
    "fire.gesture.drag_response_speed": 999.0
  }`);

  const expandedConfig = expandKeys(dotNotationConfig);
  const finalConfig = deepMerge({}, expandedConfig);

  finalConfig.metadata = {
    version: "2.0.0",
    optimized: true,
    timestamp: Date.now(),
    features: ["enhanced_tracking", "magnetic_snap", "recoil_compensation", "predictive_aim"]
  };

  $done({ body: JSON.stringify(finalConfig) });
} else {
  $done({});
}

// === Optional: Export for Node.js environment (not used in Shadowrocket) ===
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AimAssistEngine,
    Vector3,
    BONE_HEAD_CONFIG,
    WEAPON_PROFILES
  };
}
