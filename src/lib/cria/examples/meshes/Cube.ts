import Criador from "../../renderer";
import Mesh from "../../core/Mesh";
import Geometry from "../../geometries/cube";
import createBuffer from "../../utils/createBuffer";
import { vec3, mat4, Mat4 } from 'wgpu-matrix';

const FOV = 40;
const NEAR = 0.1;
const FAR = 10;
const EYE = [1, 4, -6];
const LOOK_AT = [0, 0, 0];
const UP = [0, 1, 0];
const LIGHT_DIRECTION = [1, 8, -10]

export default class Cube extends Mesh {
    positionsBuffer: GPUBuffer;
    normalsBuffer: GPUBuffer;
    uvsBuffer: GPUBuffer;
    indicesBuffer: GPUBuffer;
    bindGroup: GPUBindGroup
    shader: string

    texture: GPUTexture
    sampler: GPUSampler

    vertexUniformBuffer: GPUBuffer
    fragmentUniformBuffer: GPUBuffer
    vertexUniformValues: Float32Array
    fragmentUniformValues: Float32Array

    projectionMatrix: Mat4 = mat4.identity();
    viewMatrix: Mat4 = mat4.identity();
    modelMatrix: Mat4 = mat4.identity();
    viewProjectionMatrix: Mat4 = mat4.identity();
    modelViewProjectionMatrix: Float32Array
    modelInverseTransposeMatrix: Float32Array

    lightDirection: Float32Array

    constructor(renderer: Criador, shader: string) {
        super(renderer, shader);
    }

    public init = () => {
        this.initShaderModules(this.shader);
        this.initAttributeBuffers();
        this.initTexture();
        this.initSampler();
        this.initPipeline();
        this.initUniforms();
        this.initBindGroup();
    }

    protected initShaderModules = (shader: string): void => {
        this.shaderModule = this.device.createShaderModule({
            label: 'Cube Shader Module', // Labels are useful for debugging 
            code: shader
        });
    }

    protected initAttributeBuffers = (): void => {
        const { positions, indices, normals, uvs } = Geometry;
        // [0]: It's easiest to specify vertex data with TypedArrays, like a Float32Array. You are responsible for making sure the layout of the data matches the layout that you describe in the pipeline 'buffers'.
        this.positionsBuffer = createBuffer(this.device, positions, GPUBufferUsage.VERTEX);
        this.normalsBuffer = createBuffer(this.device, normals, GPUBufferUsage.VERTEX);
        this.uvsBuffer = createBuffer(this.device, uvs, GPUBufferUsage.VERTEX);
        this.indicesBuffer = createBuffer(this.device, indices, GPUBufferUsage.INDEX);

        // [0]: writeBuffer is the easiest way to TypedArray data into a buffer.
        this.device.queue.writeBuffer(this.positionsBuffer, 0, positions);
        this.device.queue.writeBuffer(this.uvsBuffer, 0, uvs);
        this.device.queue.writeBuffer(this.indicesBuffer, 0, indices);
    }

    protected initTexture = (): void => {
        this.texture = this.device.createTexture({
            size: [2, 2],
            format: 'rgba8unorm',
            usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST,
        });
        this.device.queue.writeTexture(
            { texture: this.texture },
            new Uint8Array([
                255, 255, 128, 255,
                128, 255, 255, 255,
                255, 128, 255, 255,
                255, 128, 128, 255,
            ]),
            { bytesPerRow: 8, rowsPerImage: 2 },
            { width: 2, height: 2 },
        );
    }

    protected initSampler = (): void => {
        this.sampler = this.device.createSampler({
            magFilter: 'nearest',
            minFilter: 'nearest',
        });
    }

    // [1]: A pipeline, or more specifically a “render pipeline”, represents a pair of shaders used in a particular way.
    protected initPipeline = (): void => {
        // [0]: Pipelines bundle most of the render state (like primitive types, blend modes, etc) and shader entry points into one big object.
        // [1]: Shader linking happens when you call createRenderPipeline, so it is a slow call as your shaders might be adjusted internally depending on the settings. 
        this.pipeline = this.device.createRenderPipeline({
            label: 'Cube Shader Pipeline',
            // [0]: All pipelines need a layout, but if you don't need to share data between pipelines you can use the 'auto' layout to have it generate one for you!
            layout: 'auto',
            vertex: {
                module: this.shaderModule,
                entryPoint: 'vertexMain',
                // [0]: `buffers` describes the layout of the attributes in the vertex buffers.
                buffers: [
                    // position
                    {
                        arrayStride: 3 * 4, // 3 floats, 4 bytes each
                        attributes: [
                            { shaderLocation: 0, offset: 0, format: 'float32x3' },
                        ],
                    },
                    // normals
                    {
                        arrayStride: 3 * 4, // 3 floats, 4 bytes each
                        attributes: [
                            { shaderLocation: 1, offset: 0, format: 'float32x3' },
                        ],
                    },
                    // uv
                    {
                        arrayStride: 2 * 4, // 2 floats, 4 bytes each
                        attributes: [
                            { shaderLocation: 2, offset: 0, format: 'float32x2', },
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
                topology: 'triangle-list',
                cullMode: 'back', // [2] Default is 'none'
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            },
            ...(this.renderer.settings.sampleCount > 1 && {
                multisample: {
                    count: this.renderer.settings.sampleCount,
                },
            }),
        });
    }

    protected initUniforms = (): void => {
        const vUniformBufferSize = 2 * 16 * 4; // 2 mat4s * 16 floats per mat * 4 bytes per float
        const fUniformBufferSize = 3 * 4;      // 1 vec3 * 3 floats per vec3 * 4 bytes per float

        this.vertexUniformBuffer = this.device.createBuffer({
            size: Math.max(16, vUniformBufferSize),
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.fragmentUniformBuffer = this.device.createBuffer({
            size: Math.max(16, fUniformBufferSize),
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.vertexUniformValues = new Float32Array(2 * 16); // 2 mat4s
        this.modelViewProjectionMatrix = this.vertexUniformValues.subarray(0, 16);
        this.modelInverseTransposeMatrix = this.vertexUniformValues.subarray(16, 32);

        this.fragmentUniformValues = new Float32Array(3);  // 1 vec3
        this.lightDirection = this.fragmentUniformValues.subarray(0, 3);
    }

    protected initBindGroup = (): void => {
        this.bindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.vertexUniformBuffer } },
                { binding: 1, resource: { buffer: this.fragmentUniformBuffer } },
                { binding: 2, resource: this.sampler },
                { binding: 3, resource: this.texture.createView() },
            ],
        });
    }

    public calcMatrices = (time: number): void => {
        // Model
        this.modelMatrix = mat4.identity();
        this.modelMatrix = mat4.translate(this.modelMatrix, this.position);
        this.modelMatrix = mat4.rotateX(this.modelMatrix, this.rotation[0]);
        this.modelMatrix = mat4.rotateY(this.modelMatrix, this.rotation[1]);
        this.modelMatrix = mat4.rotateZ(this.modelMatrix, this.rotation[2]);
        this.modelMatrix = mat4.scale(this.modelMatrix, this.scale);

        mat4.transpose(mat4.inverse(this.modelMatrix), this.modelInverseTransposeMatrix);

        // Projection
        this.projectionMatrix = mat4.perspective(FOV * Math.PI / 180, this.renderer.canvas.clientWidth / this.renderer.canvas.clientHeight, NEAR, FAR);

        // View
        this.viewMatrix = mat4.lookAt(EYE, LOOK_AT, UP);
        this.viewProjectionMatrix = mat4.multiply(this.projectionMatrix, this.viewMatrix);

        // Model View Projection
        mat4.multiply(this.viewProjectionMatrix, this.modelMatrix, this.modelViewProjectionMatrix);
    }

    public render = (time: number): void => {
        this.calcMatrices(time);

        // Directional Light
        vec3.normalize(LIGHT_DIRECTION, this.lightDirection);

        // Uniforms
        this.device.queue.writeBuffer(this.vertexUniformBuffer, 0, this.vertexUniformValues);
        this.device.queue.writeBuffer(this.fragmentUniformBuffer, 0, this.fragmentUniformValues);

        // [0]: Set the pipeline to use when drawing.
        this.renderer.passEncoder.setPipeline(this.pipeline);

        // Be sure to setBindGroup() before drawing.
        this.renderer.passEncoder.setBindGroup(0, this.bindGroup);

        // [0]: Set the vertex buffer to use when drawing. The `0` corresponds to the index of the `buffers` array in the pipeline.
        this.renderer.passEncoder.setVertexBuffer(0, this.positionsBuffer);
        this.renderer.passEncoder.setVertexBuffer(1, this.normalsBuffer);
        this.renderer.passEncoder.setVertexBuffer(2, this.uvsBuffer);
        this.renderer.passEncoder.setIndexBuffer(this.indicesBuffer, 'uint16');
        this.renderer.passEncoder.drawIndexed(Geometry.indices.length);

        // [1]: Back in WebGL we needed to call gl.viewport. In WebGPU, the pass encoder defaults to a viewport that matches the size of the attachments so unless we want a viewport that doesn’t match we don’t have to set a viewport separately.

        // We also don’t need to call gl.clearColor or gl.clearDepth. Instead, we specify the clear values when we begin the render pass.

        // [1]: In WebGL we called gl.clear to clear the canvas. Whereas in WebGPU we had previously set that up when creating our render pass descriptor.
    }
}