import { Desenhador, Mesh } from "desenha"
import vertex from "./shaders/debugUv/vertex.glsl"
import fragment from "./shaders/debugUv/fragment.glsl"
import cubeGeometry from "desenha/src/geometries/cube"

class WebGPUApp {
    private canvas: HTMLCanvasElement
    private renderer: Desenhador
    private meshes: Mesh[] = [] // These will get drawn at render time
    private then = 0;
    private elapsedTime = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
    }

    public init = () => {
        this.renderer = new Desenhador(this.canvas)
        const { gl, dpr } = this.renderer;

        const parameters = {
            position: { x: 0, y: 0, z: -7.5 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 }
        }
        const cube = new Mesh({
            geometry: cubeGeometry,
            name: 'Cube',
            shaders: [vertex, fragment],
            locationNames: {
                attributes: ['aPosition', 'aUv'],
                uniforms: ['uProjectionMatrix', 'uModelMatrix']
            },
            parameters,
            gl
        })

        cube.addOnBeforeDrawCallback((mesh, elapsedTime) => {
            mesh.rotation[0] -= 0.01
            mesh.rotation[1] += 0.01
        })

        this.meshes.push(cube)

        this.meshes.reverse()
    }

    public tick = (now: number) => {
        const { draw } = this.renderer

        const deltaTime = now - this.then;
        this.then = now;

        this.elapsedTime += deltaTime;

        draw(this.meshes, this.elapsedTime, deltaTime);

        requestAnimationFrame(this.tick);
    }
}

export default WebGPUApp
