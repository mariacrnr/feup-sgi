import { CGFappearance, CGFcamera, CGFcameraOrtho, CGFtexture, CGFXMLreader, CGFshader } from '../lib/CGF.js';
import { MyRectangle } from './components/MyRectangle.js';
import { MyTriangle } from './components/MyTriangle.js';
import { MyCylinder } from './components/MyCylinder.js';
import { MySphere } from './components/MySphere.js';
import { MyTorus } from './components/MyTorus.js';
import { MyComponent } from './components/MyComponent.js';
import { MyPatch } from './components/MyPatch.js';
import { MyKeyframeAnimation } from './animation/MyKeyframeAnimation.js';
import { MyGame } from './game/MyGame.js';

var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var ANIMATIONS_INDEX = 8;
var COMPONENTS_INDEX = 9;

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene, parser) {
        this.filename = filename.split('.')[0]
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        this.parser = parser

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
        this.scene.shader = new CGFshader(this.scene.gl, "shaders/pulse.vert", "shaders/pulse.frag")
        this.scene.shader.setUniformsValues({ timeFactor: 0 });
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.parser.onGraphLoaded(this);

        // this.setUpdatePeriod(100);
        // this.startTime = null;
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "sxs")
            return "root tag <sxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <animations>
        if ((index = nodeNames.indexOf("animations")) == -1)
            return "tag <animations> missing";
        else {
            if (index != ANIMATIONS_INDEX)
                this.onXMLMinorError("tag <animations> out of order");

            //Parse animations block
            if ((error = this.parseAnimations(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }

        this.scene.allParsed = true;
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses numbrem from a parameter. 
     * @param {block element} parameter
     * @param {block element id} id
     * @param {component id} message
     */
    parseFloat(parameter, id, message) {
        var value = this.reader.getFloat(parameter, id, false);
        if (!(value != null && !isNaN(value))) {
            //this.onXMLError("unable to parse attribute '" + id + "' of the component with ID='" + message + "'");
            return "unable to parse attribute '" + id + "' of the component with ID='" + message + "'";
        }
        return value;
    }

    /**
     * Creates the <perspective> view block. 
     * @param {block element} view
     * @param {parameters of the block element} parameters
     * @param {id} viewId
     */
    createPerspectiveView(view, parameters, viewId){

        var fromParam, toParam; 
        for(var i = 0; i < view.children.length; i++){
            if(view.children[i].nodeName == "from") fromParam = view.children[i];
            if(view.children[i].nodeName == "to"  ) toParam   = view.children[i];
        }

        if(!fromParam || !toParam) return "Tags 'from' or 'to' are not defined.";

        var near = this.parseFloat(view, 'near', viewId); if(typeof near === "string") return near;
        var far = this.parseFloat(view, 'far', viewId); if(typeof far === "string") return far;
        var angle = this.parseFloat(view, 'angle', viewId); if(typeof angle === "string") return angle;

        var from = this.parseCoordinates3D(parameters[0], viewId);
        var to = this.parseCoordinates3D(parameters[1], viewId);
        
        return new CGFcamera(angle*DEGREE_TO_RAD, near, far, vec3.fromValues(...from), vec3.fromValues(...to));
    }

    /**
     * Creates the <ortho> view block. 
     * @param {block element} view
     * @param {parameters of the block element} parameters
     * @param {id} viewId
     */
    createOrthoView(view, viewId){

        var fromParam, toParam, upParam; 
        for(var i = 0; i < view.children.length; i++){
            if(view.children[i].nodeName == "from") fromParam = view.children[i];
            if(view.children[i].nodeName == "to"  ) toParam   = view.children[i];
            if(view.children[i].nodeName == "up"  ) upParam   = view.children[i];
        }

        if(!fromParam || !toParam) return "Tags 'from' or 'to' are not defined.";

        var near = this.parseFloat(view, 'near', viewId); if(typeof near === "string") return near;
        var far = this.parseFloat(view, 'far', viewId); if(typeof far === "string") return far;
        var left = this.parseFloat(view, 'left', viewId); if(typeof left === "string") return left;
        var right = this.parseFloat(view, 'right', viewId); if(typeof right === "string") return right;
        var bottom = this.parseFloat(view, 'bottom', viewId); if(typeof bottom === "string") return bottom;
        var top = this.parseFloat(view, 'top', viewId); if(typeof top === "string") return top;

        var from = this.parseCoordinates3D(fromParam, viewId);
        var to = this.parseCoordinates3D(toParam, viewId);

        if(!upParam) this.onXMLMinorError("'up' tag not defined, defaulting to [0, 1, 0].");
        var up = upParam ? this.parseCoordinates3D(upParam, viewId) : [0,1,0];
        
        return new CGFcameraOrtho(left, right, bottom, top, near, far, 
            vec3.fromValues(...from), vec3.fromValues(...to), vec3.fromValues(...up));
        
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {

        var children = viewsNode.children;

        // Check if has any defined view
        if (!children.length) 
            this.onXMLError("You have to have at least one defined view");

        this.views = [];

        this.grandChildren = [];

        for (var i = 0; i < children.length; i++){
            if (children[i].nodeName != "perspective" && children[i].nodeName != "ortho") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current view.
            var viewId = this.reader.getString(children[i], 'id');
            if (viewId == null)
                return "no ID defined for the view";

            // Checks for repeated IDs.
            if (this.views[viewId] != null)
                return "ID must be unique for each view (conflict: ID = " + viewId + ")";

            var parameters = children[i].children;

            // Specifications for the current view.
            var viewType = children[i].nodeName;

            // Retrieves the view coordinates.
            if (viewType == 'perspective') {
                var view = this.createPerspectiveView(children[i], parameters, viewId)
            }
            else if (viewType == 'ortho') {
                var view = this.createOrthoView(children[i], parameters, viewId)
            }
            else {
                this.onXMLMinorError("There is no view type as " + viewType + ".");
                continue;
            }

            if(typeof view === "string") return view;
            this.views[viewId] = view;
        }

        this.scene.selectedCamera = this.reader.getString(viewsNode, 'default');
        if(!this.views[this.scene.selectedCamera]) return "There is no default view defined.";

        console.log('whitePlayer')

        this.log("Parsed views");

        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {

        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        // Check if has any defined light
        if (!children.length) 
            this.onXMLError("You have to have at least one defined light");

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular", "attenuation"]);
                attributeTypes.push(...["position", "color", "color", "color", "attenuation"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else if (attributeTypes[j] == "attenuation")
                        var aux = this.parseAttenuation(grandChildren[attributeIndex], "attenuation values for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[j] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {

        var children = texturesNode.children;

        // Check if has any defined texture
        if (!children.length) 
            this.onXMLError("You have to have at least one defined texture");

        this.textures = [];

        this.grandChildren = [];

        //For each texture in textures block, check ID and file URL
        for(var i = 0; i < children.length; i++){
            var textureId = this.reader.getString(children[i], 'id');
            
            if (textureId == null)
                return "no ID defined for texture";

            if (this.textures[textureId] != null)
                return "ID must be unique for each texture (conflict: ID = " + textureId + ")";

            var file = this.reader.getString(children[i], 'file');
            
            if(!file.endsWith(".jpg") && !file.endsWith(".png"))
                return "the file selected doesn't have a .jpg or .png extension.";

            this.textures[textureId] = new CGFtexture(this.scene, file);
        }

        this.log("Parsed Textures");
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        // Check if has any defined material
        if (!children.length) 
            this.onXMLError("You have to have at least one defined material");

        this.materials = [];

        var grandChildren = [];
        var nodeNames = [];

        //For each material in materials block, check ID and build object
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            // Parse material information
            var emissionIndex = nodeNames.indexOf("emission");
            var ambientIndex = nodeNames.indexOf("ambient");
            var diffuseIndex = nodeNames.indexOf("diffuse");
            var specularIndex = nodeNames.indexOf("specular");

            var emissionColor = this.parseColor(grandChildren[emissionIndex], "emission");
            var ambientColor = this.parseColor(grandChildren[ambientIndex], "ambient");
            var diffuseColor = this.parseColor(grandChildren[diffuseIndex], "diffuse");
            var specularColor = this.parseColor(grandChildren[specularIndex], "specular");
            
            // Build material object
            var material = new CGFappearance(this.scene);

            material.setEmission(emissionColor[0], emissionColor[1], emissionColor[2], emissionColor[3]);
            material.setAmbient(ambientColor[0], ambientColor[1], ambientColor[2], ambientColor[3]);
            material.setDiffuse(diffuseColor[0], diffuseColor[1], diffuseColor[2], diffuseColor[3]);
            material.setSpecular(specularColor[0], specularColor[1], specularColor[2], specularColor[3]);
            material.setTextureWrap('REPEAT', 'REPEAT');

            this.materials[materialID] = material;
        }

        this.log("Parsed materials");
        return null;
    }

    /**
     * Parse the specifications for a transformation.
     * @param {transformation information} transformations
     * @param {transformation id} errorID
     */
    createAnimationTransformationMatrix(transformations, errorID){

        var current = 'translation';
        let translation, rotation, scale;
        let rx, ry, rz;

        let transfMatrix = [];

        for (var j = 0; j < transformations.length; j++) {
            switch (transformations[j].nodeName) {
                case 'translation':
                    if (current == 'translation') {
                        if(translation != undefined) return "Translation is already defined for this keyframe."

                        translation = this.parseCoordinates3D(transformations[j], "translation transformation for ID " + errorID);

                        if (!Array.isArray(translation)) return coordinates;

                        if(transformations[j + 1] === undefined) return "No rotation or scale transformations defined.";
                        else if (transformations[j + 1].nodeName == 'rotation') current = 'rotation';
                    }
                    else return "Wrong order of animation transformations on XML file.";
                    break
                case 'rotation':
                    if (current == 'rotation') {
                        var angle = this.parseFloat(transformations[j], 'angle', errorID); if(angle === null) return null;
                        angle *= DEGREE_TO_RAD;

                        var axis = this.reader.getString(transformations[j], 'axis');
                        if(axis === null || axis.length > 1) return "Axis is missing for a rotation of the " + errorID + " component.";
                        
                        switch(axis){
                            case "x":
                                if(rx != undefined) return "Rotation in axis x is already defined for this keyframe.";
                                rx = angle;
                                break;
                            case "y":
                                if(ry != undefined) return "Rotation in axis y is already defined for this keyframe.";
                                else if(rx != undefined) return "Wrong order of animation transformations on XML file.";
                                ry = angle;
                                break;
                            case "z":
                                if(rz != undefined) return "Rotation in axis z is already defined for this keyframe.";
                                else if(ry != undefined && rx != undefined) return "Wrong order of animation transformations on XML file.";
                                rz = angle;
                                break;
                            default:
                                return "The axis " + axis + " is unknown."
                        }

                        if(rx != undefined && rz != undefined && ry != undefined) rotation = [rx, ry, rz]

                        if(transformations[j + 1] === undefined && rotation != undefined) return "No scale transformation defined.";
                        else if (transformations[j + 1].nodeName == 'scale' && rotation == undefined) continue;
                        else if (transformations[j + 1].nodeName == 'scale' && rotation != undefined) current = 'scale';

                    }
                    else return "Wrong order of animation transformations on XML file.";
                    break;
                case 'scale': 
                    if (current == 'scale') { 

                        if(rotation == undefined) return "Rotation missing in one or multiple axis."
                        else if(scale != undefined) return "Scale is already defined for this keyframe."

                        scale = this.parseAnimationCoordinates3D(transformations[j], "scale transformation for ID " + errorID);

                        if (!Array.isArray(scale)) return coordinates;   
                    }
                    else return "Wrong order of animation transformations on XML file.";
                    break;
                default:
                    this.onXMLError(transformations[j].nodeName + ' is not a valid transformation')
                    break;
            }
        }

        transfMatrix["translation"] = vec3.fromValues(...translation);
        transfMatrix["rotation"] =  vec3.fromValues(...rotation);
        transfMatrix["scale"] = vec3.fromValues(...scale);

        return transfMatrix;
    }

    /**
     * Parse the specifications for a transformation.
     * @param {transformation information} transformations
     * @param {transformation id} errorID
     */
    createTransformationMatrix(transformations, errorID){

        var transfMatrix = mat4.create();

        for (var j = 0; j < transformations.length; j++) {
            switch (transformations[j].nodeName) {
                case 'translate':
                    var coordinates = this.parseCoordinates3D(transformations[j], "translate transformation for ID " + errorID);
                    if (!Array.isArray(coordinates))
                        return coordinates;

                    transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                    break;
                case 'scale':     
                    var coordinates = this.parseCoordinates3D(transformations[j], "scale transformation for ID " + errorID);
                    if (!Array.isArray(coordinates))
                        return coordinates;   

                    transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                    break;
                case 'rotate':
                    var angle = this.parseFloat(transformations[j], 'angle', errorID); if(angle === null) return null;
                    angle *= DEGREE_TO_RAD;

                    var axis = this.reader.getString(transformations[j], 'axis');
                    if(axis === null || axis.length > 1) return "Axis is missing for a rotation of the " + errorID + " component.";
                    
                    switch(axis){
                        case "x":
                            mat4.rotateX(transfMatrix, transfMatrix, angle); 
                            break;
                        case "y":
                            mat4.rotateY(transfMatrix, transfMatrix, angle); 
                            break;
                        case "z":
                            mat4.rotateZ(transfMatrix, transfMatrix, angle); 
                            break;
                        default:
                            return "The axis " + axis + " is unknown."
                    }
                    break;
                default:
                    if (errorID == 'component transformations' && transformations[j].nodeName == 'transformationref')
                        this.onXMLError("There can only exist either a reference to a transformation or explicit ones, never both.")
                    else
                        this.onXMLError(transformations[j].nodeName + ' is not a valid transformation')

                    break;
            }
        }

        return transfMatrix;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        // Check if has any defined transformation
        if (!children.length) 
            this.onXMLError("You have to have at least one defined transformation");

        this.transformations = [];

        var grandChildren = [];

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;

            // Specifications for the current transformation.
            var transfMatrix = this.createTransformationMatrix(grandChildren, transformationID);

            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }

    /**
     * Parses the <animations> block.
     * @param {animations block element} animationsNode
     */
    parseAnimations(animationsNode) {
        var children = animationsNode.children;

        // Check if has any defined transformation
        if (!children.length) 
            return [];

        this.animations = [];

        var grandChildren = [];

        // Any number of animations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "keyframeanim") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current animation.
            var animationID = this.reader.getString(children[i], 'id');
            if (animationID == null)
                return "no ID defined for animation";

            // Checks for repeated IDs.
            if (this.animations[animationID] != null)
                return "ID must be unique for each animation (conflict: ID = " + animationID + ")";

            grandChildren = children[i].children;

            if(grandChildren.length < 1)
                return "There must be at least one keyframe defined.";

            let animation = new MyKeyframeAnimation(this.scene);
            let lastInstant;
            for (var j = 0; j < grandChildren.length; j++) {

                let keyframe = {};

                if (grandChildren[j].nodeName != "keyframe") {
                    this.onXMLMinorError("Unknown tag <" + grandChildren[j].nodeName + ">");
                    continue;
                }

                // Get instant of the current keyframe.
                var instant = this.reader.getFloat(grandChildren[j], 'instant');
                if (instant == null) return "No instant defined for keyframe";
                if (lastInstant != undefined && instant < lastInstant) return "Instant defined before the previous one, must be in ascending order."; 
                lastInstant = instant;


                var grandGrandChildren = grandChildren[j].children;

                // Specifications for the current keyframe.
                var keyframeMatrix = this.createAnimationTransformationMatrix(grandGrandChildren, animationID);
                if(typeof keyframeMatrix === "string")
                    return keyframeMatrix;
                
                keyframe["instant"] = instant;
                keyframe["transformations"] = keyframeMatrix;
                animation.addKeyframe(keyframe);
            }

            this.animations[animationID] = animation;
        }

        this.log("Parsed animations");
        return null;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        // Check if has any defined primitive
        if (!children.length) 
            this.onXMLError("You have to have at least one defined primitive");

        this.primitives = [];

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for primitive";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length > 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus' && grandChildren[0].nodeName != 'patch')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere, torus or patch)"
            }

            // Specifications for the current primitive.
            var primitiveChild = grandChildren[0].nodeName;

            switch(primitiveChild){
                case 'rectangle':
                    var primitive = this.createRectangle(grandChildren[0], primitiveId);
                    break;
                case 'triangle':
                    var primitive = this.createTriangle(grandChildren[0], primitiveId);
                    break;
                case 'cylinder':
                    var primitive = this.createCylinder(grandChildren[0], primitiveId);
                    break;
                case 'sphere':
                    var primitive = this.createSphere(grandChildren[0], primitiveId);
                    break;
                case 'torus':
                    var primitive = this.createTorus(grandChildren[0], primitiveId);  
                    break;
                case 'patch':
                    var primitive = this.createPatch(grandChildren[0], primitiveId);
                    break;
            }

            this.primitives[primitiveId] = primitive;
        }

        this.log("Parsed primitives");
        return null;
    }

    /**
     * Parses the <components> block.
     * @param {components block element} componentsNode
     */
    parseComponents(componentsNode) {
        var children = componentsNode.children;

        this.highlights = [];
        this.allComponents = [];

        var grandChildren = [];
        var grandgrandChildren = [];
        var nodeNames = [];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.allComponents[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var component = new MyComponent(componentID);

            var index;

            // Transformations
            if ((index = nodeNames.indexOf("transformation")) == -1)
                return "tag <transformation> on component with id = " + componentID + ' missing';

            var transformation = grandChildren[index].children;
            if (transformation.length !== 0)
                this.parseComponentTransformation(transformation, component);

            // Materials
            if ((index = nodeNames.indexOf("materials")) == -1)
                return "tag <materials> on component with id = " + componentID + ' missing';

            var material = grandChildren[index].children;
            this.parseComponentMaterial(material, component);

            // Texture
            if ((index = nodeNames.indexOf("texture")) == -1)
                return "tag <texture> on component with id = " + componentID + ' missing';

            var texture = grandChildren[index];
            this.parseComponentTexture(texture, component);

            // Children
            if ((index = nodeNames.indexOf("children")) == -1)
                return "tag <children> on component with id = " + componentID + ' missing';

            grandgrandChildren = grandChildren[index].children;
            this.parseChildren(grandgrandChildren, component);

            // Highlight
            if ((index = nodeNames.indexOf("highlighted")) != -1) {
                var highlight = grandChildren[index];
                this.highlights[componentID] = component;
                this.parseComponentHighlighted(highlight, component, componentID);
            }

            // Animation
            if ((index = nodeNames.indexOf("animation")) != -1) {
                var animation = grandChildren[index];
                this.parseComponentAnimation(animation, component, componentID);
            }


            this.allComponents[componentID] = component;
        }
        this.checkCicles(this.allComponents[this.idRoot]);
    }

    /**
     * Parses the <animation> from <component> block.
     * @param {block element} node
     * @param {MyComponent} component
     * @param {id} id
     */
    parseComponentAnimation(node, component, id){
        let animation = this.animations[node.id]
        if(animation == null) return "There is no animation defined with ID: " + node.id + ".";
        component.addAnimation(animation);
    }

    /**
     * Parses the <highlighted> from <component> block.
     * @param {block element} node
     * @param {MyComponent} component
     * @param {id} id
     */
    parseComponentHighlighted(node, component, id) {
        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + id;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + id;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + id;

        // scale_h
        var scale_h = this.reader.getFloat(node, 'scale_h');
        if (!(scale_h != null && !isNaN(scale_h) && scale_h >= 0))
            return "unable to parse scale_h component of the " + id;

        component.scaleFactorPulse = scale_h;
        component.highlight = [r, g, b, 1];
    }

    /**
     * Parses the <transformation> from <component> block.
     * @param {transformation children} transformationInfo
     * @param {MyComponent} component
     */
    parseComponentTransformation(transformationInfo, component) {
        // In case of a reference to a transformation.
        if(transformationInfo[0].nodeName === 'transformationref'){
            if(transformationInfo.length > 1) {
                this.onXMLError('Component ' + component.id + ": There can only exist either a reference to a transformation or explicit ones, never both.")
                return;
            }
            component.addTransformations(transformationInfo[0].id);
        }
        // Parse transformation info otherwise.
        else {
            var transfMatrix = this.createTransformationMatrix(transformationInfo, "component transformations")
            component.addTransformations(transfMatrix);
        }

    }

    /**
     * Parses the <material> from <component> block.
     * @param {materials children} materialInfo
     * @param {MyComponent} component
     */
    parseComponentMaterial(materialInfo, component) {
        // Check if has any defined material
        if (!materialInfo.length) 
            this.onXMLError("Missing material on component with id = " + component.id);

        for (var i = 0; i < materialInfo.length; i++) {
            if (materialInfo[i].nodeName !== 'material')
                this.onXMLError("tag " + materialInfo[i].nodeName + " on component with id = " + component.id + ' is not a material');

            component.addMaterials(materialInfo[i].id);
        }
    }

    /**
     * Parses the <texture> from <component> block.
     * @param {texture} textureInfo
     * @param {MyComponent} component
     */
    parseComponentTexture(textureInfo, component){

        var length_s = this.reader.getFloat(textureInfo, 'length_s', false);
        var length_t = this.reader.getFloat(textureInfo, 'length_t', false);
        switch(textureInfo.id){
            case 'inherit':
                if(length_s !== null && length_t !== null){
                    this.onXMLMinorError("Scale factor shouldn't be defined for an inherit texture, defaulting to values given.");
                    component.scaleFactor = [length_s, length_t];
                }
                else component.scaleFactor = [null, null];
                break;
            case 'none':
                if(length_s !== null && length_t !== null)
                    this.onXMLMinorError("Scale factor shouldn't be defined for a none texture, ignoring values.");
                component.scaleFactor = [null, null];
                break;
            default:
                if(length_s === null || length_t === null){
                    this.onXMLMinorError("Scale factor undefined, defaulting to 1.");
                    component.scaleFactor = [1,1];
                }
                else component.scaleFactor = [length_s, length_t];
                break;
        }
        
        component.texture = textureInfo.id;
    }

    /**
     * Parses the <children> from <component> block.
     * @param {children children} childrenInfo
     * @param {MyComponent} component
     */
    parseChildren(childrenInfo, component) {
        // Check if has any defined texture
        if (!childrenInfo.length) 
            this.onXMLError("Missing children on component with id = " + component.id);

        for (var i = 0; i < childrenInfo.length; i++) {
            switch (childrenInfo[i].nodeName) {
                case 'componentref':
                    component.addComponents(childrenInfo[i].id)
                    break;
                case 'primitiveref':
                    let primitive = childrenInfo[i].id
                    if(primitive === null || primitive === undefined) 
                        this.onXMLError("There is no primitive with id=" + childrenInfo[i].id)  
                    component.addPrimitives(primitive);
                    break;
                default:
                    this.onXMLError(childrenInfo[i].nodeName + ' is not a valid children from component with id = ' + component.id);
            }
        }
    }

    /**
     * Parse the attenuation values from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseAttenuation(node, messageError) {
        var vals = [];

        // constant
        var constant = this.reader.getFloat(node, 'constant');
        if (!(constant != null && !isNaN(constant)))
            return "unable to parse constant value of the " + messageError;

        // linear
        var linear = this.reader.getFloat(node, 'linear');
        if (!(linear != null && !isNaN(linear)))
            return "unable to parse linear value of the " + messageError;

        // quadratic
        var quadratic = this.reader.getFloat(node, 'quadratic');
        if (!(quadratic != null && !isNaN(quadratic)))
            return "unable to parse quadratic value of the " + messageError;
        
        vals.push(...[constant, linear, quadratic]);
    
        if (JSON.stringify(vals) !== JSON.stringify([1, 0, 0]) && JSON.stringify(vals) !== JSON.stringify([0, 1, 0]) && JSON.stringify(vals) !== JSON.stringify([0, 0, 1]))
            return "Attenuation values prohibited on the " + messageError;
       
        return vals;
    }

    /**
     * Parse the coordinates from a keyframe node with ID = id and instant
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseAnimationCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'sx');
        if (!(x != null && !isNaN(x)))
            return "unable to parse sx-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'sy');
        if (!(y != null && !isNaN(y)))
            return "unable to parse sy-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'sz');
        if (!(z != null && !isNaN(z)))
            return "unable to parse sx-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];
        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /**
     * Create a rectangle
     * @param {information about the primitive} rectangle
     * @param {string} primitiveId
     */
    createRectangle(rectangle, primitiveId) {
        // x1
        var x1 = this.reader.getFloat(rectangle, 'x1');
        if (!(x1 != null && !isNaN(x1))) {
            onXMLMinorError("unable to parse x1 of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // y1
        var y1 = this.reader.getFloat(rectangle, 'y1');
        if (!(y1 != null && !isNaN(y1))) {
            onXMLMinorError("unable to parse y1 of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // x2
        var x2 = this.reader.getFloat(rectangle, 'x2');
        if (!(x2 != null && !isNaN(x2) && x2 > x1)) {
            onXMLMinorError("unable to parse x2 of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // y2
        var y2 = this.reader.getFloat(rectangle, 'y2');
        if (!(y2 != null && !isNaN(y2) && y2 > y1)) {
            onXMLMinorError("unable to parse y2 of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        return new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);
    }

    /**
     * Create a triangle
     * @param {information about the primitive} triangle
     * @param {string} primitiveId
     */
    createTriangle(triangle, primitiveId) {
        // x1
        var x1 = this.reader.getFloat(triangle, 'x1');
        if (!(x1 != null && !isNaN(x1))) {
            onXMLMinorError("unable to parse x1 of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // y1
        var y1 = this.reader.getFloat(triangle, 'y1');
        if (!(y1 != null && !isNaN(y1))) {
            onXMLMinorError("unable to parse y1 of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        var z1 = this.reader.getFloat(triangle, 'z1');
        if (!(z1 != null && !isNaN(z1))) {
            onXMLMinorError("unable to parse z1 of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // x2
        var x2 = this.reader.getFloat(triangle, 'x2');
        if (!(x2 != null && !isNaN(x2))) {
            onXMLMinorError("unable to parse x2 of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // y2
        var y2 = this.reader.getFloat(triangle, 'y2');
        if (!(y2 != null && !isNaN(y2))) {
            onXMLMinorError("unable to parse y2 of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        var z2 = this.reader.getFloat(triangle, 'z2');
        if (!(z2 != null && !isNaN(z2))) {
            onXMLMinorError("unable to parse z2 of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // x3
        var x3 = this.reader.getFloat(triangle, 'x3');
        if (!(x3 != null && !isNaN(x3))) {
            onXMLMinorError("unable to parse x3 of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // y3
        var y3 = this.reader.getFloat(triangle, 'y3');
        if (!(y3 != null && !isNaN(y3))) {
            onXMLMinorError("unable to parse y3 of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        var z3 = this.reader.getFloat(triangle, 'z3');
        if (!(z3 != null && !isNaN(z3))) {
            onXMLMinorError("unable to parse z3 of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        return new MyTriangle(this.scene, primitiveId, x1, x2, x3, y1, y2, y3, z1, z2, z3);
    }

    /**
     * Create a cylinder
     * @param {information about the primitive} cylinder
     * @param {string} primitiveId
     */
    createCylinder(cylinder, primitiveId) {
        // base
        var base = this.reader.getFloat(cylinder, 'base');
        if (!(base != null && !isNaN(base))) {
            onXMLMinorError("unable to parse base of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // top
        var top = this.reader.getFloat(cylinder, 'top');
        if (!(top != null && !isNaN(top))) {
            onXMLMinorError("unable to parse top of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // height 
        var height = this.reader.getFloat(cylinder, 'height');
        if (!(height != null && !isNaN(height))) {
            onXMLMinorError("unable to parse height of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // slices
        var slices = this.reader.getFloat(cylinder, 'slices');
        if (!(slices != null && !isNaN(slices))) {
            onXMLMinorError("unable to parse slices of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // stacks
        var stacks = this.reader.getFloat(cylinder, 'stacks');
        if (!(stacks != null && !isNaN(stacks))) {
            onXMLMinorError("unable to parse stacks of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        return new MyCylinder(this.scene, primitiveId, base, top, height, slices, stacks);
    }

    /**
     * Create a sphere
     * @param {information about the primitive} sphere
     * @param {string} primitiveId
     */
    createSphere(sphere, primitiveId) {
        // radius 
        var radius = this.reader.getFloat(sphere, 'radius');
        if (!(radius != null && !isNaN(radius))) {
            onXMLMinorError("unable to parse radius of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // slices
        var slices = this.reader.getFloat(sphere, 'slices');
        if (!(slices != null && !isNaN(slices))) {
            onXMLMinorError("unable to parse slices of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // stacks
        var stacks = this.reader.getFloat(sphere, 'stacks');
        if (!(stacks != null && !isNaN(stacks))) {
            onXMLMinorError("unable to parse stacks of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        return new MySphere(this.scene, primitiveId, radius, slices, stacks);
    }

    /**
     * Create a torus
     * @param {information about the primitive} torus
     * @param {string} primitiveId
     */
    createTorus(torus, primitiveId) {
        // inner
        var inner = this.reader.getFloat(torus, 'inner');
        if (!(inner != null && !isNaN(inner))) {
            onXMLMinorError("unable to parse inner of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // outer
        var outer = this.reader.getFloat(torus, 'outer');
        if (!(outer != null && !isNaN(outer))) {
            onXMLMinorError("unable to parse outer of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // slices 
        var slices = this.reader.getFloat(torus, 'slices');
        if (!(slices != null && !isNaN(slices))) {
            onXMLMinorError("unable to parse slices of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        // loops
        var loops = this.reader.getFloat(torus, 'loops');
        if (!(loops != null && !isNaN(loops))) {
            onXMLMinorError("unable to parse loops of the primitive coordinates for ID = " + primitiveId);
            return null;
        }
        return new MyTorus(this.scene, primitiveId, inner, outer, slices, loops);
    }

    
    /**
     * Parses the <patch> block and creates element.
     * @param {patch block element} patch
     * @param {string} primitiveId
     */
    createPatch(patch, primitiveId) {

        var degreeU = this.reader.getInteger(patch, 'degree_u');
        if (degreeU == null){
            this.degreeU = 1;
            this.onXMLError("No degree_u defined, defaulting to 1.");
        }

        var partsU = this.reader.getInteger(patch, 'parts_u');
        if (partsU == null){
            this.partsU = 1;
            this.onXMLError("No parts_u defined, defaulting to 1.");
        }

        var degreeV = this.reader.getInteger(patch, 'degree_v');
        if (degreeV == null){
            this.degreeV = 1;
            this.onXMLError("No degree_v defined, defaulting to 1.");
        }

        var partsV = this.reader.getInteger(patch, 'parts_v');
        if (partsV == null){
            this.partsV = 1;
            this.onXMLError("No parts_v defined, defaulting to 1.");
        }
            
        var children = patch.children;

        // Check if has any defined control panel
        if (children.length != (degreeU + 1) * (degreeV + 1)) 
            this.onXMLError("Wrong number of control points declared, defaulting missing to 0.");

        let controlPoints = [];
        for (var u = 0; u < (degreeU + 1); u++) {
            controlPoints[u] = [];
            for (var v = 0; v < (degreeV + 1); v++) {
                let controlPoint = children[v + (degreeV + 1) * u];

                if (controlPoint != undefined && controlPoint.nodeName != "controlpoint")
                    return "unknown tag <" + children[i].nodeName + ">";

                let controlCoords = controlPoint != undefined ? this.parseCoordinates3D(children[v + (degreeV + 1) * u], primitiveId).concat([1]): [0,0,0,1];
                controlPoints[u][v] = controlCoords;

            }
        }
        
        return new MyPatch(this.scene, degreeU, degreeV, partsU, partsV, controlPoints);
    }


    /**
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Change material if key 'M' is pressed
     */
    updateMaterial()  {
        for (var name in this.allComponents) {
            var component = this.allComponents[name]
            var materialsLength = component.materials.length;
            component.currMaterial += 1;

            if (component.currMaterial === materialsLength)
                component.currMaterial = 0;
        }
    }

    /**
     * Check once if there is any cicle
     * @param component
     */
    checkCicles(component) {
        //Check cicles
        if (component.active) {
            this.onXMLError('Cicle detected at component with id = ' + component.id);
        }
        
        else {
            component.childComponents.forEach((comp) => {
                var components = this.allComponents[comp];
                
                if (components === undefined)
                    this.onXMLError('Componentref with id = ' + comp + ' on component with id = ' + component.id + ' is not defined');
            
                component.active = true;
                this.checkCicles(components);
                component.active = false;
            });
        }
    }

    update(t){
        for(var key in this.animations){
            this.animations[key].update(t);
        }
		// this.scene.shader.setUniformsValues({ timeFactor: t / 100 % 100 });

  

    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    display() {
        var rootComponent = this.allComponents[this.idRoot];
        var rootMaterial = rootComponent.materials[rootComponent.currMaterial];
        var rootTexture = rootComponent.texture;
        var rootScale = rootComponent.scaleFactor;
        this.displayComponents(rootComponent, rootTexture, rootScale, rootMaterial);
    }

    /**
     * Auxiliar fuction to go through all the graph
     * @param {MyComponent} component
     * @param {CGFappearance} parentTexture 
     * @param {CGFtexture} parentMaterial 
     */
    displayComponents(component, parentTexture, parentScale, parentMaterial) {
        this.scene.pushMatrix();

        // Transformations
        component.transformations.forEach((transformation) =>  {
            var transfMatrix = (typeof transformation === "string") ? this.transformations[transformation] : transformation;
            if (transfMatrix === undefined)
                this.onXMLError('Transformation on component with id = ' + component.id + ' is not defined');
            this.scene.multMatrix(transfMatrix);
        });

        // Materials
        var materialID;
        component.materials.forEach((material, index) =>  {
            if (index === component.currMaterial) {
                materialID = material;

                if (materialID === "inherit")
                    materialID = parentMaterial;

                if (this.materials[materialID] === undefined)
                    this.onXMLError('Material with id = ' + materialID + ' on component with id = ' + component.id + ' is not defined');
            }
        });
        var material = this.materials[materialID];
        
        // Texture
        var textureID = component.texture;
        var scaleFactor = component.scaleFactor;

        switch(textureID){
            case "inherit":
                textureID = parentTexture;
                if(scaleFactor[0] === null && scaleFactor[1] === null)
                    scaleFactor = parentScale;
                break;
            case "none":
                textureID = null;
                scaleFactor = [1,1]; // Back to default
                break;
        }   
        var texture = textureID !== null ? this.textures[textureID] : null;
        
        if (texture === undefined)
            this.onXMLError('Texture with id = ' + textureID + ' on component with id = ' + component.id + ' is not defined');
        
        material.setTexture(texture);
        material.setTextureWrap('REPEAT', 'REPEAT');
        material.apply();

        // Animation
        if(component.animation != null)
            component.animation.apply();

        if(component.animation == null || component.animation.isVisible()){
            if (component.isHighlighted && component.highlight.length > 0) {
                if (texture !== null) this.scene.shader.setUniformsValues({ hasTexture: true });
                else this.scene.shader.setUniformsValues({ hasTexture: false });
                this.scene.shader.setUniformsValues({ originalColor: material.diffuse });
                this.scene.shader.setUniformsValues({ pulseColor: component.highlight });
                this.scene.shader.setUniformsValues({ scaleFactor: component.scaleFactorPulse });
                this.scene.setActiveShader(this.scene.shader);
            }
            component.childPrimitives.forEach((primitiveId) => {
                this.primitives[primitiveId].updateTexCoords(scaleFactor);
                this.primitives[primitiveId].display();
            });     
            if (component.isHighlighted && component.highlight.length > 0) this.scene.setActiveShader(this.scene.defaultShader);

            // Children
            component.childComponents.forEach((comp) => {
                var components = this.allComponents[comp];
                
                if (components === undefined)
                    this.onXMLError('Componentref with id = ' + comp + ' on component with id = ' + component.id + ' is not defined');
            
                this.displayComponents(components, textureID, scaleFactor, materialID);
            });
        }

        this.scene.popMatrix();

        this.scene.setDefaultAppearance();

    }
}