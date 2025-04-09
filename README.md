# cria

Aims at being a minimal WebGPU library for developers familiar with [Three.js](https://github.com/mrdoob/three).

## Principles

- Replicates the Three.js API when possible, due to it's proven effectiveness, ease-of-use and familiarity to many web developers.
- Retains only the most essential and easily extendable features from Three.js, for a convenient but lightweight codebase with a small bundle size.
- WGSL shading language only, therefore no nodal system or Three.js Shader Language.
- Easily extendable, convenient default materials.
- Provides several examples to be used as implementation references.
- Typescript by default, ES6 modules only, as few dependencies as possible.

## References

- \[0]: https://github.com/toji/hello-triangle-webgpu/blob/main/index.html
- \[1]: https://webgpufundamentals.org/webgpu/lessons/webgpu-from-webgl.html
- \[2]: https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/createRenderPipeline
- \[3]: https://github.com/CodyJasonBennett/four
