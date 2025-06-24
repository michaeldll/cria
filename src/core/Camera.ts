import { vec3, mat4, Mat4, Vec3 } from "wgpu-matrix";
import Object3D from "./Object3D";

export type CameraOptions = { near: number; far: number };

export default class Camera extends Object3D {
    near: number = 0.01;
    far: number = 1000;
    lookAt: Vec3 = vec3.create();
    projectionMatrix: Mat4 = mat4.identity();
    viewMatrix: Mat4 = mat4.identity();
    viewProjectionMatrix: Mat4 = mat4.identity();

    constructor({ near, far }: CameraOptions = { near: 0.01, far: 1000 }) {
        super();

        this.near = near;
        this.far = far;
    }

    updateViewMatrix() {
        this.viewMatrix = mat4.lookAt(this.position, this.lookAt, this.up);
    }
}
