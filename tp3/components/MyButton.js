import { MySpriteText } from "../sprites/MySpriteText.js";
export class MyButton {
    constructor(scene, text) {        
        this.scene = scene
        this.text = new MySpriteText(scene, text, scene.font_spritesheet, scene.font_characters)
    }

    setButtonText(text) {
        this.text.setNewText(text);
    }

    display() {
        this.text.display()
    }
}