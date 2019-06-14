precision highp float;

uniform vec3 color;// ms({ value: '#ff0000' })
varying vec2 vUv;
varying vec3 vNormal;

void main(){
  gl_FragColor = vec4(normalize(vNormal), 1.);
}