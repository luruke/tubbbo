precision highp float;

uniform sampler2D texture;
uniform sampler2D velocity;
uniform float uTime;
uniform float uMouseAngle;
uniform vec3 uMousePos;

// float qinticOut(float t) {
//   return 1.0 - (pow(t - 1.0, 5.0));
// }

// https://gist.github.com/yiwenl/3f804e80d0930e34a0b33359259b556c
mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}


float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

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
    oldValues.xyz = uMousePos - vec3(0.0, 15.0, 0.0);
    oldValues.y += uv.x * 20.0;

    oldValues.x += rand(vec2(uv.y, uTime)) * 10.0;
    oldValues.y += rand(vec2(uv.y * 321.3, uTime * 0.2)) * 10.0;
    oldValues.z += rand(vec2(uMousePos + uTime));

    // vec3 pivot = vec3(0.0, -10.0, 0.0);
    // oldValues.xyz -= pivot;
    oldValues.xyz -= uMousePos;
    oldValues.xyz = rotate(oldValues.xyz, vec3(0.0, 0.0, 1.0), -(3.14 / 2.0) + uMouseAngle);
    oldValues.xyz += uMousePos;
    // oldValues.xyz += pivot;
  }

  // oldValues.y += .01;

  oldValues.a = head.a;

  gl_FragColor = oldValues;
}