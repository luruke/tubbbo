precision highp float;

uniform sampler2D uMatcap;
uniform vec3 cameraPosition;

uniform vec3 color;// ms({ value: '#ff0000' })
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vAo;

vec4 sRGBToLinear( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}

void main(){

  vec3 normal = normalize(vNormal);

  //
  // if (vUv.y < 0.02 || vUv.y > 0.98) {
  //   vec3 vPos = vViewPosition;
  //   vec3 fdx = vec3( dFdx( vPos.x ), dFdx( vPos.y ), dFdx( vPos.z ) );
  //   vec3 fdy = vec3( dFdy( vPos.x ), dFdy( vPos.y ), dFdy( vPos.z ) );
  //   normal = normalize( cross( fdx, fdy ) );
  // }
  //

  vec3 viewDir = normalize( vViewPosition );
  vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
  vec3 y = cross( viewDir, x );
  vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;

  vec4 color = sRGBToLinear(texture2D(uMatcap, uv));

  // color *= 1.0 - (vAo * 0.01);

  color -= 1.0 - pow(vAo, 40.0);

  gl_FragColor = color;
}