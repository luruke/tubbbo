precision highp float;

uniform sampler2D texture;
uniform sampler2D velocity;
uniform float uTime;

void main() {
  vec2 uv = gl_FragCoord.xy / RESOLUTION.xy;
  vec4 oldValues = texture2D(texture, uv);
  oldValues.xyz += texture2D(velocity, uv).xyz;

  gl_FragColor = oldValues;
}