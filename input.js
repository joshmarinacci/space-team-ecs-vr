import {World, System} from "./node_modules/ecsy/build/ecsy.module.js"
import {CameraHolder, ThreeSceneHolder} from './common.js'

export class Clicked {

}
export class MouseInputState {
    constructor() {
        this.intersection = null
        this.prev = null
        this.curr = null
        this.pressed = false
    }
}
export class MouseInputSystem extends System {
    init() {
        document.addEventListener('mousedown',(e)=>{
            this.lastEvent = e
        })
        document.addEventListener('mouseup',(e)=>{
            this.lastEvent = e
        })
        this.raycaster = new THREE.Raycaster()
        return {
            queries: {
                mouse: {components: [MouseInputState]},
                camera: {components: [CameraHolder]},
                scene: {components: [ThreeSceneHolder]}
            }
        }
    }

    execute(delta) {
        //reset the mouse state
        this.queries.mouse.forEach(en => {
            const mis = en.getMutableComponent(MouseInputState)
            mis.prev = mis.curr
            mis.curr = this.lastEvent
            mis.type = "nothing"
        })

        if(!this.lastEvent) {
            return
        }


        const e = this.lastEvent
        const mouse = new THREE.Vector2()
        const bounds = e.target.getBoundingClientRect()
        mouse.x = ((e.clientX - bounds.left) / bounds.width) * 2 - 1
        mouse.y = -((e.clientY - bounds.top) / bounds.height) * 2 + 1

        const camera = this.queries.camera[0]
        const scene = this.queries.scene[0]
        if(camera) {
            this.raycaster.setFromCamera(mouse, camera.getComponent(CameraHolder).camera)
            const intersects = this.raycaster.intersectObjects(scene.getComponent(ThreeSceneHolder).scene.children, true)
                // .filter(it => this.intersectionFilter(it.object))
            intersects.forEach((it) => {
                if(it.object.userData.clickable) {
                    this.queries.mouse.forEach(en => {
                        const mis = en.getMutableComponent(MouseInputState)
                        mis.intersection = it
                        if(this.lastEvent.type === 'mousedown') {
                            mis.pressed = true
                            mis.type = 'mousedown'
                        }
                        if(this.lastEvent.type === 'mouseup') {
                            mis.pressed = false
                            mis.type = 'mouseup'
                        }
                    })
                    // const fpt = new THREE.Vector2(uv.x * 256, 512 - uv.y * 512)
                }
            })

        }
        this.lastEvent = false
    }
}
