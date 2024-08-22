import { MySceneGraph } from "./MySceneGraph.js";

export class MySceneParser {
    /**
     * Constructor for the scene parser
     * @param {XMLscene} scene 
     */
    constructor(scene) {
        this.scene = scene

        this.fileNames = [
            'park.xml',
            'house.xml',
        ]

        this.sceneGraphs = new Map()

        this.loadScenes()

        // this.changeTheme('park.xml')
    }

    /**
     * Creates the graphs for each scene file
     */
    loadScenes() {
        let index = 0;
        this.fileNames.forEach(file => {
            if (index === 0) this.currentScene = new MySceneGraph(file, this.scene, this)
            else new MySceneGraph(file, this.scene, this)
            index++;
        })
    }

    /**
     * Function to handle the graph loading
     * @param {MySceneGraph} graph graph that just finished loaded
     */
    onGraphLoaded(graph) {
        this.sceneGraphs.set(graph.filename, graph)
        if (this.sceneGraphs.size === 1) {
            this.currentTheme = graph.filename
            this.scene.setGraph(graph)
        } 
        
        if (this.sceneGraphs.size === this.fileNames.length) {
            this.allGraphsLoaded()
        }
    }

    /**
     * Update the interface to be able to switch themes
     */
    allGraphsLoaded() {
        this.scene.interface.updateThemes();
    }

    /**
     * Switch to the selected theme
     * @param {string} theme theme name
     */
    changeTheme(theme) {
        this.scene.setGraph(this.sceneGraphs.get(theme))
    }
}