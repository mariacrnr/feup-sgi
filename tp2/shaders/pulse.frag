#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec4 vFinalColor;

uniform sampler2D uSampler;
varying vec3 offset;

uniform float timeFactor;
uniform vec4 pulseColor;
uniform vec4 originalColor;
uniform bool hasTexture;

void main() {
	vec4 textColor, defaultColor;

	if (hasTexture){
		textColor = texture2D(uSampler, vTextureCoord) * vFinalColor;
    }
	else{
        textColor = originalColor;
    }

	vec4 color = mix(textColor, pulseColor, (sin(timeFactor) + 1.0) / 2.0);
	gl_FragColor = color;
}
