import Renderer from "@/core/Renderer";
import Scene from "@/core/Scene";
import Cube from "@/wip/Cube";
import shader from "./shaders/debugUv.wgsl";
import PerspectiveCamera from "@/core/PerspectiveCamera";
import BoxGeometry from "@/geometries/BoxGeometry";

const canvas = document.querySelector("#mainCanvas") as HTMLCanvasElement;
const renderer = new Renderer(canvas);

let scene: Scene;
let camera: PerspectiveCamera;
let cube: Cube;

renderer.init().then(() => {
	scene = new Scene();

	camera = new PerspectiveCamera(30, renderer.canvas.clientWidth / renderer.canvas.clientHeight);
	camera.position[2] = -10;
	camera.updateViewMatrix();
	camera.updateViewProjectionMatrix();

	cube = new Cube(renderer, new BoxGeometry(1), shader);
	scene.add(cube);
});

const tick = (time: number) => {
	requestAnimationFrame(tick);

	if (!renderer.device || !cube) return;

	cube.rotation[0] -= 0.01;
	cube.rotation[1] += 0.01;

	renderer.render(scene, camera, time);
};

requestAnimationFrame(tick);

// Enable esbuild hot reloading in development:
type Window = typeof window & { IS_PRODUCTION: boolean };
if (!(window as Window).IS_PRODUCTION) {
	new EventSource("/esbuild").addEventListener("change", () => location.reload());
}
