import { vec3, mat4, Mat4, Vec3 } from "wgpu-matrix";

export default class Object3D {
	public position: Vec3 = vec3.fromValues(0, 0, 0);
	public rotation: Vec3 = vec3.fromValues(0, 0, 0);
	public scale: Vec3 = vec3.fromValues(1, 1, 1);
	public modelMatrix: Mat4 = mat4.create();
	public parent: Object3D | null = null;
}
