import Geometry from "@/core/Geometry";

export default class PlaneGeometry extends Geometry {
    constructor(size: number) {
        super();

        this.positions = new Float32Array([
            -size, -size, 0.0,
            size, -size, 0.0,
            size, size, 0.0,
            -size, size, 0.0,
        ])
        this.normals = new Float32Array([
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
        ]);
        this.uvs = new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ]);
        this.indices = new Uint16Array([
            0, 1, 2, 0, 2, 3,
        ]);
    }
}