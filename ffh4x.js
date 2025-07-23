if (typeof $request !== 'undefined') {
  try {
    const body = JSON.parse($request.body || '{}');

    // Khởi tạo player (vị trí gốc và hướng nhìn mặc định)
    const player = new Player(new Vector3(0, 0, 0), new Vector3(0, 0, 1));

    // Lấy dữ liệu enemy từ body request
    const enemyData = body.enemy || {};
    const boneData = body.bone || {};

    // Tạo đối tượng Enemy từ dữ liệu nhận được
    const enemy = new Enemy(
      new Vector3(enemyData.position?.x || 0, enemyData.position?.y || 0, enemyData.position?.z || 0),
      new Vector3(enemyData.velocity?.x || 0, enemyData.velocity?.y || 0, enemyData.velocity?.z || 0),
      enemyData.visible || false,
      enemyData.distance || 0,
      enemyData.angle || 0,
      enemyData.height || 0.00907892
    );

    // Khởi tạo engine với cấu hình đã khai báo
    const aimLockEngine = new AimLockEngine(aimConfig);

    // Tính toán vị trí aim lock với bone head data nếu có
    const target = aimLockEngine.aimHeadLock(player, enemy, 'm1887', boneData);

    // Tính flick target (nhắm nhanh headshot)
    const flick = aimLockEngine.flickHeadshot(enemy, 'm1887', boneData);

    // Tính recoil offset
    const recoilOffset = aimLockEngine.recoilCompensation('m1887');

    // Trả về JSON cho game hoặc client
    $done({
      body: JSON.stringify({
        aimTarget: target,
        flickTarget: flick,
        recoilOffset: recoilOffset
      })
    });

  } catch (e) {
    // Nếu lỗi thì trả về mặc định
    $done({ body: '{}' });
  }
} else {
  // Không phải request (ví dụ run test) thì trả rỗng
  $done({});
}


// === Các hàm tiện ích ===
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



// === Vector3 Class (Enhanced) ===
class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;
  }

  static distance(a, b) {
    return Math.sqrt(
      (a.x - b.x) ** 2 +
      (a.y - b.y) ** 2 +
      (a.z - b.z) ** 2
    );
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

// === Player Class ===
class Player {
  constructor(position, forward) {
    this.position = position;
    this.forward = Vector3.normalize(forward);
    this.fps_stable = true;
  }

  rotateTowards(targetDir, t) {
    const lerp = new Vector3(
      this.forward.x + (targetDir.x - this.forward.x) * t,
      this.forward.y + (targetDir.y - this.forward.y) * t,
      this.forward.z + (targetDir.z - this.forward.z) * t
    );
    this.forward = Vector3.normalize(lerp);
  }
}

// === Enemy Class ===
class Enemy {
  constructor(position, velocity, visible, distance, angle, height = 1.7) {
    this.position = position;
    this.velocity = velocity;
    this.visible = visible;
    this.distance = distance;
    this.angle = angle;
    this.height = height;
  }
}

// === Bone Head Config ===
const BONE_HEAD_CONFIG = {
  offset: new Vector3(-0.0456970781, -0.004478302, -0.0200432576),
  rotation: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
  scale: { x: 0.99999994, y: 1.00000012, z: 1.0 },
  lockRadius: 360.0
};

// === Weapon Profiles ===
const weaponProfiles = {
  default: { tracking_speed: 15.5 },
  m1887: { tracking_speed: 15.8, flick_speed: 1.0 },
  mp40: { tracking_speed: 14.9, flick_speed: 1.0 },
  ump: { tracking_speed: 13.7, flick_speed: 1.0 },
  m1014: { tracking_speed: 12.5, flick_speed: 1.0 },
  de: { tracking_speed: 15.3, flick_speed: 1.0 },
  m590: { tracking_speed: 14.5, flick_speed: 1.0 }
};

// === AimLockEngine Class ===
class AimLockEngine {
  constructor(config) {
    this.config = config;
  }

  isTargetValid(enemy, playerState) {
    return (
      enemy.visible &&
      this._inLineOfSight(enemy, playerState) &&
      this._inFov(enemy, playerState) &&
      playerState.fps_stable
    );
  }

  _inLineOfSight(enemy, playerState) {
    return true; // You can add raycast or LOS check here
  }

  _inFov(enemy, playerState) {
    const fov = this.config.auto_fov.dynamic_adjust
      ? this._adjustFov(enemy.distance)
      : this.config.auto_fov.max;
    return enemy.angle <= fov;
  }

  _adjustFov(distance) {
    if (distance < 10) return 360.0;
    if (distance < 20) return 360.0;
    if (distance < 999) return 360.0;
    return 360.0;
  }

  calculateHeadLockOffset(enemy, weaponType) {
    const profile = this.config.weapon_profiles[weaponType] || this.config.weapon_profiles.default;
    const offset = this.config.math.predictive_offset;
    const lockBias = this.config.headlock.biasFactor;

    return {
      x: enemy.velocity.x * offset * profile.tracking_speed * lockBias,
      y: enemy.velocity.y * offset * profile.tracking_speed * lockBias,
      z: enemy.velocity.z * offset * profile.tracking_speed * lockBias +
         (enemy.height * this.config.headlock.lockHeightRatio)
    };
  }

  aimHeadLock(player, enemy, weaponType, boneData = null) {
    if (!this.isTargetValid(enemy, player)) return null;

    let basePos = new Vector3(enemy.position.x, enemy.position.y, enemy.position.z);
    if (boneData && boneData.position) {
      basePos = new Vector3(boneData.position.x, boneData.position.y, boneData.position.z);
      // Optionally use rotation and scale for advanced adjustment here
    }
    const offset = this.calculateHeadLockOffset(enemy, weaponType);

    return {
      x: basePos.x + offset.x + (BONE_HEAD_CONFIG.offset.x || 0),
      y: basePos.y + offset.y + (BONE_HEAD_CONFIG.offset.y || 0),
      z: basePos.z + offset.z + (BONE_HEAD_CONFIG.offset.z || 0)
    };
  }
aimHeadLock(player, enemy, weaponType, boneData = null) {
  if (!this.isTargetValid(enemy, player)) return null;

  let basePos = new Vector3(enemy.position.x, enemy.position.y, enemy.position.z);
  if (boneData && boneData.position) {
    basePos = new Vector3(boneData.position.x, boneData.position.y, boneData.position.z);
  }

  const offset = this.calculateHeadLockOffset(enemy, weaponType);

  // Tính vị trí đích đầy đủ
  let finalTarget = new Vector3(
    basePos.x + offset.x + (BONE_HEAD_CONFIG.offset.x || 0),
    basePos.y + offset.y + (BONE_HEAD_CONFIG.offset.y || 0),
    basePos.z + offset.z + (BONE_HEAD_CONFIG.offset.z || 0)
  );

  // ✅ Kẹp (clamp) nếu vượt quá lockRadius
  const distanceToHead = Vector3.distance(basePos, finalTarget);
  const maxLockRadius = BONE_HEAD_CONFIG.lockRadius || 360.0;

  if (distanceToHead > maxLockRadius) {
    const direction = Vector3.subtract(finalTarget, basePos).normalized();
    finalTarget = Vector3.add(basePos, Vector3.multiplyScalar(direction, maxLockRadius));
  }

  return {
    x: finalTarget.x,
    y: finalTarget.y,
    z: finalTarget.z
  };
}
  flickHeadshot(enemy, weaponType, boneData = null) {
    const profile = this.config.weapon_profiles[weaponType] || {};
    const flickSpeed = profile.flick_speed || 1.0;

    let baseZ = enemy.position.z + enemy.height * 1.70;
    if (boneData && boneData.position) {
      baseZ = boneData.position.z + enemy.height * 1.70;
    }

    return {
      x: enemy.position.x,
      y: enemy.position.y,
      z: baseZ + Math.random() * 0.01 * flickSpeed
    };
  }

  recoilCompensation(weaponType) {
    const recoil = this.config.recoil[weaponType] || { x: 0, y: 0 };
    return {
      x: -recoil.x,
      y: -recoil.y
    };
  }
}

// === Full Config ===
const aimConfig = {
  fake_screen: {
    resolution: "3840x2160",
    dpi: 3600,
    sensitivity_multiplier: 6.8
  },
  auto_fov: {
    dynamic_adjust: true,
    max: 360.0
  },
  math: {
    predictive_offset: 0.18
  },
  headlock: {
    enabled: true,
    biasFactor: 5.0,
    lockHeightRatio: 0.0001,
    crosshairMagnetism: true,
    adaptiveRange: true,
    distanceCompensation: true,
    velocityAdaption: true
  },
  weapon_profiles: weaponProfiles,
  recoil: {
    m1887: { x: 0.0, y: 0.0 },
    mp40: { x: 0.0, y: 0.0 },
    ump: { x: 0.0, y: 0.0 },
    m1014: { x: 0.0, y: 0.0 },
    de: { x: 0.0, y: 0.0 },
    m590: { x: 0.0, y: 0.0 }
  }
};
const GamePackages = {
  GamePackage1: "com.dts.freefireth",
  GamePackage2: "com.dts.freefiremax"
};
// === AimAssistEngine Class (Kết hợp thêm predictive và smoothing) ===
class AimAssistEngine {
  constructor(config = {}) {
    this.config = {
      maxRange: config.maxRange || 999.0,
      aimSpeed: config.aimSpeed || 10.0,
      snapThreshold: config.snapThreshold || 0.001,
      predictionFactor: config.predictionFactor || 0.0001,
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
    // Placeholder for LOS or visibility logic
    const distance = Vector3.distance(playerPosition, enemy.bone_Head);
    return distance < this.config.maxRange;
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
  const maxRadius = BONE_HEAD_CONFIG.lockRadius;

  if (distance <= maxRadius) {
    // ✅ Trường hợp tâm đã nằm trong lockRadius → nhắm thẳng
    return targetAim;
  }

  if (distance <= maxRadius * 360) {
    // ✅ Trường hợp trong vùng ảnh hưởng kéo (snap zone)
    const snapStrength = 1.0 - (distance / (maxRadius * 360));
    return Vector3.lerp(currentAim, targetAim, snapStrength);
  }

  // ✅ Trường hợp vượt xa — chỉ kéo đến sát biên headlock
  const dir = Vector3.subtract(targetAim, currentAim).normalized();
  return Vector3.add(currentAim, Vector3.multiplyScalar(dir, maxRadius));
}

  applyRecoilCompensation(weapon = 'default') {
    const profile = weaponProfiles[weapon] || weaponProfiles.default;
    return new Vector3(-profile.recoilX || 0, -profile.recoilY || 0, 0);
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

// === Shadowrocket config patch for API URLs ===

const url = $request.url;
if (url.includes("/api/config") || url.includes("/api/aim")) {
  const aimEngine = new AimAssistEngine({
    maxRange: 999.0,
    aimSpeed: 50.0,
    snapThreshold: 0.001,
    predictionFactor: 0.018,
    smoothingFactor: 10.0
  });

const dotNotationConfig = {
  "input_lock_on_precision_mode": "head_3d_tracking",
  "input_lock_on_track_velocity": true,
  "input_lock_on_rotation_tracking": true,
  "input_lock_on_predict_movement": true,
  "input_lock_on_keep_xy": true,
  "input_lock_on_offset_x": BONE_HEAD_CONFIG.offset.x,
  "input_lock_on_offset_y": BONE_HEAD_CONFIG.offset.y,
  "input_lock_on_offset_z": BONE_HEAD_CONFIG.offset.z,

  // 🎯 Vuốt chính xác & phản hồi nhanh
  "fire.gesture.drag_assist": true,
  "fire.gesture.drag_force_multiplier": 40.0,
  "fire.gesture.input_response_speed": 999.0,
  "fire.gesture.velocity_amplifier": 10.75,
  "fire.gesture.drag_consistency": 10.0,
  "fire.gesture.drag_response_speed": 999.0,
  "fire.gesture.input_delay": 0,
  "fire.gesture.touch_latency": 0,
  "fire.gesture.drag_input_buffer": 0,
  "fire.gesture.touch_response_override": true,
  // 🔥 Tăng lực drag nút bắn
  "fire.button.drag_boost": true,
  "fire.button.drag_multiplier": 10.5,
  "fire.button.drag_response_speed": 9999.0,
  "fire.button.lock_on_strength": 10.0,
  "fire.button.drag_assist_zone": "full",  // toàn vùng nút bắn có hiệu lực kéo
  "fire.button.drag_sensitivity_boost": 10.0,
  "fire.button.aim_response_acceleration": 10.0,
  // 📱 Nhạy tâm ngắm & vuốt màn hình
  "screen.touch.drag_sensitivity": 10.0,
  "screen.touch.smoothing": 1.0,
  "screen.touch.precision_lock_threshold": 0.0001,
  "screen.touch.adaptive_speed": true,
  "screen.touch.speed_min": 0.0001,
  "screen.touch.speed_max": 0.0035,
  "aimHeadLock.aimBone": "bone_Head",
  "aimHeadLock.autoLock": true,
  "aimHeadLock.lockInjection": true,
  "aimHeadLock.lockStrength": "maximum",
  "aimHeadLock.snapBias": 10.0,
  "aimHeadLock.trackingSpeed": 10.0,
  "aimHeadLock.dragCorrectionSpeed": 10.0,
  "aimHeadLock.snapToleranceAngle": 11.5,
  "aimHeadLock.maxLockAngle": 360,
  "aimHeadLock.stickiness": "high",
  "aimHeadLock.headStickPriority": true,

  // 🧠 Dữ liệu xương Head
  "aimHeadLock.boneHead_position_x": -0.0456970781,
  "aimHeadLock.boneHead_position_y": -0.004478302,
  "aimHeadLock.boneHead_position_z": -0.0200432576,

  "aimHeadLock.boneHead_rotation_x": 0.0258174837,
  "aimHeadLock.boneHead_rotation_y": -0.08611039,
  "aimHeadLock.boneHead_rotation_z": -0.1402113,
  "aimHeadLock.boneHead_rotation_w": 0.9860321,

  "aimHeadLock.boneHead_scale_x": 0.99999994,
  "aimHeadLock.boneHead_scale_y": 1.00000012,
  "aimHeadLock.boneHead_scale_z": 1.0,
  // 🧠 Nhạy mục tiêu headlock
  "aim.headlock.lock_radius_limit": true,
  "aim.headlock.lock_radius_max": 360.0,
  "aim.headlock.snap_strength": 10.0,
  "aim.headlock.smooth_factor": 0.7,
  "aim.headlock.auto_adjust": true,
  "aim.headlock.offset_neck_bias": 0.015
};
const GamePackages = {
  GamePackage1: "com.dts.freefireth",
  GamePackage2: "com.dts.freefiremax"
};
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

// === Optional: Node.js export for testing ===
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AimAssistEngine,
    AimLockEngine,
    Vector3,
    Player,
    Enemy,
    BONE_HEAD_CONFIG,
    weaponProfiles
  };
}
