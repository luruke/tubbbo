precision highp float;

uniform sampler2D texture;
uniform sampler2D uPosition;
uniform float uTime;

#pragma glslify: curlNoise = require(glsl-curl-noise)

void main() {
  float pixelWidth = 1.0 / RESOLUTION.x;
  vec2 uv = gl_FragCoord.xy / RESOLUTION.xy;
  vec4 oldValue = texture2D(texture, uv);
  vec4 newValue = oldValue;

  if (uv.x <= pixelWidth) {
    // head
    newValue.y = sin(uTime * 2.2 + uv.x * 4.4) * 0.07;
  } else {
    // follow
    vec4 pixelToFollow = texture2D(uPosition, uv - vec2(pixelWidth, 0.0));
    vec4 currentPosition = texture2D(uPosition, uv);
    vec3 direction = normalize(pixelToFollow.xyz - currentPosition.xyz);
    // newValue.xyz += direction * 0.00000001;
    // newValue.xyz += direction * 0.001;
  }

  // oldValue.y += .002;

  // oldValue.xyz += curlNoise(oldValue.xyz) * 0.01;
  // oldValue.w = 1.0;

  gl_FragColor = newValue;
  gl_FragColor.a = 1.0;
}