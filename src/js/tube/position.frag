precision highp float;

uniform sampler2D texture;
uniform sampler2D velocity;
uniform float uTime;


float qinticOut(float t) {
  return 1.0 - (pow(t - 1.0, 5.0));
}


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

    // length of tube
    // float speed = .8 * uv.y;
    // float t = .1 + speed;

    float t = 0.2;

    float time = (sin(uTime + uv.y * 40.0) + 1.0) / 2.0;

    t += qinticOut(1.0 - uv.x) * 0.8 * time;

    oldValues.xyz = mix(oldValues.xyz, toFollow, t);
  }

  // oldValues.y += .01;

  gl_FragColor = oldValues;
}