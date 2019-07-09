precision highp float;
uniform sampler2D uScene;
uniform vec2 uResolution;

#ifdef FXAA
  #pragma glslify: fxaa = require(glsl-fxaa)
#endif

float gamma = 2.2;

vec3 linearToneMapping(vec3 color)
{
  float exposure = 1.;
  color = clamp(exposure * color, 0., 1.);
  color = pow(color, vec3(1. / gamma));
  return color;
}

vec3 simpleReinhardToneMapping(vec3 color)
{
  float exposure = 1.5;
  color *= exposure/(1. + color / exposure);
  color = pow(color, vec3(1. / gamma));
  return color;
}

vec3 lumaBasedReinhardToneMapping(vec3 color)
{
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float toneMappedLuma = luma / (1. + luma);
  color *= toneMappedLuma / luma;
  color = pow(color, vec3(1. / gamma));
  return color;
}

vec3 whitePreservingLumaBasedReinhardToneMapping(vec3 color)
{
  float white = 2.;
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float toneMappedLuma = luma * (1. + luma / (white*white)) / (1. + luma);
  color *= toneMappedLuma / luma;
  color = pow(color, vec3(1. / gamma));
  return color;
}

vec3 RomBinDaHouseToneMapping(vec3 color)
{
  color = exp( -1.0 / ( 2.72*color + 0.15 ) );
  color = pow(color, vec3(1. / gamma));
  return color;
}

vec3 filmicToneMapping(vec3 color)
{
  color = max(vec3(0.), color - vec3(0.004));
  color = (color * (6.2 * color + .5)) / (color * (6.2 * color + 1.7) + 0.06);
  return color;
}

vec3 Uncharted2ToneMapping(vec3 color)
{
  float A = 0.15;
  float B = 0.50;
  float C = 0.10;
  float D = 0.20;
  float E = 0.02;
  float F = 0.30;
  float W = 11.2;
  float exposure = 2.;
  color *= exposure;
  color = ((color * (A * color + C * B) + D * E) / (color * (A * color + B) + D * F)) - E / F;
  float white = ((W * (A * W + C * B) + D * E) / (W * (A * W + B) + D * F)) - E / F;
  color /= white;
  color = pow(color, vec3(1. / gamma));
  return color;
}


void main() {
  #ifdef FXAA
    vec3 color = fxaa(uScene, gl_FragCoord.xy, uResolution).rgb;
  #else
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec3 color = texture2D(uScene, uv).rgb;
  #endif

  color = linearToneMapping(color);

  gl_FragColor = vec4(color, 1.0);
}