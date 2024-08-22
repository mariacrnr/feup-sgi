import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';

/**
* MyInterface class, creating a GUI interface.
*/

export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        this.initKeys();
        this.lights = this.gui.addFolder("Lights");
        this.pulse = this.gui.addFolder("Pulses");
        this.gameCommandsFolder = this.gui.addFolder("Game Commands");
        this.extrasFolder = this.gui.addFolder("Extras");
        return true;
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    /**
     * Creates the GUI general buttons
     */
    drawGui() {
        this.gameCommandsFolder.add(this.scene.gameOrchestrator, 'resetGame').name('Reset Game');
        this.gameCommandsFolder.add(this.scene.gameOrchestrator, 'undoMove').name('Undo');

        this.extrasFolder.add(this.scene, 'displayAxis').name('Display Axis');
    }

    /**
     * Updates the theme selector box with all the themes loaded
     */
    updateThemes() {
        this.gameCommandsFolder = this.gui.removeFolder(this.gameCommandsFolder);
        this.extrasFolder = this.gui.removeFolder(this.extrasFolder);
        this.gameCommandsFolder = this.gui.addFolder("Game Commands");
        this.extrasFolder = this.gui.addFolder("Extras");
        this.drawGui();
        this.gameCommandsFolder.open();
        this.gui.add(this.scene.gameOrchestrator.sceneParser, 'currentTheme', Array.from(this.scene.gameOrchestrator.sceneParser.sceneGraphs.keys()))
                .onChange(val => {this.scene.gameOrchestrator.sceneParser.changeTheme(val)})
                .name('Theme');
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
        if (this.isKeyPressed("KeyM") && this.scene.sceneInited) {
            this.scene.graph.updateMaterial()
        }
        if (this.isKeyPressed("KeyC") && this.scene.sceneInited && this.scene.gameOrchestrator.currentPiece.kingMate && this.scene.gameOrchestrator.currentPiece.playedOnce) {
            this.scene.gameOrchestrator.currentPiece.unsetPlayedOnce();
            this.scene.gameOrchestrator.game.mainBoard.getPieceByID(this.scene.gameOrchestrator.currentPiece.kingMate).unsetPlayedOnce();
            this.scene.gameOrchestrator.gamePanel.showWarning = false;
            this.scene.gameOrchestrator.passTurn()
        }
        if (this.isKeyPressed("KeyR") && this.scene.sceneInited) {
            this.scene.gameOrchestrator.game.replay();
        }
        if (this.isKeyPressed("KeyS")) {
            if (!this.scene.gameOrchestrator.start) {
                this.scene.gameOrchestrator.gameState = "INITIAL";
                this.scene.gameOrchestrator.start = true;
                this.scene.gameOrchestrator.resetGame();
            }
        }
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }

    initCameras(){
        if (this.cameras) this.gui.remove(this.cameras);
        this.cameras = this.gui.add(this.scene, 'selectedCamera', Object.keys(this.scene.graph.views)).name('View').onChange(this.scene.setCurrentCamera.bind(this.scene));
    }
    
}