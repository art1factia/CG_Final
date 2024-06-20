
  vec3 coords = normal;
  coords.y += uTime;
  vec3 noisePattern = vec3(noise(coords));
  float pattern = wave(noisePattern);

  // vec3 newPosition = position + normal * vDisplacement;
  vDisplacement = pattern; 

  float displacement = vDisplacement/4.0;
  

  // vec4 modelViewPosition = modelViewMatrix * vec4(newPosition, 1.0 );
  // vec4 projectedPostion = projectionMatrix * modelViewPosition;
	// gl_Position = projectedPostion;

  transformed += normalize(objectNormal) * displacement;
