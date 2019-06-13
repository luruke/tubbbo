precision highp float;

uniform vec3 color;// ms({ value: '#ff0000' })
varying vec2 vUv;

void main(){
  gl_FragColor = vec4(vUv.y, 1., 1., 1.);
}