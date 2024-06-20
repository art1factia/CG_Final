// precision highp float;

uniform float uTime;
varying float vDisplacement;

uniform float uRadius;
uniform sampler2D uTexture;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;



void main() {
  
	gl_FragColor = vec4(vec3(0.3,0.8,0.8) ,1);

}


