import { CGFscene } from '../lib/CGF.js';
import { CGFaxis,CGFcamera,CGFshader } from '../lib/CGF.js';
import { MySpriteSheet } from "./sprites/MySpriteSheet.js";
import { MyCameraAnimation } from './animation/MyCameraAnimation.js';

var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;
        this.allParsed = false;

        this.initCameras();
        this.initFonts();
        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(10);

        this.displayAxis = false;
        this.light = false;
        this.textShader = new CGFshader(this.gl, "shaders/font.vert", "shaders/font.frag");
        this.textShader.setUniformsValues({'dims': [26, 5]});        // this.texture.bind(0);
        this.setPickEnabled(true);
        
        this.piecesAnimation = null;
        this.eatAnimation = [];
        this.kingAnimation = null;

    }

    rotateY(angle) {
        return [
            1, 0, 0, 0,
            0, Math.cos(angle * Math.PI / 180), -Math.sin(angle * Math.PI / 180), 0,
            0, Math.sin(angle * Math.PI / 180), Math.cos(angle * Math.PI / 180), 0,
            0, 0, 0, 1
        ]
    }

    rotateZ(angle) {
        return [
            1, 0, 0, 0,
            0, Math.cos(angle * Math.PI / 180), -Math.sin(angle * Math.PI / 180), 0,
            0, Math.sin(angle * Math.PI / 180), Math.cos(angle * Math.PI / 180), 0,
            0, 0, 0, 1
        ]
    }

    rotateX(angle) {
        return  [
            Math.cos(angle* Math.PI / 180), 0, Math.sin(angle* Math.PI / 180), 0,
            0, 1, 0, 0,
            -Math.sin(angle* Math.PI / 180), 0, Math.cos(angle * Math.PI / 180), 0,
            0, 0, 0, 1
        ];
    }

    translate(translateFactorx,translateFactory,translateFactorz) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            translateFactorx, translateFactory, translateFactorz, 1
        ];
    }

    scale(scaleFactorx, scaleFactory, scaleFactorz) {
        return [
            scaleFactorx,0,0,0,
            0,scaleFactory,0,0,
            0,0,scaleFactorz,0,           
            0,0,0,1            
        ];
    }
    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }

    /**
     * Sets the currently selected camera
     */
    setCurrentCamera(){
        this.camera = this.graph.views[this.selectedCamera];
        this.interface.setActiveCamera(this.camera);
    }

    /**
     * Initializes the font spritesheet
     */
    initFonts() {
        this.font_spritesheet = new MySpriteSheet(this, './scenes/images/fonts.png', 26, 5);
        this.font_characters = {'0':0, '1':1, '2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9, '!':10, '?':11, '@':12, '#':13, '$':14, '%':15, '&':16, '\'':17, '"':18, '(':19, ')':20, '+':21, '-':22, '=':23, ',':24, '.':25,
                            'A':26, 'B':27, 'C':28, 'D':29, 'E':30, 'F':31, 'G':32, 'H':33, 'I':34, 'J':35, 'K':36, 'L':37, 'M':38, 'N':39, 'O':40, 'P':41, 'Q':42, 'R':43, 'S':44, 'T':45, 'U':46, 'V':47, 'W':48, 'X':49, 'Y':50, 'Z':51,
                            'a':52, 'b':53, 'c':54, 'd':55, 'e':56, 'f':57, 'g':58, 'h':59, 'i':60, 'j':61, 'k':62, 'l':63, 'm':64, 'n':65, 'o':66, 'p':67, 'q':68, 'r':69, 's':70, 't':71, 'u':72, 'v':73, 'w':74, 'x':75, 'y':76, 'z':77,
                            '<':78, '>':79, '[':80, ']':81, '{':82, '}':83, '\\':84, '/':85, '`':86, 'á':87, 'ã':88, 'à':89, 'é':90, 'ë':91, 'è':92, 'í':93, 'ó':94, 'õ':95, 'ú':96, 'ù':97, 'ü':98, 'ñ':99, 'Ç':100, 'ç':101, '¡':102, '¿':103,
                            '©':104, '®':105, '™':106, '·':107, '§':108, '†':109, '‡':110, '‐':111, '‒':112, '¶':113, '÷':114, '°':115, '¤':116, '¢':117, 'ß':118, 'Þ':119, ':':120, ';':121, '^':122, '~':123, '♂':124, '♀':125, '♥':126, '♪':127, '♫':128, '☼':129
                            };
    }

    updateCamera(id) {
        this.animationCamera = new MyCameraAnimation(this, this.camera, this.graph.views[id]);
        this.camera = this.graph.views[id];
        this.selectedCamera = id;
        this.interface.setActiveCamera(this.camera);
    }

    initPulse(){
        this.interface.gui.removeFolder(this.interface.pulse);
        this.interface.pulse = this.interface.gui.addFolder("Pulses");
        for (var key in this.graph.highlights) {
            this.interface.pulse.add(this.graph.highlights[key], 'isHighlighted').name(key);
        }
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var allLights = this.interface.lights;
        var i = 0;
        // Lights index.
        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];
                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);
                
                this.lights[i].setConstantAttenuation(light[6][0])
                this.lights[i].setLinearAttenuation(light[6][1])
                this.lights[i].setQuadraticAttenuation(light[6][2])


                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[7]);
                    this.lights[i].setSpotExponent(light[8]);
                    this.lights[i].setSpotDirection(light[9][0]-light[2][0], light[9][1]-light[2][1], light[9][2]-light[2][2]);
                }

                this.lights[i].setVisible(true);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                allLights.add(this.lights[i], 'enabled').name(key);

                i++;
            }
        }
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }

    /*
     * Called periodically (as per setUpdatePeriod() in init())
	 */
    update(time) {
        if (typeof this.update.t0 === 'undefined'){
            this.update.t0 = time;
        }

        this.time = (time-this.update.t0)/1000;

        if (this.animationCamera != null)
            this.animationCamera.update(this.time);

        this.gameOrchestrator.update(this.time);
        if(this.kingAnimation != null){
            this.kingAnimation.update(this.time);
        }

        if(this.eatAnimation != []){
            for(let i = 0; i < this.eatAnimation.length; i++)
                this.eatAnimation[i].update(this.time);
        }

        if(this.piecesAnimation != null){
            this.piecesAnimation.update(this.time);
        }
	}

    /*
     * Called when the scale factor changes on the interface
     */
	onScaleFactorChanged(v) {
		this.shader.setUniformsValues({ scaleFactor: this.scaleFactor });
	}
    
    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    setGraph(graph) {
        this.graph = graph;
        this.gameOrchestrator.theme = graph;
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);
        this.interface.gui.removeFolder(this.interface.lights);
        this.interface.lights = this.interface.gui.addFolder("Lights");
        this.initLights();

        this.initPulse();

        this.setCurrentCamera();
        this.interface.initCameras();

        if(!this.sceneInited) this.time = 0;

        this.sceneInited = true;
    }

    /**
     * Displays the scene.
     */
    display() {

        this.gameOrchestrator.gameplay(); 
        console.log(this.gameOrchestrator.gameState);       
        
        this.gameOrchestrator.managePick(this.pickMode, this.pickResults);
        this.clearPickRegistration();

        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();
        this.gameOrchestrator.displayMenu();
        if (this.gameOrchestrator.winner) this.gameOrchestrator.displayWinner();

        if (this.animationCamera != null)
            this.animationCamera.apply();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();
        

        for (var i = 0; i < this.lights.length; i++) {
            this.lights[i].setVisible(true);
            this.lights[i].update();
        }

        if (this.sceneInited) {
            // Draw axis
            if (this.displayAxis)
            this.axis.display();

            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.gameOrchestrator.display();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}