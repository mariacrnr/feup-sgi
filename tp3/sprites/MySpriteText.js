import { MyRectangle } from "../components/MyRectangle.js";
export class MySpriteText {
    /**
     * Constructor
     * @param {XMLscene} scene 
     * @param {string} text 
     * @param {MySpriteSheed} spritesheet text spritesheet
     * @param {Map<Char,Int>} characters map with the font characters
     */
    constructor(scene, text, spritesheet, characters) {
        this.scene = scene;
        this.text = text;
        this.spritesheet = spritesheet;
        this.characters = characters;
        this.rectangle = new MyRectangle(scene, null, -1, 1, -1, 1);
    }

    /**
     * Returns the character position in the font characters map
     * @param {char} character 
     */
    getCharacterPosition(character) {
        return this.characters[character];
    }

    setNewText(text) {
        this.text = text.toString();
    }

    /**
     * Displays the sprite text
     */
    display() {
        this.spritesheet.activateShader();
        this.scene.pushMatrix();
        
        this.scene.multMatrix(this.scene.scale(9, 9, 9));
        for (let i = 0; i < this.text.length; i++) {
            this.spritesheet.activateCellp(this.getCharacterPosition(this.text.charAt(i)));
            this.scene.multMatrix(this.scene.translate(1.5, 0, 0));
            this.rectangle.display();
        }

        this.scene.setActiveShader(this.scene.defaultShader);
        this.scene.popMatrix();
    }
}