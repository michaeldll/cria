import Camera from "./Camera";
import Mesh from "./Mesh";
import Scene from "./Scene";

type RendererSettings = {
	format: GPUTextureFormat;
	depth: boolean;
	sampleCount: 1 | 4;
	dpr: number;
};

/**
 * This is the main entry point to the WebGPU app.
 */
export default class Renderer {
	public canvas: HTMLCanvasElement;
	public settings: RendererSettings;

	private adapter: GPUAdapter;
	public device: GPUDevice;
	private context: GPUCanvasContext;
	private commandEncoder: GPUCommandEncoder;
	public passEncoder: GPURenderPassEncoder;
	private colorTexture: GPUTexture;
	private colorTextureView: GPUTextureView;
	private renderPassDescriptor: GPURenderPassDescriptor;
	private renderTarget: GPUTexture;
	private renderTargetView: GPUTextureView;
	private depthTexture: GPUTexture;
	private depthTextureView: GPUTextureView;

	constructor(
		canvas: HTMLCanvasElement,
		settings: RendererSettings = {
			format: undefined,
			depth: true,
			dpr: 2,
			sampleCount: 4, // can be 1 or 4
		},
	) {
		this.canvas = canvas;
		this.settings = settings;
	}

	async init() {
		await this.initAPI();
		this.initRenderPassDescriptor();
	}

	/* Initialisation :*/
	// [0]: Adapter, device, context
	async initAPI() {
		// [0]: Check for WebGPU support first by seeing if navigator.gpu exists.
		if (!navigator.gpu) {
			// Inject error dialog box
			const errorDialog = document.createElement("dialog");
			errorDialog.textContent = "This browser does not support WebGPU.";
			errorDialog.style.display = "block";
			document.body.append(errorDialog);

			// Throw error
			throw new Error("This browser does not support WebGPU.");
		}

		// [0]: WebGPU apps start by getting an Adapter, which represents a physical GPU.
		this.adapter = await navigator.gpu.requestAdapter();

		// [0]: From the adapter, you get a Device, which is the primary WebGPU API on the GPU.
		this.device = await this.adapter.requestDevice();

		// [0]: Devices on their own don't display anything on the page. You need to
		// [0]: configure a canvas context as the output surface.
		this.context = this.canvas.getContext("webgpu");
		this.settings.format = navigator.gpu.getPreferredCanvasFormat();
		this.context.configure({
			device: this.device,
			// [0]: Mobile and desktop devices have different formats they prefer to output,
			// so usually you'll want to use the "preferred format" for you platform,
			// as queried from navigator.gpu.
			format: this.settings.format,
		});
	}

	initRenderPassDescriptor() {
		let basicColorAttachment: GPURenderPassColorAttachment = {
			view: this.colorTextureView,
			clearValue: { r: 0, g: 0, b: 0, a: 1 },
			loadOp: "clear",
			storeOp: "store",
		};

		let renderPassColorAttachment: GPURenderPassColorAttachment = {
			...basicColorAttachment,
			resolveTarget: undefined, // Assigned Later
		};

		let depthAttachment: GPURenderPassDepthStencilAttachment = {
			view: undefined,
			depthLoadOp: "clear",
			depthStoreOp: "store",
			depthClearValue: 1.0,
		};

		const basicRenderPassDescriptor: GPURenderPassDescriptor = {
			label: "Basic Render Pass",
			colorAttachments: [basicColorAttachment],
		};

		const multisampledRenderPassDescriptor: GPURenderPassDescriptor = {
			label: "Multisampled non-depth Render Pass",
			colorAttachments: [renderPassColorAttachment],
		};

		const depthMultisampledRenderPassDescriptor: GPURenderPassDescriptor = {
			label: "Multisampled Depth Render Pass",
			colorAttachments: [renderPassColorAttachment],
			depthStencilAttachment: depthAttachment,
		};

		if (this.settings.sampleCount > 1 && !this.settings.depth) {
			this.renderPassDescriptor = multisampledRenderPassDescriptor;
		} else if (this.settings.sampleCount > 1 && this.settings.depth) {
			this.renderPassDescriptor = depthMultisampledRenderPassDescriptor;
		} else {
			this.renderPassDescriptor = basicRenderPassDescriptor;
		}
	}

	/* Events */
	//[1]: resizeToDisplaySize
	resize = () => {
		const { canvas, device, renderTarget, depthTexture } = this;
		const { format, sampleCount, depth } = this.settings;

		// Lookup the size the browser is displaying the canvas in CSS pixels.
		// Unlike WebGL, we also need to clamp the size to the max size the GPU can render (device.limits).
		const width = Math.max(1, Math.min(device.limits.maxTextureDimension2D, canvas.clientWidth)); // TODO: Shouldn't be done at every frame
		const height = Math.max(1, Math.min(device.limits.maxTextureDimension2D, canvas.clientHeight)); // TODO: Shouldn't be done at every frame

		const needResize = (sampleCount > 1 && !renderTarget) || width !== canvas.width || height !== canvas.height;

		if (!needResize) return;

		// Resizing:
		canvas.width = width * this.settings.dpr;
		canvas.height = height * this.settings.dpr;

		// Rebuild render target
		if (renderTarget) renderTarget.destroy();
		if (sampleCount > 1) {
			const newRenderTarget = device.createTexture({
				size: [canvas.width, canvas.height],
				format,
				sampleCount,
				usage: GPUTextureUsage.RENDER_ATTACHMENT,
			});
			this.renderTarget = newRenderTarget;
			this.renderTargetView = newRenderTarget.createView();
		}

		// Rebuild depth texture
		if (depthTexture) depthTexture.destroy();
		if (depth) {
			const newDepthTexture = device.createTexture({
				size: [canvas.width, canvas.height],
				format: "depth24plus",
				sampleCount,
				usage: GPUTextureUsage.RENDER_ATTACHMENT,
			});
			this.depthTexture = newDepthTexture;
			this.depthTextureView = newDepthTexture.createView();
		}
	};

	/* Rendering: */
	// [0]: Write and submit commands to queue
	encodeCommands = (scene: Scene, camera: Camera, time: number) => {
		// [0]: Get the current texture from the canvas context and set it as the texture to render to.
		this.colorTexture = this.context.getCurrentTexture();
		this.colorTextureView = this.colorTexture.createView();

		if (this.settings.sampleCount === 1) {
			this.renderPassDescriptor.colorAttachments[0].view = this.colorTexture.createView();
		} else {
			// If we're using multisampling, we need to render to a texture, then resolve it to the canvas.
			this.renderPassDescriptor.colorAttachments[0].view = this.renderTargetView;
			this.renderPassDescriptor.colorAttachments[0].resolveTarget = this.context.getCurrentTexture().createView();
			if (this.settings.depth) {
				this.renderPassDescriptor.depthStencilAttachment.view = this.depthTextureView;
			}
		}

		// [0]: Command encoders record commands for the GPU to execute.
		this.commandEncoder = this.device.createCommandEncoder({ label: "Main Command Encoder" });

		// Start rendering:
		// [0]: All rendering commands happen in a render pass.
		this.passEncoder = this.commandEncoder.beginRenderPass(this.renderPassDescriptor);

		// Traverse scene graph
		for (const node of scene?.children) {
			if (node instanceof Mesh) node.render(camera, time);
		}

		this.passEncoder.end();

		// [0]: Finish recording commands, which creates a command buffer.
		return this.commandEncoder.finish();
	};

	render = (scene: Scene, camera: Camera, time: number) => {
		this.resize();

		const commandBuffer = this.encodeCommands(scene, camera, time);

		// [0]: Command buffers don't execute right away, you have to submit them to the device queue.
		this.device.queue.submit([commandBuffer]);
	};
}
