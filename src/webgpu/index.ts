import Criador from "@/lib/cria/renderer"
import cubeShader from "./shaders/debugUv.wgsl"
import Cube from "@/lib/cria/examples/meshes/Cube"

class WebGPUApp {
    private canvas: HTMLCanvasElement
    private renderer: Criador
    private cube: Cube

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
    }

    init = async () => new Promise<void>((resolve, reject) => {
        this.renderer = new Criador(this.canvas)

        this.renderer.init().then(() => {
            this.addMeshes();
            resolve()
        })
    })

    addMeshes = () => {
        // Cube
        this.cube = new Cube(this.renderer, cubeShader)
        this.cube.init()
        this.renderer.sceneGraph.push(this.cube)
    }

    tick = (time: number) => {
        this.cube.rotation[0] += 0.01
        this.cube.rotation[1] += 0.01

        this.renderer.render(time)

        requestAnimationFrame(this.tick)
    }
}

export default WebGPUApp