import { mat4 } from "wgpu-matrix";
import Camera, { CameraOptions } from "./Camera";

export default class PerspectiveCamera extends Camera {
	fov: number = 45;
	aspect: number = 1;

	constructor(fov = 45, aspect = 1, options?: CameraOptions) {
		super(options);

		this.fov = fov;
		this.projectionMatrix = mat4.perspective((this.fov * Math.PI) / 180, aspect, this.near, this.far);
		this.viewProjectionMatrix = mat4.multiply(this.projectionMatrix, this.viewMatrix);
	}
}
