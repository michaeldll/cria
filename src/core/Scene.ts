import Camera from "./Camera";
import Object3D from "./Object3D";

export default class Scene extends Object3D {
	camera: Camera;

	constructor() {
		super();
	}
}
