import {CameraHolder, ThreeSceneHolder} from './common.js'
import {Clicked, Clickable} from './input.js'

function printError(err) {
    console.log(err)
}

export const VR_DETECTED = "detected"
export const VR_CONNECTED = "connected"
export const VR_DISCONNECTED = "disconnected"
export const VR_PRESENTCHANGE = "presentchange"
export const VR_ACTIVATED = "activated"



export class VRManager {
    constructor(renderer) {
        this.device = null
        this.renderer = renderer
        if(!this.renderer) throw new Error("VR Manager requires a valid ThreeJS renderer instance")
        this.listeners = {}

        if ('xr' in navigator) {
            console.log("has webxr")
            navigator.xr.requestDevice().then((device) => {
                device.supportsSession({immersive: true, exclusive: true /* DEPRECATED */})
                    .then(() => {
                        this.device = device
                        this.fire(VR_DETECTED,{})
                    })
                    .catch(printError);

            }).catch(printError);
        } else if ('getVRDisplays' in navigator) {
            console.log("has webvr")

            window.addEventListener( 'vrdisplayconnect', ( event ) => {
                this.device = event.display
                this.fire(VR_CONNECTED)
            }, false );

            window.addEventListener( 'vrdisplaydisconnect', ( event )  => {
                this.fire(VR_DISCONNECTED)
            }, false );

            window.addEventListener( 'vrdisplaypresentchange', ( event ) => {
                this.fire(VR_PRESENTCHANGE)
            }, false );

            window.addEventListener( 'vrdisplayactivate',  ( event ) => {
                this.device = event.display
                this.device.requestPresent([{source:this.renderer.domElement}])
                this.fire(VR_ACTIVATED)
            }, false );

            navigator.getVRDisplays()
                .then( ( displays ) => {
                    console.log("vr scanned")
                    if ( displays.length > 0 ) {

                        // showEnterVR( displays[ 0 ] );
                        console.log("found vr",displays[0])
                        this.device = displays[0]
                        this.fire(VR_DETECTED,{})

                    } else {
                        console.log("no vr at all")
                        // showVRNotFound();
                    }

                } ).catch(printError);

        } else {
            // no vr
            console.log("no vr at all")
        }
    }

    addEventListener(type, cb) {
        if(!this.listeners[type]) this.listeners[type] = []
        this.listeners[type].push(cb)
    }
    fire(type,evt) {
        if(!evt) evt = {}
        evt.type = type
        if(!this.listeners[type]) this.listeners[type] = []
        this.listeners[type].forEach(cb => cb(evt))
    }

    enterVR() {
        if(!this.device) {
            console.warn("tried to connect VR on an invalid device")
            return
        }
        console.log("entering VR")
        const prom = this.renderer.vr.setDevice( this.device );
        console.log('promise is',prom)

        if(this.device.isPresenting) {
            this.device.exitPresent()
        } else {
            this.device.requestPresent([{source: this.renderer.domElement}]);
        }
    }

}

export class ImmersivePointer {
    constructor() {
    }
    copy({hand}) {
        this.hand = hand
        this.raycaster = new THREE.Raycaster()
        this.target = null
    }
    controllerSelectStart(e) {
        console.log("the controller has been selected")
        this.target = e.target
    }
}


export class ImmersivePointerSystem {
    init() {
        return {
            queries: {
                pointers: {
                    component: [ImmersivePointer]
                },
                scenes: {
                    component: [ThreeSceneHolder, CameraHolder]
                }
            }
        }
    }
    execute(delta) {
        const renderer = this.queries.scenes.component[0].getComponent(ThreeSceneHolder).renderer
        const scene = this.queries.scenes.component[0].getComponent(ThreeSceneHolder).scene


        this.queries.pointers.added.forEach((ent)=>{
            const pointer = ent.getComponent(ImmersivePointer)
            pointer.controller = renderer.vr.getController(pointer.hand);
            pointer.controller.addEventListener('selectstart',
                pointer.controllerSelectStart.bind(pointer));
            // pointer.controller.addEventListener('selectend',
            //     pointer.controllerSelectEnd.bind(pointer));

            const geometry = new THREE.BufferGeometry()
            geometry.addAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -8], 3));
            geometry.addAttribute('color', new THREE.Float32BufferAttribute([1.0, 0.5, 0.5, 0, 0, 0], 3));

            const material = new THREE.LineBasicMaterial({
                vertexColors: false,
                color: 0x880000,
                linewidth: 5,
                blending: THREE.NormalBlending
            })

            pointer.controller.add(new THREE.Line(geometry, material));
            scene.add(pointer.controller);
        })

        this.queries.pointers.forEach(ent => {
            const pointer = ent.getComponent(ImmersivePointer)
            this.updatePointerPosition(pointer)
            this.checkPointerClick(pointer)
        })
    }

    updatePointerPosition(pointer) {
        if(!pointer.controller.visible) return
        const c = pointer.controller
        const dir = new THREE.Vector3(0, 0, -1)
        dir.applyQuaternion(c.quaternion)
        // pointer.raycaster.set(c.position, dir)
    }

    checkPointerClick(pointer) {
        if(!pointer.target) return
        const c = pointer.target
        const dir = new THREE.Vector3(0, 0, -1)
        dir.applyQuaternion(c.quaternion)
        pointer.raycaster.set(c.position, dir)
        const scene = this.queries.scenes.component[0].getComponent(ThreeSceneHolder).scene
        const intersects = pointer.raycaster.intersectObjects(scene.children, true)
        //     .filter(it => this.intersectionFilter(it.object))
        intersects.forEach((it) => {
            console.log("got some intersections")
            //if a clickable object was the target, then add a Clicked component
            const clickable = this.queries.clickable.find(ent => ent.getComponent(Clickable).getThreeObject() == it.object)
            if(clickable) {
                console.log("found a clickble",clickable)
                clickable.addComponent(Clicked,{intersection:it})
            }
        })
    }


}