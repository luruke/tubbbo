precision highp float;

uniform sampler2D uMatcap;
//uniform vec3 cameraPosition;
uniform vec3 uMousePos;

uniform vec3 color;// ms({ value: '#ff0000' })
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vAo;
varying float vProgress;
varying vec3 wPos;
varying float vLife;

vec4 sRGBToLinear( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
// https://github.com/hughsk/glsl-fog/blob/master/exp.glsl
float fogFactorExp(
  const float dist,
  const float density
) {
  return 1.0 - clamp(exp(-density * dist), 0.0, 1.0);
}

float fogFactorExp2(
  const float dist,
  const float density
) {
  const float LOG2 = -1.442695;
  float d = density * dist;
  return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}

void main(){

  vec3 normal = normalize(vNormal);

  
  // if (vProgress >= 0.75) {
  //   normal = vec3(0.0, 1.0, 0.0);
  //   // vec3 vPos = vViewPosition;
  //   // vec3 fdx = vec3( dFdx( vPos.x ), dFdx( vPos.y ), dFdx( vPos.z ) );
  //   // vec3 fdy = vec3( dFdy( vPos.x ), dFdy( vPos.y ), dFdy( vPos.z ) );
  //   // normal = normalize( cross( fdx, fdy ) );
  // }
  
  vec3 viewDir = normalize( vViewPosition );
  vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
  vec3 y = cross( viewDir, x );
  vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;

  vec4 color = sRGBToLinear(texture2D(uMatcap, uv));

  // fake "AO"
  float ao = pow(1.0 - vAo, 2.0);
  color.rgb = mix(color.rgb * 0.2, color.rgb, ao);
  
  // SSS - https://colinbarrebrisebois.com/2011/03/07/gdc-2011-approximating-translucency-for-a-fast-cheap-and-convincing-subsurface-scattering-look/
  
  // vec3 lightPos = vec3(0.0, 4.0, 0.0);
  vec3 lightPos = uMousePos;
  // lightPos.z -= 40.0;
  
  vec3 ssLight = vec3(0.7, 0.2, 0.2) * 0.07;
  vec3 fLTThickness = ssLight * pow(1.0 - vAo, 6.0);
  float fLTScale = 20.6;
  float fLTDistortion = 0.18;
  float fLTAmbient = 0.0;
  float iLTPower = 40.0;
  float dist = distance(lightPos, wPos);
  float fLightAttenuation = (1.0 - clamp(pow(dist / 20.0, 4.0), 0.0, 1.0));
  vec3 vLight = normalize(-vViewPosition - lightPos);
  vec3 vLTLight = normalize(vLight + (normal * fLTDistortion));
  float fLTDot = pow(clamp(dot(viewDir, -vLTLight), 0.0, 1.0), iLTPower) * fLTScale;
  vec3 fLT = fLightAttenuation * (fLTDot + fLTAmbient) * fLTThickness;
  color.rgb += fLT;
  
  // Fog
  color.rgb = mix(color.rgb, color.rgb * 0.1, smoothstep(0.0, 150.0, vViewPosition.z));
    

  gl_FragColor = color;
}