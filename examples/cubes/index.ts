import Renderer from "@/core/Renderer";
import Cube from "@/wip/Cube";
import cubeShader from "./shaders/debugUv.wgsl";
import { BoxGeometry } from "@/index";
import PerspectiveCamera from "@/core/PerspectiveCamera";

const canvas = document.querySelector("#mainCanvas") as HTMLCanvasElement;
const renderer = new Renderer(canvas);
const cubes: Cube[] = [];
const COUNT = 5;

renderer.init().then(() => {
	renderer.scene.camera = new PerspectiveCamera(30, renderer.canvas.clientWidth / renderer.canvas.clientHeight);
	renderer.scene.camera.position[3] = -5;

	for (let index = 0; index < COUNT; index++) {
		const cube = new Cube(renderer, new BoxGeometry(1), cubeShader);
		cube.position[0] = -index + 2;
		cube.scale[0] = 0.2;
		cube.scale[1] = 0.2;
		cube.scale[2] = 0.2;
		cubes.push(cube);
		renderer.scene.add(cube);
	}
});

const tick = (time: number) => {
	requestAnimationFrame(tick);

	if (!renderer.device) return;

	for (const cube of cubes) {
		cube.rotation[0] -= 0.01;
		cube.rotation[1] += 0.01;
	}

	renderer.render(time);
};

requestAnimationFrame(tick);

// Enable esbuild hot reloading in development:
type Window = typeof window & { IS_PRODUCTION: boolean };
if (!(window as Window).IS_PRODUCTION) {
	new EventSource("/esbuild").addEventListener("change", () => location.reload());
}
