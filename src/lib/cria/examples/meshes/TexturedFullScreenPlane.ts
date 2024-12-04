import Criador from "../../renderer";
import Geometry from "../../geometries/plane";
import Mesh from "../../core/Mesh";
import createBuffer from "../../utils/createBuffer";
import { loadImageBitmap } from "../../utils/loadImageBitmap";
import numMipLevels from "../../utils/numMipLevels";

export default class TexturedPlane extends Mesh {
    fragmentShaderUniformValues: Float32Array;
    uniformBuffer: GPUBuffer;
    uniformValues: Float32Array;
    positionsBuffer: GPUBuffer;
    uvsBuffer: GPUBuffer;
    indicesBuffer: GPUBuffer;
    bindGroup: GPUBindGroup
    texture: GPUTexture
    sampler: GPUSampler
    shader: string

    constructor(renderer: Criador, shader: string) {
        super(renderer, shader);
    }

    public async init(): Promise<void> {
        this.initShaderModules(this.shader);
        this.initAttributeBuffers();
        this.initPipeline();
        this.initUniforms();
        const [texture, sampler] = await this.getImageTexture('assets/comfyui_sd_galaxy/jpg/0008.jpg');
        this.texture = texture
        this.sampler = sampler
        this.initBindGroup();
    }

    protected initShaderModules = (shader: string): void => {
        this.shaderModule = this.renderer.device.createShaderModule({
            label: 'Fullscreen Shader Module',
            code: shader
        });
    }

    protected initAttributeBuffers(): void {
        const { positions, indices, uvs } = Geometry;
        // [0]: It's easiest to specify vertex data with TypedArrays, like a Float32Array. You are responsible for making sure the layout of the data matches the layout that you describe in the pipeline 'buffers'.
        this.positionsBuffer = createBuffer(this.renderer.device, positions, GPUBufferUsage.VERTEX);
        this.uvsBuffer = createBuffer(this.renderer.device, uvs, GPUBufferUsage.VERTEX);
        this.indicesBuffer = createBuffer(this.renderer.device, indices, GPUBufferUsage.INDEX);

        // [0]: writeBuffer is the easiest way to TypedArray data into a buffer.
        this.renderer.device.queue.writeBuffer(this.positionsBuffer, 0, positions);
        this.renderer.device.queue.writeBuffer(this.uvsBuffer, 0, uvs);
        this.renderer.device.queue.writeBuffer(this.indicesBuffer, 0, indices);
    }

    // [1]: A pipeline, or more specifically a “render pipeline”, represents a pair of shaders used in a particular way.
    protected initPipeline(): void {
        // [0]: Pipelines bundle most of the render state (like primitive types, blend
        // [0]: modes, etc) and shader entry points into one big object.
        // [1]: Shader linking happens when you call createRenderPipeline, so it is a slow call as your shaders might be adjusted internally depending on the settings. 
        this.pipeline = this.renderer.device.createRenderPipeline({
            label: 'Triangle Render Pipeline',
            // [0]: All pipelines need a layout, but if you don't need to share data between pipelines you can use the 'auto' layout to have it generate one for you!
            layout: 'auto',
            vertex: {
                module: this.shaderModule,
                entryPoint: 'vertexMain',
                // [0]: `buffers` describes the layout of the attributes in the vertex buffers.
                buffers: [
                    {
                        arrayStride: 3 * 4, // [0]: Bytes per vertex (3 floats)
                        attributes: [{
                            shaderLocation: 0, // [0]: VertexIn.pos in the shader
                            offset: 0, // [0]: Starts at the beginning of the buffer
                            format: 'float32x3' // [0]: Data is 3 floats
                        }]
                    },
                    // texcoords
                    {
                        arrayStride: 2 * 4,
                        attributes: [
                            { shaderLocation: 1, offset: 0, format: 'float32x2', },
                        ],
                    },
                ],
            },
            fragment: {
                module: this.shaderModule,
                entryPoint: 'fragmentMain',
                // [0]: `targets` indicates the format of each render target this pipeline outputs to. It must match the colorAttachments of any renderPass it's used with.
                targets: [{
                    format: navigator.gpu.getPreferredCanvasFormat(),
                }],
            },
            primitive: {
                cullMode: 'back', // [2] Default is 'none'
            },
            ...(this.renderer.settings.sampleCount > 1 && {
                multisample: {
                    count: this.renderer.settings.sampleCount,
                },
            }),
        });
    }

    protected initUniforms(): void {
        // [1]: 1 vec2 = 2 floats per vec4 * 4 bytes per floating point number
        const size = 2 * 4;

        // // Unlike WebGL, we have to create a buffer to store our uniform data
        this.uniformBuffer = this.renderer.device.createBuffer({
            size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        // [1]: create a typedarray to hold the values for the uniforms in JavaScript
        this.uniformValues = new Float32Array(size / 4);
        this.uniformValues.set([this.renderer.canvas.offsetWidth, this.renderer.canvas.offsetHeight], 0); // just using offsetWidth for now

        // Make sure to create a bind group to bind this buffer to a uniform slot in the shader
    }

    protected initBindGroup(): void {
        // Validation: https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/createBindGroup#validation
        // You MUST use the bindings in the shader (and not just declare them) for getBindGroupLayout() to work!
        this.bindGroup = this.renderer.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: this.sampler },
                { binding: 1, resource: this.texture.createView() },
                { binding: 2, resource: { buffer: this.uniformBuffer } },
            ],

        });

        // Be sure to setBindGroup() before drawing.
    }

    protected getTexture(): [GPUTexture, GPUSampler] {
        const texture = this.renderer.device.createTexture({
            size: [2, 2],
            format: 'rgba8unorm',
            usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST,
        });
        this.renderer.device.queue.writeTexture(
            { texture },
            new Uint8Array([
                255, 255, 128, 255,
                128, 255, 255, 255,
                255, 128, 255, 255,
                255, 128, 128, 255,
            ]),
            { bytesPerRow: 8, rowsPerImage: 2 },
            { width: 2, height: 2 },
        );

        const sampler = this.renderer.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
        });

        return [texture, sampler]
    }


    protected async getImageTexture(url: string): Promise<[GPUTexture, GPUSampler]> {
        return new Promise(async (resolve, reject) => {
            const source = await loadImageBitmap(url)

            const texture = this.renderer.device.createTexture({
                label: url,
                format: 'rgba8unorm',
                mipLevelCount: numMipLevels(source.width, source.height),
                size: [source.width, source.height],
                usage: GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_DST |
                    GPUTextureUsage.RENDER_ATTACHMENT,
            });

            this.renderer.device.queue.copyExternalImageToTexture(
                { source, flipY: true },
                { texture },
                { width: source.width, height: source.height },
            );

            const sampler = this.renderer.device.createSampler({
                magFilter: 'linear',
                minFilter: 'linear',
            });

            resolve([texture, sampler])
        })
    }

    public render = (): void => {
        const { device, passEncoder, canvas, settings } = this.renderer;

        // [0]: Set the pipeline to use when drawing.
        // [1]: which is kind of like the equivalent of gl.useProgram
        passEncoder.setPipeline(this.pipeline);
        // Set resolution uniform values and
        // [1]: copy the values from JavaScript to the GPU;
        this.uniformValues.set([canvas.offsetWidth * settings.dpr, canvas.offsetHeight * settings.dpr], 0); // just using offsetWidth for now 
        device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformValues);
        // [1]: The bind group supplies samplers, textures, and uniforms buffers
        // You actually don't need this if you don't have any uniforms
        passEncoder.setBindGroup(0, this.bindGroup);
        // [0]: Set the vertex buffer to use when drawing. The `0` corresponds to the index of the `buffers` array in the pipeline.
        passEncoder.setVertexBuffer(0, this.positionsBuffer);
        passEncoder.setVertexBuffer(1, this.uvsBuffer);
        passEncoder.setIndexBuffer(this.indicesBuffer, 'uint16');
        passEncoder.drawIndexed(Geometry.indices.length);
        // [0]: Draw 3 vertices using the previously set pipeline and vertex buffer.
        passEncoder.draw(3);

        // [1]: Back in WebGL we needed to call gl.viewport. In WebGPU, the pass encoder defaults to a viewport that matches the size of the attachments so unless we want a viewport that doesn’t match we don’t have to set a viewport separately.

        // We also don’t need to call gl.clearColor or gl.clearDepth. Instead, we specify the clear values when we begin the render pass.

        // [1]: In WebGL we called gl.clear to clear the canvas. Whereas in WebGPU we had previously set that up when creating our render pass descriptor.
    }
}