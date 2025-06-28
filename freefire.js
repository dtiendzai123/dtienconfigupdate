const url = $request.url;

function expandKeys(obj) {
  const result = {};
  for (const key in obj) {
    const parts = key.split('.');
    let cur = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        cur[part] = obj[key];
      } else {
        if (!cur[part]) cur[part] = {};
        cur = cur[part];
      }
    }
  }
  return result;
}

function deepMerge(target, source) {
  for (const key in source) {
    if (
      source[key] && typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

if (url.includes("/api/config") || url.includes("/api/aim")) {
  const customConfig = {
    hitdetect: {
      collider: {
        enabled: true,
        zone: "head_bounds",
        custom_head_region: true,
        head_bounds: {
          radius: 0.035,
          height: 0.075,
          center: {
            x: -0.0456970781,
            y: -0.004478302,
            z: -0.0200432576
          }
        }
      },
      target_priority_bone: "head_joint",
      exclude_bone_regions: [
        "spine_lower", "pelvis", "chest", "shoulder_l", "shoulder_r"
      ],
      fov_based_filter: true,
      max_fov_angle: 360.0,
      precise_headbox: {
        enabled: true,
        bounds: {
          shape: "capsule",
          center: {
            x: -0.0456970781,
            y: -0.004478302,
            z: -0.0200432576
          },
          radius: 0.028,
          height: 0.066
        }
      },
      accuracy_threshold: 0.98,
      obstruction_check: true,
      force_reselect_on_obstruct: true,
      snap_to_head_on_drift: true,
      snap_correction_speed: 99.9,
      lock_weighting_system: {
        "bone:head_joint": 1.0,
        "bone:neck_upper": 0.15,
        "bone:chest": 0.0
      }
    },
    aimlock: {
      enabled: true,
      target_bone: "head_joint",
      auto_trigger: true,
      activation_radius: 360.0,
      tracking_mode: "3d_bone_xyz",
      stickiness: 5.0,
      stick_duration: 999.0,
      snap_to_target_on_deviation: true,
      deviation_threshold: 0.0001,
      snap_speed: 99.9,
      continuous_lock: {
        enabled: true,
        zone: "head_box",
        priority_bone: "head_joint",
        fallback_enabled: true
      },
      stick_to_bone: true,
      flexible_lock: {
        enabled: true,
        allow_outside_zone: true
      },
      continue_tracking_on_miss: true,
      tracking_target_bone: "head_joint",
      snap_back_on_approximate: true,
      snap_threshold: 0.1,
      rotation_sync_from_bone: true,
      rotation_sync_target: "head_joint",
      rotation_sync_strength: 1.0,
      magnetic_center_pull: true,
      magnetic_pull_strength: 0.94,
      center_stick_duration: 999.0,
      head_bone_structure: {
        position: {
          x: -0.0456970781,
          y: -0.004478302,
          z: -0.0200432576
        },
        rotation: {
          x: 0.0258174837,
          y: -0.08611039,
          z: -0.1402113,
          w: 0.9860321
        },
        scale: {
          x: 0.99999994,
          y: 1.00000012,
          z: 1.0
        }
      },
      head_center_reference: {
        x: -0.015870847,
        y: 1.4875782,
        z: -0.0072678495
      }
    },
    bullet: {
      trajectory: {
        spread: 0.0,
        recoil: 0.0,
        random_error: 0.0
      },
      auto_correct_to_bone: "head_joint",
      auto_correct_strength: 1.0,
      path_lock: {
        enabled: true,
        region: "head_box",
        max_offset: 0.0001
      },
      hit_validation_mode: "strict_head_only"
    },
    drag: {
      assist: {
        enabled: true,
        lock_priority_bone: "head_joint",
        stick_to_bone: true,
        stick_strength: 1.0,
        stick_duration: 999.0,
        response_speed: 99.0
      },
      stabilization_zone: {
        enabled: true,
        target_bone: "head_joint",
        radius: 0.019,
        dampening: 0.995
      },
      center_lock_when_stabilized: true,
      sync_with_head_rotation: true,
      sync_stabilization_gain: 1.5
    },
    fire: {  
      gesture: {
        drag_assist: true,
        drag_force_multiplier: 4.0,
        drag_response_speed: 999.0,
        input_response_speed: 98.0,
        velocity_amplifier: 1.75,
        drag_consistency: 1.0,
        drag_axis_mode: "omnidirectional",
        drag_distance_limit: 999.0,
        drag_lock_bone: "head_joint",
        drag_lock_strength: 1.0,
        dynamic_force_boost: true,
        force_boost_on_enemy_action: 1.5
      }
    }
  };

  // Dữ liệu dạng key dấu chấm:
  const config = JSON.parse(`{
    "input_lock_on_precision_mode": "head_3d_tracking",
    "input_lock_on_track_velocity": true,
    "input_lock_on_rotation_tracking": true,
    "input_lock_on_predict_movement": true,
    "input_lock_on_keep_xy": true,
    "input_lock_on_offset_x": 0.0457,
    "input_lock_on_offset_y": 0.0045,
    "input_lock_on_offset_z": 0.02,
    "drag.assist.enabled": true,
    "input.drag.velocity_response.enabled": true,
    "input.drag.velocity_response.sensitivity": 10.0,
    "input.drag.prelock_on_drag_start": true,
    "input.drag.prelock_bone": "head_joint",
    "input.drag.instant_snap_on_start": true,
    "input.drag.instant_snap_zone": "tight_head_box",
    "input.drag.instant_snap_speed": 99.99,
    "input.drag.directional_bias.enabled": true,
    "input.drag.directional_bias.priority_axis": "Y+",
    "input.drag.directional_bias.threshold": 0.85,
    "input.drag.ignored_bones": [
      "chest",
      "pelvis",
      "shoulder_r",
      "shoulder_l",
      "neck_lower"
    ],
    "input.drag.stick_on_snap": true,
    "input.drag.stick_duration": 999.0,
    "input.drag.stick_strength": 1.0,
    "input.drag.target_priority": "bone:head_joint",
    "input.drag.tracking_mode": "3d_bone_xyz",
    "input.drag.head_tracking.enabled": true,
    "input.drag.head_prediction_speed": 0.95,
    "drag.assist.lock_priority_bone": "head_joint",
    "drag.assist.stick_to_bone": true,
    "drag.assist.stick_strength": 1.0,
    "drag.assist.stick_duration": 999.0,
    "drag.assist.response_speed": 99.0,
    "drag.stabilization_zone.enabled": true,
    "drag.stabilization_target_bone": "head_joint",
    "drag.stabilization_radius": 0.019,
    "drag.stabilization_dampening": 0.995,
    "drag.center_lock_when_stabilized": true,
    "drag.sync_with_head_rotation": true,
    "drag.sync_stabilization_gain": 1.5,
    "drag.magnetic_snap_on_entry": true,
    "drag.magnetic_snap_force": 1.0,
    "drag.assist.snap_back_on_deviation": true,
    "drag.assist.deviation_threshold": 0.0001,
    "drag.assist.snap_speed": 99.9,
    "drag.assist.tracking_mode": "3d_bone_xyz",
    "drag.assist.lock_zone": "head_box",
    "drag.assist.block_secondary_bones": [
      "neck_lower",
      "chest",
      "shoulder_l",
      "shoulder_r"
    ],
    "fire.gesture.drag_assist": true,
    "fire.gesture.drag_force_multiplier": 4.0,
    "fire.gesture.drag_axis_mode": "omnidirectional",
    "fire.gesture.input_response_speed": 98.0,
    "fire.gesture.velocity_amplifier": 1.75,
    "fire.gesture.drag_consistency": 1.0,
    "fire.gesture.drag_response_speed": 999.0,
    "fire.gesture.drag_distance_limit": 999.0,
    "fire.gesture.drag_lock_bone": "head_joint",
    "fire.gesture.drag_lock_strength": 1.0,
    "fire.gesture.dynamic_force_boost": true,
    "fire.gesture.force_boost_on_enemy_action": 1.5,
    "fire.gesture.drag_softening": false,
    "fire.gesture.aim_bias_mode": "nearest_target_alignment",
    "fire.gesture.drag_boundary_mode": "elastic_clamp",
    "fire.gesture.latency_compensation": 0.0,
    "input.aimassist.adaptive_mode": "gimbal_head_track",
    "input.aimassist.bone_target": "head_joint",
    "input.aimassist.aim_zone": "forward_arc",
    "input.aimassist.aim_zone_angle": 180.0,
    "envsense.advanced_tracking": true,
    "envsense.target_position": {
      "x": -0.0456970781,
      "y": -0.004478302,
      "z": -0.0200432576
    },
    "envsense.target_rotation": {
      "x": 0.0258174837,
      "y": -0.08611039,
      "z": -0.1402113,
      "w": 0.9860321
    },
    "envsense.target_scale": {
      "x": 0.99999994,
      "y": 1.00000012,
      "z": 1.0
    }
  }`);

  const expandedConfig = expandKeys(config);

  const finalConfig = deepMerge(customConfig, expandedConfig);

  $done({ body: JSON.stringify(finalConfig) });

} else {
  $done({});
}

const url2 = $request.url;

function expandKeys(obj) {
  const result = {};
  for (const key in obj) {
    const parts = key.split('.');
    let cur = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        cur[part] = obj[key];
      } else {
        if (!cur[part]) cur[part] = {};
        cur = cur[part];
      }
    }
  }
  return result;
}

function deepMerge(target, source) {
  for (const key in source) {
    if (
      source[key] && typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

if (url.includes("/api/config") || url.includes("/api/aim")) {
  const customConfig = { /* ... your original nested config ... */ };

  const config = JSON.parse(`{ /* your JSON with dotted keys */ }`);
  const expandedConfig = expandKeys(config);

  const customConfig_v2 = {
    drag: {
      multi_axis_tracking: {
        enabled: true,
        target_bone: "head_joint",
        track_x: true,
        track_y: true,
        track_z: true,
        sensitivity: 9.99
      },
      stabilization_dampening: 0.999,
      limit_zone_radius: 0.05,
      rotation_follow_enabled: true,
      rotation_lock_strength: 9.99,
      continuous_lock_on: {
        enabled: true,
        mode: "head_follow_strict",
        tolerance_radius: 0.00001,
        relock_delay: 0.0
      },
      sync_rotation_to_bone: true,
      sync_rotation_gain: 9.99
    },
    aimlock: {
      head_center_reference: true
    }
  };

  const structuredTrackingConfigRaw = {
    "drag.structured_tracking.enabled": true,
    "drag.structured_tracking.bone_name": "head_joint",
    "drag.structured_tracking.position": {
      x: -0.0456970781,
      y: -0.004478302,
      z: -0.0200432576
    },
    "drag.structured_tracking.rotation": {
      x: 0.0258174837,
      y: -0.08611039,
      z: -0.1402113,
      w: 0.9860321
    },
    "drag.structured_tracking.scale": {
      x: 0.99999994,
      y: 1.00000012,
      z: 1.0
    },
    "drag.structured_tracking.center_reference": {
      x: -0.015870847,
      y: 1.4875782,
      z: -0.0072678495
    },
    "drag.structured_tracking.follow_gain": 1.65,
    "drag.structured_tracking.rotation_lock_strength": 1.1,
    "drag.structured_tracking.snap_back_enabled": true,
    "drag.structured_tracking.snap_back_speed": 0.95
  };

  const expandedStructuredTrackingConfig = expandKeys(structuredTrackingConfigRaw);

  // Merge lần lượt:
  let finalConfig = deepMerge(customConfig, expandedConfig);
  finalConfig = deepMerge(finalConfig, customConfig_v2);
  finalConfig = deepMerge(finalConfig, expandedStructuredTrackingConfig);

  $done({ body: JSON.stringify(finalConfig) });

} else {
  $done({});
}

// === Vector3 class chuẩn ===
class Vector3 {
  constructor(x=0,y=0,z=0) {
    this.x = x; this.y = y; this.z = z;
  }
  static distance(a,b) {
    return Math.sqrt(
      (a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2
    );
  }
  static normalize(v) {
    const mag = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
    if(mag === 0) return new Vector3(0,0,0);
    return new Vector3(v.x/mag, v.y/mag, v.z/mag);
  }
  static subtract(a,b) {
    return new Vector3(a.x-b.x, a.y-b.y, a.z-b.z);
  }
  static add(a,b) {
    return new Vector3(a.x+b.x, a.y+b.y, a.z+b.z);
  }
  static multiplyScalar(v,s) {
    return new Vector3(v.x*s, v.y*s, v.z*s);
  }
}

// === Vùng lock các bone ===
const bodyZones = [
  { bone: "bone_Hips_Spine", offset: new Vector3(-0.219812, 0, 0), radius: 0.0001, lockTarget: false },
  { bone: "bone_Hips", offset: new Vector3(-0.05334, -0.003515, -0.000763), radius: 0.0001, lockTarget: false },
  { bone: "bone_Spine", offset: new Vector3(-0.021448, 0, 0), radius: 0.0001, lockTarget: false },
  { bone: "bone_Spine1", offset: new Vector3(-0.07382, 0, 0), radius: 0.0001, lockTarget: false },
  { bone: "bone_Neck", offset: new Vector3(-0.045697, -0.004478, 0.020043), radius: 4, lockTarget: false }
];

// Khai báo bone_Head riêng
const bone_Head = {
  name: "bone_Head",
  offset: new Vector3(-0.0456970781, -0.004478302, -0.0200432576),
  position: new Vector3(-0.0456970781, -0.004478302, -0.0200432576),
  rotation: { x: 0.0258174837, y: -0.08611039, z: -0.1402113, w: 0.9860321 },
  scale: { x: 0.99999994, y: 1.00000012, z: 1.0 },
  radius: 360.0
};

const headLockConfig = {
  radius: 360.0,
  autoLockOn: true,
  exclusiveTargeting: true,
  stickyLock: true,
  lockStrength: 1.0,
  lockTarget: true,
  boneData: bone_Head
};

// === Enemy và Player class ===
class Enemy {
  constructor(headPos) {
    this.headPos = headPos; // Vector3
  }
}

class Player {
  constructor(position, forward) {
    this.position = position; // Vector3
    this.forward = Vector3.normalize(forward); // Vector3
  }

  rotateTowards(targetDir, t) {
    // Linear interpolate forward vector đến targetDir với tốc độ t [0..1]
    this.forward = new Vector3(
      this.forward.x + (targetDir.x - this.forward.x) * t,
      this.forward.y + (targetDir.y - this.forward.y) * t,
      this.forward.z + (targetDir.z - this.forward.z) * t,
    );
    this.forward = Vector3.normalize(this.forward);
  }
}

// === AimAssist class tự động xoay aim ===
class AimAssist {
  constructor(player, aimRange=999.0, aimSpeed=10.0) {
    this.player = player;
    this.aimRange = aimRange;
    this.aimSpeed = aimSpeed;
  }

  update(enemies) {
    let currentEnemy = this.getCurrentEnemy(enemies);
    if(!currentEnemy) return;

    let dirToHead = Vector3.subtract(currentEnemy.headPos, this.player.position);
    let dist = Vector3.distance(this.player.position, currentEnemy.headPos);
    dirToHead = Vector3.normalize(dirToHead);

    if(dist <= this.aimRange) {
      this.player.rotateTowards(dirToHead, this.aimSpeed * 0.016); // deltaTime 16ms
    }
  }

  getCurrentEnemy(enemies) {
    let minDist = Infinity;
    let closest = null;
    for(let e of enemies) {
      let dist = Vector3.distance(this.player.position, e.headPos);
      if(dist < minDist && dist <= this.aimRange) {
        minDist = dist;
        closest = e;
      }
    }
    return closest;
  }
}

// === Hàm điều chỉnh aim mềm mại sau khi kéo ===
function adjustAimAfterPull(currentPos, targetHeadPos, armorZonePos, pullDistance, boneData) {
  const distToHead = Vector3.distance(currentPos, targetHeadPos);
  const distToArmor = Vector3.distance(currentPos, armorZonePos);

  // 1. Giảm độ lệch khi gần armor (chỉ kéo nhẹ 30%)
  if(distToArmor < distToHead * 0.7) {
    const diffArmor = Vector3.subtract(armorZonePos, currentPos);
    currentPos = Vector3.add(currentPos, Vector3.multiplyScalar(diffArmor, 0.3));
  }

  // 2. Dùng easing để kéo mượt về đầu (easeOutQuad)
  const t = Math.min(1, pullDistance / 50);
  const easeOutQuad = x => 1 - (1 - x) * (1 - x);
  const easeFactor = easeOutQuad(t);

  const diffHead = Vector3.subtract(targetHeadPos, currentPos);
  currentPos = Vector3.add(currentPos, Vector3.multiplyScalar(diffHead, easeFactor * 0.6));

  // 3. Kéo mạnh hơn khi rất gần đầu
  if(distToHead < 5) {
    const heavyPullFactor = (5 - distToHead) / 5;
    currentPos = Vector3.add(currentPos, Vector3.multiplyScalar(diffHead, heavyPullFactor * 0.7));
  }

  // 4. Áp dụng offset bone_Head nếu có
  if(boneData && boneData.bone_Head && boneData.bone_Head.offset) {
    const offset = boneData.bone_Head.offset;
    currentPos = Vector3.add(currentPos, new Vector3(offset.x, offset.y, offset.z || 0));
  }

  fireBullet(currentPos, targetHeadPos);

  return currentPos;
}

// === Hàm mô phỏng bắn đạn từ vị trí hiện tại tới đầu địch ===
function fireBullet(fromPos, toPos) {
  const direction = Vector3.subtract(toPos, fromPos);
  const length = Vector3.distance(fromPos, toPos);
  const normalized = Vector3.multiplyScalar(direction, 1/length);

  console.log("🔥 Fire bullet from:", fromPos, "towards:", toPos, "dir:", normalized);
}

// === Khởi tạo và chạy ví dụ ===
const player = new Player(new Vector3(0,0,0), new Vector3(0,0,1));
const enemies = [
  new Enemy(new Vector3(10, 1, 5)),
  new Enemy(new Vector3(5, 0, 3)),
  new Enemy(new Vector3(20, 0, 0))
];
const aimAssist = new AimAssist(player, 15, 5);

let currentAim = new Vector3(-0.0456970781, -0.004478302, -0.0200432576);
const targetHead = new Vector3(-0.0456970781, -0.004478302, -0.0200432576);
const armorZone = new Vector3(-0.0456970781, -0.004478302, -0.0200432576);
const pullDistance = 40;

setInterval(() => {
  aimAssist.update(enemies);
  console.log("Player forward vector:", player.forward);

  currentAim = adjustAimAfterPull(currentAim, targetHead, armorZone, pullDistance, { bone_Head });
}, 16);

// Hàm easing expo cho kéo mượt aim
function adjustAimAfterPull(currentPos, targetHeadPos, armorZonePos, pullDistance) {
  const distToHead = Math.hypot(currentPos.x - targetHeadPos.x, currentPos.y - targetHeadPos.y);
  const distToArmor = Math.hypot(currentPos.x - armorZonePos.x, currentPos.y - armorZonePos.y);

  // Giảm ưu tiên lệch sang armor (chỉ 10%)
  if (distToArmor < distToHead * 0.5) {
    currentPos.x += (armorZonePos.x - currentPos.x) * 0.1;
    currentPos.y += (armorZonePos.y - currentPos.y) * 0.1;
  }

  // Easing expo để kéo nhanh hơn về đầu
  const t = Math.min(1, pullDistance / 40);
  const easeOutExpo = x => 1 - Math.pow(2, -10 * x);
  const easeFactor = easeOutExpo(t);

  currentPos.x += (targetHeadPos.x - currentPos.x) * easeFactor * 0.85;
  currentPos.y += (targetHeadPos.y - currentPos.y) * easeFactor * 0.85;

  // Khi gần đầu hơn 6.5 thì kéo mạnh hơn nữa
  if (distToHead < 6.5) {
    const heavyPullFactor = (6.5 - distToHead) / 6.5;
    currentPos.x += (targetHeadPos.x - currentPos.x) * heavyPullFactor * 0.9;
    currentPos.y += (targetHeadPos.y - currentPos.y) * heavyPullFactor * 0.9;
  }

  return currentPos;
}

// Dữ liệu bone_Head với offset chuẩn
const bone_Head2 = {
  offset: { x: -0.0456970781, y: -0.004478302, z: -0.0200432576 },
  radius: 0.02
};

// Giả lập player position (global)
const player2 = { position: { x: 0, y: 0, z: 0 } };

// Giả lập danh sách enemy có bone_Head position
const enemiesList = [
  { bone_Head: { x: 5, y: 1, z: 2 } },
  { bone_Head: { x: 10, y: 3, z: -1 } },
  // Có thể thêm nhiều enemy khác...
];

// Hàm tính khoảng cách 3D
function calculateDistance(a, b) {
  return Math.sqrt(
    (a.x - b.x)**2 +
    (a.y - b.y)**2 +
    (a.z - b.z)**2
  );
}

// Tìm enemy gần nhất so với player.position
function getNearestEnemy() {
  let closestEnemy = null;
  let closestDistance = Infinity;

  for (const enemy of enemiesList) {
    if (!enemy.bone_Head) continue;
    const dist = calculateDistance(player.position, enemy.bone_Head);
    if (dist < closestDistance) {
      closestDistance = dist;
      closestEnemy = enemy;
    }
  }
  return closestEnemy;
}

// Hàm setAim mô phỏng gửi tọa độ aim đến game engine
function setAim(x, y, z) {
  console.log(`Aim at position: x=${x.toFixed(3)}, y=${y.toFixed(3)}, z=${z.toFixed(3)}`);
}

// Hàm kéo aim dần về bone_Head target với tốc độ pullSpeed
function dragAimToBoneHead(currentAim, enemy, boneData, pullSpeed = 0.4) {
  if (!enemy || !enemy.bone_Head) return currentAim;

  const offset = boneData.offset || { x: 0, y: 0, z: 0 };
  const targetHeadPos = {
    x: enemy.bone_Head.x + offset.x,
    y: enemy.bone_Head.y + offset.y,
    z: enemy.bone_Head.z + offset.z
  };

  currentAim.x += (targetHeadPos.x - currentAim.x) * pullSpeed;
  currentAim.y += (targetHeadPos.y - currentAim.y) * pullSpeed;
  currentAim.z += (targetHeadPos.z - currentAim.z) * pullSpeed;

  return currentAim;
}

// Khóa mục tiêu vào đầu enemy gần nhất liên tục
let currentAim2 = { x: 0, y: 0, z: 0 }; // khởi tạo vị trí aim hiện tại

setInterval(() => {
  const targetEnemy = getNearestEnemy();
  if (!targetEnemy) return;

  // Kéo aim mượt theo bone_Head enemy
  currentAim = dragAimToBoneHead(currentAim, targetEnemy, bone_Head, 0.4);

  // Áp dụng easing và ưu tiên tránh lệch sang armor (giả định armorZone = targetBone vị trí)
  currentAim = adjustAimAfterPull(currentAim, targetEnemy.bone_Head, targetEnemy.bone_Head, 40);

  // Gửi tọa độ aim đến game
  setAim(currentAim.x, currentAim.y, currentAim.z);
}, 33); // khoảng 30 FPS

const customConfig_v3 = {
  aimlock: {
    enabled: true,
    target_bone: "head_joint",
    tracking_mode: "3d_bone_xyz",
    snap_to_target_on_deviation: true,
    deviation_threshold: 0.00001,
    snap_speed: 99.99,
    magnetic_force_snap: {
      enabled: true,
      zone: "head_box",
      trigger_mode: "on_target_visible",
      pull_strength: 1.0,
      snap_vector_override: {
        mode: "direct_to_center",
        interpolation: false
      },
      delay: 0.0
    },
    stick_to_bone: true,
    stick_strength: 1.0,
    stick_duration: 999.0,
    continuous_lock: {
      enabled: true,
      zone: "head_box",
      priority_bone: "head_joint",
      fallback_enabled: true
    },
    rotation_sync_from_bone: true,
    rotation_sync_target: "head_joint",
    rotation_sync_strength: 1.0,
    head_bone_structure: {
      position: {
        x: -0.0456970781,
        y: -0.004478302,
        z: -0.0200432576
      },
      rotation: {
        x: 0.0258174837,
        y: -0.08611039,
        z: -0.1402113,
        w: 0.9860321
      },
      scale: {
        x: 0.99999994,
        y: 1.00000012,
        z: 1.0
      }
    }
  },
  input: {
    aimassist: {
      magnetic_pull: true,
      pull_strength: 1.0,
      pull_decay: 0.0,
      anchor_on_target_appear: true,
      force_snap_delay: 0.0
    }
  },
  hitdetect: {
    collider: {
      enabled: true,
      custom_head_region: true,
      zone: "head_bounds",
      head_bounds: {
        radius: 0.035,
        height: 0.075,
        center: {
          x: -0.0456970781,
          y: -0.004478302,
          z: -0.0200432576
        }
      }
    },
    target_priority_bone: "head_joint",
    snap_to_head_on_drift: true,
    snap_correction_speed: 99.9,
    obstruction_check: true,
    force_reselect_on_obstruct: true,
    strict_region_locking: true,
    lock_zone: "head_box"
  },
  lock_weighting_system: {
    "bone:head_joint": 1.0,
    "bone:neck_upper": 0.1,
    "bone:chest": 0.0
  },
  precise_headbox: {
    enabled: true,
    bounds: {
      shape: "capsule",
      radius: 0.028,
      height: 0.066,
      center: {
        x: -0.0456970781,
        y: -0.004478302,
        z: -0.0200432576
      }
    }
  },
  envsense: {
    advanced_tracking: true,
    worldspace_mapping_enabled: true,
    coordinate_sync_mode: "absolute",
    position_rounding: false,
    rotation_rounding: false,
    subunit_precision: true,
    subunit_threshold: 0.00001,
    latency_compensation: 0.0001,
    target_position: {
      x: -0.0456970781,
      y: -0.004478302,
      z: -0.0200432576
    },
    target_rotation: {
      x: 0.0258174837,
      y: -0.08611039,
      z: -0.1402113,
      w: 0.9860321
    },
    target_scale: {
      x: 0.99999994,
      y: 1.00000012,
      z: 1.0
    }
  },
  aimassist: {
    rotation_snap_trigger: {
      enabled: true,
      target_bone: "head_joint",
      angular_speed_threshold: 45.0,
      snap_immediately: true,
      snap_zone: "head_box",
      snap_strength: 1.0,
      snap_speed: 99.99,
      hold_duration_after_snap: 1.5,
      reset_if_slowing_down: true,
      prediction_enabled: true,
      prediction_lead_factor: 1.2
    }
  },
  debug: {
    draw_rotation_vectors: true,
    highlight_snap_event: true
  }
};

if (url.includes("customConfig")) {
  $done({ body: JSON.stringify(customConfig_v3) });
} else {
  $done({});
}
// ==UserScript==
// @name           Free Fire AimLock Engine
// @description    Aim lock + Flick shot + Recoil for Free Fire
// @version        1.0
// ==/UserScript==

const config = {
  auto_fov: { dynamic_adjust: true, max: 6.4 },
  math: { predictive_offset: 0.18 },
  headlock: {
    enabled: true,
    biasFactor: 1.7,
    lockHeightRatio: 0.965
  },
  weapon_profiles: {
    default: { tracking_speed: 1.12 },
    m1887: { tracking_speed: 15.8, flick_speed: 1.5 }
  },
  recoil: {
    m1887: { x: 0.22, y: 0.88 }
  }
};

function calculateHeadLockOffset(enemy, weaponType = "default") {
  const profile = config.weapon_profiles[weaponType] || config.weapon_profiles.default;
  const offset = config.math.predictive_offset;
  const lockBias = config.headlock.biasFactor;

  return {
    x: enemy.velocity.x * offset * profile.tracking_speed * lockBias,
    y: enemy.velocity.y * offset * profile.tracking_speed * lockBias,
    z: enemy.velocity.z * offset * profile.tracking_speed * lockBias + (enemy.height * config.headlock.lockHeightRatio)
  };
}

function aimHeadLock(enemy, weapon = "m1887") {
  const offset = calculateHeadLockOffset(enemy, weapon);
  return {
    x: enemy.position.x + offset.x,
    y: enemy.position.y + offset.y,
    z: enemy.position.z + offset.z
  };
}

function flickHeadshot(enemy, weapon = "m1887") {
  const profile = config.weapon_profiles[weapon] || {};
  const flickSpeed = profile.flick_speed || 1.0;
  return {
    x: enemy.position.x,
    y: enemy.position.y,
    z: enemy.position.z + enemy.height * 0.97 + Math.random() * 0.01 * flickSpeed
  };
}

function recoilCompensation(weapon = "m1887") {
  const recoil = config.recoil[weapon] || { x: 0, y: 0 };
  return { x: -recoil.x, y: -recoil.y };
}

// ======= Shadowrocket Script Entry =======
(async function () {
  const req = typeof $request !== "undefined" ? JSON.parse($request.body || "{}") : {};
  const enemy = req.enemy || {
    position: { x: -0.015870847, y: 1.4875782, z: -0.0072678495 },
    velocity: { x: 0.12, y: 0.03, z: 0 },
    height: 1.8
  };
  const weapon = req.weapon || "m1887";

  const result = {
    aimLock: aimHeadLock(enemy, weapon),
    flick: flickHeadshot(enemy, weapon),
    recoil: recoilCompensation(weapon)
  };

  $done({ body: JSON.stringify(result) });
})();
