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
    }

    addTransformations(transformation){
        this.transformations.push(transformation);
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