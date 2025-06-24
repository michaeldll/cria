# cria

Work in Progress. Aims at being a minimal WebGPU library, for developers familiar with [Three.js](https://github.com/mrdoob/three).

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

## Installation

`npm i`<br>
`npm run build`

Then, import your files from `dist/`.

## Local development

`npm i`<br>
`cd examples`<br>
`npm run dev`<br>

This starts a local self-signed HTTPS server and displays a rotating cube.<br/>
When you open the local development URL in your browser, you may encounter a security warning due to the self-signed HTTPS certificate. You can safely proceed.<br/>
To run an example, simply `import` it in `examples/example.ts`.

## Example :

```ts
import { Desenhador, Cube } from ""

// Renderer
const { gl, draw } = new Desenhador()

```

![Red cube](https://i.imgur.com/ZoJGlo6.png)

More examples available under `/examples`:
- Fullscreen shader
- OBJ model and texture loading