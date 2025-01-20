import Renderer from "@/core/Renderer"
import Cube from "@/wip/Cube"
import cubeShader from "./shaders/debugUv.wgsl"
import { BoxGeometry } from "@/index";

const canvas = document.querySelector('#mainCanvas') as HTMLCanvasElement
const renderer = new Renderer(canvas);
let cubes: Cube[] = [];

renderer.init().then(() => {
    // TODO: delay any potential references to GPUDevice to after the renderer has been initialized in order to improve API
    const COUNT = 5
    for (let index = 0; index < COUNT; index++) {
        const cube = new Cube(renderer, new BoxGeometry(1), cubeShader)
        cube.position[0] = -(index) + 2
        cube.scale[0] = .2
        cube.scale[1] = .2
        cube.scale[2] = .2
        cubes.push(cube);
        renderer.scene.push(cube)
    }
})

const tick = (time: number) => {
    requestAnimationFrame(tick)

    if (!renderer.device) return

    for (const cube of cubes) {
        cube.rotation[0] -= 0.01
        cube.rotation[1] += 0.01
    }

    renderer.render(time)
}

requestAnimationFrame(tick)