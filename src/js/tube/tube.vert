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

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vAo;

const float pixelWidth = 1.0 / (RESOLUTION.x);

void main(){
  vUv = uv;
  vec2 volume = vec2(0.8, 0.8);

  // https://mattdesl.svbtle.com/shaping-curves-with-parametric-equations
  vec3 cur = texture2D(uData, vec2(vUv.y, aIndex)).xyz;
  vec3 next = texture2D(uData, vec2(vUv.y - pixelWidth, aIndex)).xyz;
  vec3 next2 = texture2D(uData, vec2(vUv.y - pixelWidth * 2.0, aIndex)).xyz;

  // compute the Frenet-Serret frame
  vec3 T = normalize(next - cur);
  vec3 B = normalize(cross(T, next + cur));
  vec3 N = -normalize(cross(B, T));

  // extrude outward to create a tube
  float tubeAngle = aAngle;
  float circX = cos(tubeAngle);
  float circY = sin(tubeAngle);

  vec3 calculatedNormal = normalize(B * circX + N * circY);

  if (vUv.y <= 0.02 || vUv.y >= 0.98) {
    calculatedNormal = normalize(cur - next);
  }

  vNormal = normalize(normalMatrix * calculatedNormal);

  vec3 pos = cur + B * volume.x * circX + N * volume.y * circY;


  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vViewPosition = - mvPosition.xyz;

  // vAo = length(normalize(cross(cur, next)));
  // vAo = 1.0 - length(normalize(cur - next));

  vAo = abs(cross(
    normalize(cur - next),
    normalize(next - next2)
  ).x);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}