precision highp float;
attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;
attribute float aAngle;
attribute float aIndex;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform sampler2D uData;
uniform float uMouseAngle;

varying float vProgress;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 wPos;
varying float vAo;
varying float vLife;

const float pixelWidth = 1.0 / (RESOLUTION.x);

float qinticOut(float t) {
  return 1.0 - (pow(t - 1.0, 5.0));
}

float cubicOut(float t) {
  float f = t - 1.0;
  return f * f * f + 1.0;
}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main(){
  float progress = 1.0 - (position.x + 1.0) / 2.0;
  vProgress = progress;

  // https://mattdesl.svbtle.com/shaping-curves-with-parametric-equations

  vec4 data = texture2D(uData, vec2(progress, aIndex));
  vLife = data.a;

  vec2 volume = vec2(0.8);
  // float volume = 0.8;

  volume *= cubicOut(smoothstep(50.0, 200.0, vLife));
  volume *= cubicOut(clamp(smoothstep(LIFE, LIFE - 100.0, vLife), 0.0, 1.0));

  if (vLife <= 0.0) {
    volume = vec2(0.0);
  }

  vec3 cur = data.xyz;
  vec3 next = texture2D(uData, vec2(progress - pixelWidth, aIndex)).xyz;
  vec3 next2 = texture2D(uData, vec2(progress - pixelWidth * 2.0, aIndex)).xyz;

  float introMul = cubicOut(clamp(smoothstep(LIFE, LIFE - 100.0, vLife), 0.0, 1.0));

  float val = map(introMul, 0.0, 1.0, 0.88, 1.0);

  cur *= val;
  next *= val;
  next2 *= val;

  // compute the Frenet-Serret frame
  vec3 T = normalize(next - cur);
  vec3 B = normalize(cross(T, next + cur));
  vec3 N = -normalize(cross(B, T));

  // extrude outward to create a tube
  float tubeAngle = aAngle;
  float circX = cos(tubeAngle);
  float circY = sin(tubeAngle);

  vec3 calculatedNormal = normalize(B * circX + N * circY);
  vNormal = normalize(normalMatrix * calculatedNormal);

  // vec3 pos = cur + B * volume.x * circX + N * volume.y * circY;
  vec3 pos = cur + calculatedNormal * volume.x;

  // pos.xyz -= cur;
  // pos.yz *= cubicOut(clamp(smoothstep(LIFE, LIFE - 100.0, vLife), 0.0, 1.0));
  // pos.xyz += cur;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vViewPosition = - mvPosition.xyz;

  vAo = length(abs(cross(
    normalize(cur - next),
    normalize(next - next2)
  )));

  if (position.x > 0.49) {
    vNormal = normalize(cur - next);
  }
  // } else if (vProgress == 1.0) {
  //   vNormal = normalize(next - cur);
  // }

  wPos = (modelMatrix * vec4(pos, 1.0)).xyz;
  

  gl_Position = projectionMatrix * mvPosition;
}