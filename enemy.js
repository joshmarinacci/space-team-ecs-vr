import {World, System} from "./node_modules/ecsy/build/ecsy.module.js"
import {CubeModel} from './common.js'
export class Enemy {

}

export class Hovering {
    constructor() {
        this.time = 0
        this.offset = 0
    }
    copy({offset=0}) {
        this.offset = offset
    }
}
export class HoverSystem extends System {
    init() {
        return {
            queries: {
                comps: { components: [Hovering, CubeModel]}
            }
        }
    }
    execute(delta) {
        this.queries.comps.forEach(ent => {
            const hov = ent.getMutableComponent(Hovering)
            hov.time += delta
            const pos = ent.getMutableComponent(CubeModel)
            pos.mesh.position.x = Math.sin(hov.time*1+hov.offset*50)*0.3
            pos.mesh.position.y = Math.sin(hov.time*2+hov.offset*50)*0.1
        })
    }
}