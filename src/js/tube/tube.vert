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

const float pixelWidth = 1.0 / (RESOLUTION.x);

void main(){
  vUv = uv;
  vec2 volume = vec2(0.8, 0.8);

  // vec2 volume = vec2(uv.y * 3.0 + 1.0);

  // https://mattdesl.svbtle.com/shaping-curves-with-parametric-equations
  vec3 cur = texture2D(uData, vec2(vUv.y, aIndex)).xyz;
  vec3 next = texture2D(uData, vec2(vUv.y - pixelWidth, aIndex)).xyz;

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
  vec3 pos = cur + B * volume.x * circX + N * volume.y * circY;

  // pos = cur + (normal * 1.0);
  // vNormal = normalize(normalMatrix * normal);

  // pos.y += aIndex;

  // pos *= 0.05;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}