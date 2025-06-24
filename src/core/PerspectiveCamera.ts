import { mat4 } from "wgpu-matrix";
import Camera, { CameraOptions } from "./Camera";

export default class PerspectiveCamera extends Camera {
	public fov: number = 45;
	public aspect: number = 1;

	constructor(fov = 45, aspect = 1, options?: CameraOptions) {
		super(options);

		this.fov = fov;
		this.aspect = aspect;

		this.updateViewMatrix();
		this.updateProjectionMatrix();
		this.updateViewProjectionMatrix();
	}

	public updateProjectionMatrix(aspect?: number) {
		if (aspect !== undefined) {
			this.aspect = aspect;
		}
		this.projectionMatrix = mat4.perspective(
			(this.fov * Math.PI) / 180,
			this.aspect,
			this.near,
			this.far
		);
	}

	public updateViewProjectionMatrix() {
		this.viewProjectionMatrix = mat4.multiply(this.projectionMatrix, this.viewMatrix);
	}
}
