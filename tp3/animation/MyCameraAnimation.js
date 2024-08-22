import { CGFcamera } from '../../lib/CGF.js';

export class MyCameraAnimation {
    constructor(scene, initialCamera, finalCamera) {
        this.scene = scene;
        this.initialCamera = initialCamera;
        this.finalCamera = finalCamera;

        this.totalTime = 15;
        this.currentTime = 0;
        this.active = true;

        this.currentCamera = this.initialCamera;
    }

    update(t) {
        this.currentTime += t;
        if (!this.active) return;

        if(this.currentTime <= this.totalTime) {
            const delta = (this.totalTime - this.currentTime) / (this.totalTime);

            let position = [0, 0, 0];
            vec3.lerp(position, this.finalCamera.position, this.initialCamera.position, delta);

            let target = [0, 0, 0];
            vec3.lerp(target, this.targetFinalCamera, this.targetInitialCamera, delta);

            let near = this.finalCamera.near + delta * (this.initialCamera.near - this.finalCamera.near);
            let far = this.finalCamera.far + delta * (this.initialCamera.far - this.finalCamera.far);
            let fov = this.finalCamera.fov + delta * (this.initialCamera.fov - this.finalCamera.fov);
            
            this.currentCamera = new CGFcamera(fov, near, far, position, target);
        }
        else {
            this.active = false;
            this.currentCamera = this.finalCamera;

            this.applyCamera();
        }
    }

    apply() {
        if (!this.active) return
        this.applyCamera();
    }

    applyCamera() {
        this.scene.camera = this.currentCamera;
        this.scene.interface.setActiveCamera(this.scene.camera);
    }
}