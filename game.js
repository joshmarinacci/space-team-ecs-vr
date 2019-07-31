import {World, System, SchemaTypes } from "./node_modules/ecsy/build/ecsy.module.js"
import {Enemy, Hovering, HoverSystem} from './enemy.js'
import {CameraHolder, CubeModel, ThreeSceneHolder} from './common.js'
import {
    CanvasScreen,
    CanvasScreenRenderer,
    NavConsoleComponent,
    NavConsolePlayer,
    NavConsoleSystem,
    PlayerAvatar, Ship, WeaponsConsoleComponent, WeaponsConsolePlayer, WeaponsConsoleSystem
} from './player.js'
import {MouseInputState, MouseInputSystem} from './input.js'
import {ThreeManager, AnimationSystem, AnimatePosition} from './three.js'
import {ShieldStrength} from './player.js'

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


scene:
    world-rot:
        world-trans:
            enemy ships:
    stage:
        //round floor
        //consoles
        viewer screen (eventually)
        captain
        no more model of the ship

when moving ship, move world in the opposite direction


// screens:
//     splash:
//         click to play flat
//         click to play VR
//         name of the game
//     choose:
//         choose the position you want to be
//         if already chosen by someone else, then disabled
//     play:
//         full scene


// shield strength is a component on the main game
// render shield strength on to the nav and weapons screens

after enemies are gone, more show up.
need a message indicator in the main view screen


 */





class LocalPlayer {

}
class NetworkedPlayer {

}


class GameState {

}


const SCREEN_STATES = {
    splash:'splash',
    choose_player:'choose_player',
    play:'play',
    dead:'dead',
}
class ScreenState {
    constructor() {
        this.state = SCREEN_STATES.splash
    }
}

class Scenario {
    addEnemy(en) {
    }
}


class NetworkSystem extends System {

}



const world = new World();

world.registerSystem(MouseInputSystem)
// world.registerSystem(EnemySystem) // moves enemies around, makes them fire on you, handles being killed
world.registerSystem(NavConsoleSystem) // handles logic for the nav console
world.registerSystem(WeaponsConsoleSystem) // handles logic for the weapons console
// world.registerSystem(PhasersRenderer) // draws phasers
// world.registerSystem(TorpedosRenderer) // draws photon torpedos
// world.registerSystem(ScenarioRunner) // moves scenarios through states for different waves
world.registerSystem(NetworkSystem) // handles communication between people on the network
world.registerSystem(HoverSystem)
world.registerSystem(CanvasScreenRenderer) // renders canvases into textures for ThreeJS land
world.registerSystem(AnimationSystem)
world.registerSystem(ThreeManager)

world.registerComponent(CubeModel)
world.registerComponent(AnimatePosition)
world.registerComponent(CanvasScreen)




const navConsole = world.createEntity()
navConsole.addComponent(CanvasScreen)
navConsole.getMutableComponent(CanvasScreen).wrapper.position.set(-2,0,3)
navConsole.addComponent(NavConsoleComponent)

const weaponsConsole = world.createEntity()
weaponsConsole.addComponent(CanvasScreen)
weaponsConsole.getMutableComponent(CanvasScreen).wrapper.position.set(2,0,3)
weaponsConsole.addComponent(WeaponsConsoleComponent)

const player1 = world.createEntity()
// player1.addComponent(PlayerAvatar)
// player1.getComponent(PlayerAvatar).wrapper.position.set(-1,-1,1)
// player1.addComponent(LocalPlayer)
// player1.addComponent(NavConsolePlayer)

const player2 = world.createEntity()
// player2.addComponent(PlayerAvatar)
// player2.addComponent(NetworkedPlayer)
// player2.addComponent(WeaponsConsolePlayer)
// player2.getComponent(PlayerAvatar).wrapper.position.set(1,-1,1)


const ship = world.createEntity()
// ship.addComponent(CubeModel, {w:1,h:1,d:1, color:'green'})
ship.addComponent(Ship)
ship.addComponent(ShieldStrength)

const game = world.createEntity()
game.addComponent(GameState)
game.addComponent(MouseInputState)
game.addComponent(ScreenState)

const sceneEnt = world.createEntity()
sceneEnt.addComponent(ThreeSceneHolder)
sceneEnt.addComponent(CameraHolder)



function generateScenario() {
    const enemy1 = world.createEntity()
    enemy1.addComponent(CubeModel,{w:1,h:1,d:1,color:'red'})
    enemy1.addComponent(Enemy)
    enemy1.addComponent(Hovering, {offset: Math.random()})
    enemy1.getMutableComponent(CubeModel).wrapper.position.set(-2,0,-1)

    const enemy2 = world.createEntity()
    enemy2.addComponent(CubeModel,{w:1,h:1,d:1,color:'red'})
    enemy2.addComponent(Enemy)
    enemy2.addComponent(Hovering, {offset: Math.random()})
    enemy2.getMutableComponent(CubeModel).wrapper.position.set(2,0,-1)

    const sc = new Scenario()
    game.addComponent(Scenario,sc)
    game.getMutableComponent(Scenario).addEnemy(enemy1)
    game.getMutableComponent(Scenario).addEnemy(enemy2)
}


const $ = (sel) => document.querySelector(sel)
const on =(el,type,cb) => el.addEventListener(type,cb)

function hideSplash() {
    $('#splash').classList.add('hidden')
}


function hideChoose() {
    $("#choose").classList.add('hidden')
}

function showChoose() {
    $('#choose').classList.remove('hidden')
    on($("#play-nav"),'click',()=>{
        hideChoose()
        player1.addComponent(PlayerAvatar,{color:'aqua'})
        player1.addComponent(NavConsolePlayer)
        player1.getComponent(PlayerAvatar).wrapper.position.set(-1,-1,1)
    })
    on($("#play-weapons"),'click',()=>{
        hideChoose()
        player1.addComponent(PlayerAvatar,{color:'aqua'})
        player1.addComponent(WeaponsConsolePlayer)
        player1.getComponent(PlayerAvatar).wrapper.position.set(+1,-1,1)
    })
}

function setupScreens() {
    $("#play-vr").setAttribute('disabled',true)
    $("#play-desktop").addEventListener('click',()=>{
        hideSplash()
        showChoose()
    })
}


function startGame() {
    generateScenario()
    setupScreens()
    game.getMutableComponent(GameState).mode = 'PLAYING'

    const clock = new THREE.Clock();
    const scene = sceneEnt.getComponent(ThreeSceneHolder).scene

    const camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 0.005, 10000 );
    camera.position.z = 5;

    const floor = new THREE.Mesh(
        new THREE.CircleBufferGeometry(2,16),
        new THREE.MeshLambertMaterial({color: 'gray'})
    )

    function toRad(def) {
        return def/180*Math.PI
    }

    floor.rotation.x = toRad(-90)
    floor.position.y = -1.5
    sceneEnt.getComponent(ThreeSceneHolder).ship_group.add(floor)


    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x333333 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );

    sceneEnt.getMutableComponent(CameraHolder).camera = camera
    const ambientLight = new THREE.AmbientLight( 0xcccccc );
    scene.add( ambientLight );


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

