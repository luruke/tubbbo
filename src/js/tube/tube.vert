precision highp float;
attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
// uniform vec4 uPath[PATH_LENGTH];
uniform sampler2D uData;

varying vec2 vUv;

// from https://raw.githubusercontent.com/zadvorsky/three.bas/master/src/glsl/catmull_rom_spline.glsl
// vec4 catmullRomSpline(vec4 p0, vec4 p1, vec4 p2, vec4 p3, float t, vec2 c) {
//     vec4 v0 = (p2 - p0) * c.x;
//     vec4 v1 = (p3 - p1) * c.y;
//     float t2 = t * t;
//     float t3 = t * t * t;

//     return vec4((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);
// }
// vec4 catmullRomSpline(vec4 p0, vec4 p1, vec4 p2, vec4 p3, float t) {
//     return catmullRomSpline(p0, p1, p2, p3, t, vec2(0.5, 0.5));
// }

vec3 catmullRomSpline(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t, vec2 c) {
    vec3 v0 = (p2 - p0) * c.x;
    vec3 v1 = (p3 - p1) * c.y;
    float t2 = t * t;
    float t3 = t * t * t;

    return vec3((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);
}
// vec3 catmullRomSpline(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
//     return catmullRomSpline(p0, p1, p2, p3, t, vec2(0.5, 0.5));
// }

// vec2 catmullRomSpline(vec2 p0, vec2 p1, vec2 p2, vec2 p3, float t, vec2 c) {
//     vec2 v0 = (p2 - p0) * c.x;
//     vec2 v1 = (p3 - p1) * c.y;
//     float t2 = t * t;
//     float t3 = t * t * t;

//     return vec2((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);
// }
// vec2 catmullRomSpline(vec2 p0, vec2 p1, vec2 p2, vec2 p3, float t) {
//     return catmullRomSpline(p0, p1, p2, p3, t, vec2(0.5, 0.5));
// }

// float catmullRomSpline(float p0, float p1, float p2, float p3, float t, vec2 c) {
//     float v0 = (p2 - p0) * c.x;
//     float v1 = (p3 - p1) * c.y;
//     float t2 = t * t;
//     float t3 = t * t * t;

//     return float((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);
// }
// float catmullRomSpline(float p0, float p1, float p2, float p3, float t) {
//     return catmullRomSpline(p0, p1, p2, p3, t, vec2(0.5, 0.5));
// }

ivec4 getCatmullRomSplineIndices(float l, float p) {
    float index = floor(p);
    int i0 = int(max(0.0, index - 1.0));
    int i1 = int(index);
    int i2 = int(min(index + 1.0, l));
    int i3 = int(min(index + 2.0, l));

    return ivec4(i0, i1, i2, i3);
}

// ivec4 getCatmullRomSplineIndicesClosed(float l, float p) {
//     float index = floor(p);
//     int i0 = int(index == 0.0 ? l : index - 1.0);
//     int i1 = int(index);
//     int i2 = int(mod(index + 1.0, l));
//     int i3 = int(mod(index + 2.0, l));

//     return ivec4(i0, i1, i2, i3);
// }

vec3 readPath(int index) {
  // vec2 uv = vec2(float(index / PATH_LENGTH), 1.0);

  float x = float(index) / PATH_LENGTH;
  vec2 uv = vec2(x, 1.0);

  return texture2D(uData, uv).xyz;
  // return uPath[index].xyz;
}

void main(){
  vUv = uv;
  
  // p += texture2D(uData, vec2(0.0)).rgb;
  float pathProgress = vUv.y;
  ivec4 indices = getCatmullRomSplineIndices(PATH_MAX, pathProgress);

  // vec3 p0 = uPath[indices[0]].xyz; // max(0, floor(pathProgress) - 1)
  // vec3 p1 = uPath[indices[1]].xyz; // floor(pathProgress)
  // vec3 p2 = uPath[indices[2]].xyz; // min(length, floor(pathProgress) + 1)
  // vec3 p3 = uPath[indices[3]].xyz; // min(length, floor(pathProgress) + 2)

  vec3 p0 = readPath(indices[0]);
  vec3 p1 = readPath(indices[1]);
  vec3 p2 = readPath(indices[2]);
  vec3 p3 = readPath(indices[3]);

  float pathProgressFract = fract(pathProgress);
  vec2 smoothness = vec2(0.5);
  
  vec3 pos = catmullRomSpline(p0.xyz, p1.xyz, p2.xyz, p3.xyz, pathProgressFract, smoothness);
  // vec3 pos = position;
  pos += normal * 1.0;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}