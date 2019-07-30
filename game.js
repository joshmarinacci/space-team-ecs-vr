import {World, System} from "./node_modules/ecsy/build/ecsy.module.js"

/*

* * Single simple environment with two stations: navigation and weapons, and a single view screen.
* one person must fly the ship
* the other person must target enemy ships using one kind of weapon
* both use a display showing the various vessels in a 2d view and click to do their job.
* both can see the central view-screen which shows the view of spaceships outside the bridge.
* the players are connected with a data channel.
* there is no voice chat
* there is no server (beyond the web server), whichever client goes first becomes the master and generates scenarios. The other one just follows.
* Initial scenario. 1, then 2, then 3 ships are attacking. You must fly away from torpedos and fire your own phasers.  Survive and you win. Else you die.

 */

class CanvasScreen {
    constructor() {
        this.position = new THREE.Vector3(0,0,0)
    }

}
class NavConsoleComponent {
}
class NavConsolePlayer {

}
class NavConsoleSystem extends System {

}
class WeaponsConsoleComponent {
}
class WeaponsConsolePlayer {

}
class WeaponsConsoleSystem extends System {

}

class PlayerAvatar {

}
class LocalPlayer {

}
class NetworkedPlayer {

}


class CubeModel {
    constructor() {
        this.position = new THREE.Vector3(0, 0, 0)
    }
}


class GameState {

}
class Scenario {
    addEnemy(en) {
        console.log("adding an enemty",en)
    }
}

class EnemySystem extends System {

}
class CanvasScreenRenderer extends System {

}
class CanvasScreenInputHandler extends System {

}
class MainThreeRenderer extends System {

}
class PhasersRenderer extends System {

}
class ScenarioRunner extends System {

}

class TorpedosRenderer extends System {

}

class NetworkSystem extends System {

}

class Enemy {

}


const world = new World();
const navConsole = world.createEntity()
navConsole.addComponent(CanvasScreen)
navConsole.getMutableComponent(CanvasScreen).position.set(0,0,0)
navConsole.addComponent(NavConsoleComponent)

const weaponsConsole = world.createEntity()
weaponsConsole.addComponent(CanvasScreen)
weaponsConsole.getMutableComponent(CanvasScreen).position.set(0,0,0)
weaponsConsole.addComponent(WeaponsConsoleComponent)

const player1 = world.createEntity()
player1.addComponent(PlayerAvatar)
player1.addComponent(LocalPlayer)
player1.addComponent(NavConsolePlayer)

const player2 = world.createEntity()
player2.addComponent(PlayerAvatar)
player2.addComponent(NetworkedPlayer)
player2.addComponent(WeaponsConsolePlayer)


// const mainScreen = world.createEntity()
// mainScreen.add(GLTFModel,{src:"./mainScreen.gltf"})
//mainScreen.add(Portal)
// const room = world.createEntity()
// room.add(GLTFModel,{src:"./bridge.gltf"})

const ship = world.createEntity()
ship.addComponent(CubeModel, {w:1,h:1,d:1, color:'green'})

const game = world.createEntity()
game.addComponent(GameState)

function generateScenario() {
    const enemy1 = world.createEntity()
    enemy1.addComponent(CubeModel,{w:1,h:1,d:1,color:'red'})
    enemy1.addComponent(Enemy)
    enemy1.getMutableComponent(CubeModel).position.set(0,0,0)

    const enemy2 = world.createEntity()
    enemy2.addComponent(CubeModel,{w:1,h:1,d:1,color:'blue'})
    enemy2.addComponent(Enemy)
    enemy2.getMutableComponent(CubeModel).position.set(0,0,0)

    const sc = new Scenario()
    game.addComponent(Scenario,sc)
    game.getMutableComponent(Scenario).addEnemy(enemy1)
    game.getMutableComponent(Scenario).addEnemy(enemy2)
}

world.registerSystem(EnemySystem) // moves enemies around, makes them fire on you, handles being killed
world.registerSystem(CanvasScreenRenderer) // renders canvases into textures for ThreeJS land
world.registerSystem(CanvasScreenInputHandler) // casts touch/click/vr events back to 2D land
world.registerSystem(MainThreeRenderer) // draws everything in ThreeJS land
world.registerSystem(NavConsoleSystem) // handles logic for the nav console
world.registerSystem(WeaponsConsoleSystem) // handles logic for the weapons console
world.registerSystem(PhasersRenderer) // draws phasers
world.registerSystem(TorpedosRenderer) // draws photon torpedos
world.registerSystem(ScenarioRunner) // moves scenarios through states for different waves
world.registerSystem(NetworkSystem) // handles communication between people on the network


function startGame() {
    generateScenario()
    game.getMutableComponent(GameState).mode = 'PLAYING'

    var clock = new THREE.Clock();

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 0.005, 10000 );
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x333333 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );


    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function animate() {
        const delta = clock.getDelta();
        const elapsedTime = clock.elapsedTime;
        // console.time('render');
        world.execute(delta, elapsedTime);
        // console.timeEnd('render');

        renderer.render( scene, camera );
    }

    renderer.setAnimationLoop(animate);
}


startGame()

