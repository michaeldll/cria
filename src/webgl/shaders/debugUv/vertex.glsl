attribute vec4 aPosition;
attribute vec2 aUv;

uniform mat4 uModelMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vUv;

void main(void) {
    vUv = aUv;
    gl_Position = uProjectionMatrix * uModelMatrix * aPosition;
}