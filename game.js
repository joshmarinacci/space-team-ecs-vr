import {World} from "./node_modules/ecsy/build/ecsy.module.js"
import {Enemy, Hovering, HoverSystem} from './enemy.js'
import {CameraHolder, CubeModel, ThreeSceneHolder} from './common.js'
import {
    CanvasScreen,
    CanvasScreenRenderer,
    LocalPlayer,
    NavConsoleComponent,
    NavConsolePlayer,
    NavConsoleSystem,
    PlayerAvatar,
    ShieldStrength,
    Ship,
    WeaponsConsoleComponent,
    WeaponsConsolePlayer,
    WeaponsConsoleSystem,
    MousePointerSystem,
} from './player.js'
import {MouseInputState, MouseInputSystem} from './input.js'
import {AnimatePosition, AnimationSystem, ThreeManager} from './three.js'
import {NetworkState, NetworkSystem} from './network.js'
import {ImmersivePointerSystem,
    VR_DETECTED,
    VRManager,
    ImmersivePointer
} from './immersive.js'

/*

* both can see the central view-screen which shows the view of spaceships outside the bridge.
* the players are connected with a data channel.
* after enemies are gone, more show up.
* need a message indicator in the main view screen

 */





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


const world = new World();

world.registerSystem(MouseInputSystem)
world.registerSystem(MousePointerSystem)
world.registerSystem(ImmersivePointerSystem)
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

const ship = world.createEntity()
// ship.addComponent(CubeModel, {w:1,h:1,d:1, color:'green'})
ship.addComponent(Ship)
ship.addComponent(ShieldStrength)

const game = world.createEntity()
game.addComponent(GameState)
game.addComponent(MouseInputState)
game.addComponent(ScreenState)
game.addComponent(NetworkState)

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
        const player = world.createEntity()
        player.addComponent(PlayerAvatar,{color:'aqua'})
        player.addComponent(NavConsolePlayer)
        player.addComponent(LocalPlayer)
        player.getComponent(PlayerAvatar).wrapper.position.set(-1,-1,1)
    })
    on($("#play-weapons"),'click',()=>{
        hideChoose()
        const player = world.createEntity()
        player.addComponent(LocalPlayer)
        player.addComponent(PlayerAvatar,{color:'aqua'})
        player.addComponent(WeaponsConsolePlayer)
        player.getComponent(PlayerAvatar).wrapper.position.set(+1,-1,1)
    })
}

function setupScreens() {
    $("#play-vr").disabled = true
    const renderer = sceneEnt.getComponent(ThreeSceneHolder).renderer
    const vr = new VRManager(renderer)
    on(vr,VR_DETECTED,()=>{
        $("#play-vr").disabled = false
    })
    on($("#play-vr"),'click',()=>{
        console.log('starting the VR')
        vr.enterVR()
        // game.addComponent(VRMode)
        const pointer1 = world.createEntity()
        pointer1.addComponent(ImmersivePointer,{hand:0})
        const pointer2 = world.createEntity()
        pointer2.addComponent(ImmersivePointer,{hand:1})
    })
    on($("#play-desktop"),'click',()=>{
        hideSplash()
        showChoose()
    })
}


function startGame() {
    generateScenario()
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

    sceneEnt.getMutableComponent(ThreeSceneHolder).renderer = renderer
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

    setupScreens()

}


startGame()

