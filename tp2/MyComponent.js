/**
* MyComponent
* @method constructor
 * @param id - Component's id
*/
export class MyComponent {
    constructor(id) {
        this.id = id;
        this.transformations = [];
        this.materials = [];
        this.texture;
        this.scaleFactor = [];
        this.childComponents = [];
        this.childPrimitives = [];
        this.currMaterial = 0;
        this.active = false;
        this.highlight = [];
        this.isHighlighted = false;
        this.scaleFactorPulse;
        this.animation;
    }

    addTransformations(transformation){
        this.transformations.push(transformation);
    }

    addAnimation(animation){
        this.animation = animation;
    }

    addMaterials(material) {
        this.materials.push(material);
    }

    addComponents(component) {
        this.childComponents.push(component);
    }

    addPrimitives(primitive) {
        this.childPrimitives.push(primitive);
    }
}