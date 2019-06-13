precision highp float;

uniform sampler2D texture;
uniform float uTime;

void main() {
  vec2 uv = gl_FragCoord.xy / RESOLUTION.xy;
  vec4 oldValues = texture2D(texture, uv);

  // oldValues += sin(uTime * 0.2 + uv.x * 4.4) * 0.01;
  oldValues.y += .2;

  gl_FragColor = oldValues;
}