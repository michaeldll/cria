import "./scss/global.scss";
import WebGLApp from "./webgl";
import WebGPUApp from "./webgpu";
import { callWhenReady } from "./utils/callWhenReady";

const USE_WEBGPU = true
async function main() {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement
  if (navigator.gpu && USE_WEBGPU) {
    console.log("WebGPU supported.");

    const zoomer = new WebGPUApp(canvas)
    // WebGPU initialization is async, so we need to wait for it to finish
    zoomer.init().then(() => {
      requestAnimationFrame(zoomer.tick)
    })
  } else {
    console.log("WebGPU not supported.");

    const zoomer = new WebGLApp(canvas)
    zoomer.init()
    requestAnimationFrame(zoomer.tick)
  }
}


callWhenReady(() => {
  main();
})

// Enable esbuild hot reloading in development
type Window = typeof window & { IS_PRODUCTION: boolean };
if (!(window as Window).IS_PRODUCTION) {
  new EventSource('/esbuild').addEventListener('change', () => location.reload())
};