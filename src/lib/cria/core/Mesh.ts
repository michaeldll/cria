import Criador from "../renderer";
import Object3D from "./Object3D";

export default abstract class Mesh extends Object3D {
    public renderer: Criador;
    protected device: GPUDevice;
    protected shader: string;
    protected shaderModule: GPUShaderModule;
    protected pipeline: GPURenderPipeline;

    constructor(renderer: Criador, shader: string) {
        super();
        this.renderer = renderer;
        this.device = renderer.device;
        this.shader = shader;
    }

    protected abstract initShaderModules(shader: string): void;
    protected abstract initAttributeBuffers(): void;
    protected abstract initPipeline(): void;
    protected initUniforms?(): void
    protected initTexture?(): void
    public render?(time?: number): void
}