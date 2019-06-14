precision highp float;

uniform sampler2D texture;
uniform sampler2D velocity;
uniform float uTime;

void main() {
  float pixelWidth = 1.0 / RESOLUTION.x;
  vec2 uv = gl_FragCoord.xy / RESOLUTION.xy;
  vec4 oldValues = texture2D(texture, uv);

  if (uv.x <= pixelWidth) {
    oldValues.xyz += texture2D(velocity, uv).xyz;
  } else {
    vec3 toFollow = texture2D(texture, uv - vec2(pixelWidth, 0.0)).xyz;
    oldValues.xyz = mix(oldValues.xyz, toFollow, .8);
  }

  // oldValues.y += .01;

  gl_FragColor = oldValues;
}