precision highp float;

uniform sampler2D texture;
uniform sampler2D velocity;
uniform float uTime;

void main() {
  float pixelWidth = 1.0 / RESOLUTION.x;
  vec2 uv = gl_FragCoord.xy / RESOLUTION.xy;
  vec4 oldValues = texture2D(texture, uv);

  if (uv.x <= pixelWidth) {
    vec4 velocityData = texture2D(velocity, uv);
    oldValues.xyz += velocityData.xyz;
    
    // if (velocityData.a <= 0.0) {
    //   oldValues.xyz = vec3(0.0);
    // }
    
  } else {
    vec3 toFollow = texture2D(texture, uv - vec2(pixelWidth, 0.0)).xyz;

    float speed = .8 * uv.y;

    oldValues.xyz = mix(oldValues.xyz, toFollow, .2 + speed);
  }

  // oldValues.y += .01;

  gl_FragColor = oldValues;
}