import Geometry from "@/core/Geometry";

export default class BoxGeometry extends Geometry {
	constructor(size: number) {
		super();

		this.positions = new Float32Array([size, size, -size, size, size, size, size, -size, size, size, -size, -size, -size, size, size, -size, size, -size, -size, -size, -size, -size, -size, size, -size, size, size, size, size, size, size, size, -size, -size, size, -size, -size, -size, -size, size, -size, -size, size, -size, size, -size, -size, size, size, size, size, -size, size, size, -size, -size, size, size, -size, size, -size, size, -size, size, size, -size, size, -size, -size, -size, -size, -size]);
		this.normals = new Float32Array([1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1]);
		this.uvs = new Float32Array([1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1]);
		this.indices = new Uint16Array([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23]);
	}
}
