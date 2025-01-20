// 99% of this shader comes from [1] 

struct VertexUniforms {
  worldViewProjection: mat4x4f,
  worldInverseTranspose: mat4x4f,
};
@group(0) @binding(0) var<uniform> vertexUniforms: VertexUniforms;

// [0]: Every vertex attribute input is identified by a @location, which matches up with the shaderLocation specified during pipeline creation.
struct VertexIn {
    @location(0) position: vec4f,
    @location(1) normal: vec3f,
    // [0]: Other outputs are given a @location so that they can map to the fragment shader inputs.
    @location(2) uv: vec2f,
};

struct VertexOut {
  // [0]: Every vertex shader must output a value with @builtin(position)
  @builtin(position) position: vec4f,
  @location(0) normal: vec3f,
  @location(1) uv: vec2f,
};

// [0]: Shader entry points can be named whatever you want, and you can have as many as you want in a single shader module.
@vertex
fn vertexMain(in: VertexIn) -> VertexOut {
  var out: VertexOut;
  out.position = vertexUniforms.worldViewProjection * in.position;
  out.normal = (vertexUniforms.worldInverseTranspose * vec4f(in.normal, 0.0)).xyz;
  out.uv = in.uv;
  return out; 
}

struct FragmentUniforms {
  lightDirection: vec3f,
};

struct FragmentOut {
    @location(0) color: vec4f,
}

@group(0) @binding(1) var<uniform> fragmentUniforms: FragmentUniforms;
@group(0) @binding(2) var diffuseSampler: sampler;
@group(0) @binding(3) var diffuseTexture: texture_2d<f32>;

// [0]: Every fragment shader has to output one vector per pipeline target. The @location corresponds to the target index in the array. 
@fragment
fn fragmentMain(in: VertexOut) -> FragmentOut {
  var diffuseColor = textureSample(diffuseTexture, diffuseSampler, in.uv);
  
  // Debug:
  // diffuseColor = vec4f(vec3f(1, 0, 0), 1);
  
  var normal = normalize(in.normal);
  var light = dot(normal, fragmentUniforms.lightDirection) * 0.5 + 0.5;

  var out: FragmentOut;
  out.color = vec4f(diffuseColor.rgb * light, diffuseColor.a);

  out.color = vec4f(in.uv, 0, 1);
  return out;
}