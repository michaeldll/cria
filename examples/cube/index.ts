import Renderer from "@/core/Renderer";
import Cube from "@/wip/Cube";
import cubeShader from "./shaders/debugUv.wgsl";
import { BoxGeometry } from "@/index";

const canvas = document.querySelector("#mainCanvas") as HTMLCanvasElement;
const renderer = new Renderer(canvas);

// TODO: delay references to GPUDevice to after the renderer has been initialized in order to improve API
let cube: Cube;
renderer.init().then(() => {
	cube = new Cube(renderer, new BoxGeometry(1), cubeShader);
	renderer.scene.push(cube);
});

const tick = (time: number) => {
	requestAnimationFrame(tick);

	if (!renderer.device) return;

	cube.rotation[0] -= 0.01;
	cube.rotation[1] += 0.01;

	renderer.render(time);
};

requestAnimationFrame(tick);
