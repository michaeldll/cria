import { vec3, mat4, Mat4, Vec3 } from "wgpu-matrix";

// Greatly inspired by:
// https://github.com/mrdoob/three.js/blob/master/src/core/Object3D.js
export default class Object3D {
	position: Vec3 = vec3.create();
	rotation: Vec3 = vec3.create();
	scale: Vec3 = vec3.fromValues(1, 1, 1);
	modelMatrix: Mat4 = mat4.create();
	parent: Object3D | null = null;
	children: Object3D[] = [];
	up: Vec3 = vec3.create(0, 1, 0);
	lookAt: Vec3 = vec3.create();

	setParent(parent: Object3D) {
		if (this.parent && parent !== this.parent) this.parent.remove(this);
		this.parent = parent;
	}

	add(object: Object3D) {
		if (this.children.indexOf(object) === -1) {
			if (this.parent) this.removeFromParent();
			object.parent = this;
			this.children.push(object);
		} else {
			console.error("Object3D: can't add an object as a child of itself.");
		}
	}

	remove(object: Object3D) {
		const index = this.children.indexOf(object);

		if (index !== -1) {
			object.parent = null;
			this.children.splice(index, 1);
		} else {
			console.warn("Object3D: object to be removed is not a child of this object.");
		}

		return this;
	}

	removeFromParent() {
		if (this.parent !== null) {
			this.parent.remove(this);
		} else {
			console.warn("Object3D: Tried to remove from a missing parent.");
		}

		return this;
	}
}
