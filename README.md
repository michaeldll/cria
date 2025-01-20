# cria

Aims at being a readable work-in-progress WebGPU library, aimed at developers with previous experience with three.js.

## Principles

- Uses the three.js API when possible with a similar level of abstraction, due to it's proven effectiveness and familiarity to many web developers.
- Retains only the most essential and easily extendable features from three.js, for a convenient but lightweight codebase with a small bundle size.
- GLSL or WGSL shading languages only, avoiding nodes or TSL.
- Easily extendable, convenient default materials.
- Examples should be easily understandable, broadly applicable, used as implementation references, and act as "living documentation" for the codebase.
- Typescript by default, ES6 modules only, minimal dependencies.

## Documentation

These are the main sources used when developing this library:
[0]: https://github.com/toji/hello-triangle-webgpu/blob/main/index.html
[1]: https://webgpufundamentals.org/webgpu/lessons/webgpu-from-webgl.html
[2]: https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/createRenderPipeline

Repository architecture is inspired by [four](https://github.com/CodyJasonBennett/four) and [three.js](https://github.com/mrdoob/three).