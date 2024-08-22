
import { MyRectangle } from './MyRectangle.js';
import {MyButton} from './MyButton.js';
import { CGFobject, CGFappearance, CGFtexture } from "../../lib/CGF.js";

export class MyGamePanel {
    constructor(scene, orchestrator) {
        this.scene = scene
        this.orchestrator = orchestrator

        this.panel = new MyRectangle(scene, null, -5, 5, -5, 5)

        this.buttons = new Map()

        this.addButons()

        this.showWarning = false;
    }

    setWarnings(player) {
        this.warnings = [player.color.charAt(0).toUpperCase() + player.color.slice(1) + ' player, please select one of the blue tiles', 'Press C to switch turns', player.color.charAt(0).toUpperCase() + player.color.slice(1) + ' player, please select one piece', 'Press S to start the game']
    }

    setTimer(time) {
        this.buttons.get('time').setButtonText(time)
    }

    addButons() {
        this.buttons.set('player1', new MyButton(this.scene, 'Black -'))
        this.buttons.set('player2', new MyButton(this.scene, 'White -'))
        this.buttons.set('player1Points', new MyButton(this.scene, '0'))
        this.buttons.set('player2Points', new MyButton(this.scene, '0'))
        this.buttons.set('time', new MyButton(this.scene, '2:00'))
        this.buttons.set('winner', new MyButton(this.scene, 'Winner'))
        this.buttons.set('warning', new MyButton(this.scene, ''))
    }

    setWarningText(number) {
        this.showWarning = true;
        this.buttons.get('warning').setButtonText(this.warnings[number])
        if (number == 1) this.kingWarning = true;
        else this.kingWarning = false;

    }

    displayMenu() {
        this.scene.pushMatrix()

            this.scene.pushMatrix()
                this.scene.multMatrix(this.scene.translate(2, 3.5, -10))
                this.scene.multMatrix(this.scene.scale(0.03, 0.03, 0.03))
                this.buttons.get('player1').display()
            this.scene.popMatrix()

            this.scene.pushMatrix()
                this.scene.multMatrix(this.scene.translate(-8, 3.5, -10))
                this.scene.multMatrix(this.scene.scale(0.03, 0.03, 0.03))
                this.buttons.get('player2').display()
            this.scene.popMatrix()
            
            this.scene.pushMatrix()
                this.scene.multMatrix(this.scene.translate(5, 3.5, -10))
                this.scene.multMatrix(this.scene.scale(0.03, 0.03, 0.03))
                this.buttons.get('player1Points').display()
            this.scene.popMatrix()

            this.scene.pushMatrix()
                this.scene.multMatrix(this.scene.translate(-5, 3.5, -10))
                this.scene.multMatrix(this.scene.scale(0.03, 0.03, 0.03))
                this.buttons.get('player2Points').display()
            this.scene.popMatrix()

            this.scene.pushMatrix()
                this.scene.multMatrix(this.scene.translate(-2, 3.5, -10))
                this.scene.multMatrix(this.scene.scale(0.03, 0.03, 0.03))
                this.buttons.get('time').display()
            this.scene.popMatrix()

            if (this.showWarning) {
                this.scene.pushMatrix()
                    this.scene.multMatrix(this.scene.translate(-4, 2.5, -10))
                    this.scene.multMatrix(this.scene.scale(0.015, 0.015, 0.015))
                    this.buttons.get('warning').display()
                this.scene.popMatrix()
            }

        this.scene.popMatrix()
    }

    displayWinner(winner) {
        this.buttons.get('winner').setButtonText(winner.color.charAt(0).toUpperCase() + winner.color.slice(1) + ' wins!')
        this.scene.pushMatrix()
            this.scene.multMatrix(this.scene.translate(-4, 0, -10))
            this.scene.multMatrix(this.scene.scale(0.05, 0.05, 0.05))
            this.buttons.get('winner').display()
        this.scene.popMatrix()
    }


    reset() {
        this.buttons.get('player1Points').setButtonText('0')
        this.buttons.get('player2Points').setButtonText('0')
        this.buttons.get('time').setButtonText('2:00')
    }
}