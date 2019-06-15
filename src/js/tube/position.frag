precision highp float;

uniform sampler2D texture;
uniform sampler2D velocity;
uniform float uTime;
uniform vec3 uMousePos;

// float qinticOut(float t) {
//   return 1.0 - (pow(t - 1.0, 5.0));
// }

void main() {
  float pixelWidth = 1.0 / RESOLUTION.x;
  vec2 uv = gl_FragCoord.xy / RESOLUTION.xy;
  vec4 oldValues = texture2D(texture, uv);

  vec4 head = texture2D(velocity, vec2(0.0, uv.y));

  if (uv.x <= pixelWidth) {
    // vec4 velocityData = texture2D(velocity, uv);
    // float speed = clamp(smoothstep(0.2, 0.5, velocityData.a), 0.0, 1.0);
    
    if (head.a >= 1.0) {
      // float speed = 1.0;

      // speed += 1.0 - smoothstep(0.0, 50.0, head.a) * 4.0;
      oldValues.xyz += head.xyz;// * speed;
    }

    // if (velocityData.a > RESOLUTION.x * 2.0) {
    //   // oldValues.xyz = vec3(0.0);
    // } else {
    //   // oldValues.xyz = vec3(0.0);
    // }
    
  } else {
    vec3 toFollow = texture2D(texture, uv - vec2(pixelWidth, 0.0)).xyz;

    // length of tube
    // float speed = .8 * uv.y;
    // float t = .1 + speed;

    float t = 0.2;

    // float time = (sin(uTime + uv.y * 40.0) + 1.0) / 2.0;

    // t += qinticOut(1.0 - uv.x) * 0.8;

    oldValues.xyz = mix(oldValues.xyz, toFollow, t);
  }

  if (head.a <= 0.0) {
    // oldValues.xyz = vec3(0.0);
    oldValues.xyz = uMousePos;
    oldValues.y += uv.x * 20.0;
  }

  // oldValues.y += .01;

  oldValues.a = head.a;

  gl_FragColor = oldValues;
}