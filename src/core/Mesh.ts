import Renderer from "./Renderer";
import Object3D from "./Object3D";
import Geometry from "./Geometry";
import Camera from "./Camera";

export default abstract class Mesh extends Object3D {
	public renderer: Renderer;
	protected device: GPUDevice;
	public geometry: Geometry;
	protected shader: string;
	protected shaderModule: GPUShaderModule;
	protected pipeline: GPURenderPipeline;

	constructor(renderer: Renderer, geometry: Geometry, shader: string) {
		super();
		this.renderer = renderer;
		this.device = renderer.device;
		this.geometry = geometry;
		this.shader = shader;
	}

	protected abstract initShaderModules(shader: string): void;
	protected abstract initAttributeBuffers(): void;
	protected abstract initPipeline(): void;
	protected initUniforms?(): void;
	protected initTexture?(): void;
	public render?(camera: Camera, time?: number): void;
}
