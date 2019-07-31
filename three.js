import {System} from "./node_modules/ecsy/build/ecsy.module.js"
import {CubeModel, ThreeSceneHolder} from './common.js'
import {CanvasScreen, PhaserShotX, PlayerAvatar, Ship} from './player.js'

export class ThreeManager extends System {
    init() {
        return {
            queries: {
                scene: { components: [ThreeSceneHolder]},
                ships: {
                    components: [Ship],
                    events: {
                        added: { event: 'EntityAdded'},
                        removed: { event: 'EntityRemoved'}
                    }
                },
                enemies: {
                    components: [CubeModel],
                    events: {
                        added: { event: 'EntityAdded'},
                        removed: { event: 'EntityRemoved'}
                    }
                },
                avatars: {
                    components: [PlayerAvatar],
                    events: {
                        added: { event: 'EntityAdded'},
                        removed: { event: 'EntityRemoved'}
                    }
                },
                consoles: {
                    components: [CanvasScreen],
                    events: {
                        added: { event: 'EntityAdded'},
                        removed: { event: 'EntityRemoved'}
                    }
                },
                phasers: {
                    components: [PhaserShotX],
                    events: {
                        added: { event: 'EntityAdded'},
                        removed: { event: 'EntityRemoved'}
                    }
                },
            }
        }
    }
    execute(delta) {
        const holder = this.queries.scene[0].getMutableComponent(ThreeSceneHolder)
        const scene = holder.scene
        this.events.ships.added.forEach(ent => {
            holder.ship_group.add(ent.getComponent(Ship).wrapper)
        })
        this.events.ships.removed.forEach(ent => {
            if(ent.hasComponent(Ship)) holder.ship_group.remove(ent.getComponent(Ship).wrapper)
        })


        this.events.enemies.added.forEach(ent => {
            holder.space_trans.add(ent.getComponent(CubeModel).wrapper)
        })
        this.events.enemies.removed.forEach(ent => {
            if(ent.hasComponent(CubeModel)) holder.space_trans.remove(ent.getComponent(CubeModel).wrapper)
        })

        this.events.avatars.added.forEach(ent => {
            holder.ship_group.add(ent.getComponent(PlayerAvatar).wrapper)
        })
        this.events.avatars.removed.forEach(ent => {
            holder.ship_group.remove(ent.getComponent(PlayerAvatar).wrapper)
        })
        this.events.consoles.added.forEach(ent => {
            holder.ship_group.add(ent.getComponent(CanvasScreen).wrapper)
        })
        this.events.consoles.removed.forEach(ent => {
            holder.ship_group.remove(ent.getComponent(CanvasScreen).wrapper)
        })
        this.events.phasers.added.forEach(ent => {
            scene.add(ent.getComponent(PhaserShotX).wrapper)
        })
        this.events.phasers.removed.forEach(ent => {
            if(ent.hasComponent(PhaserShotX)) scene.remove(ent.getComponent(PhaserShotX).wrapper)
        })

    }
}


export class AnimatePosition {
    constructor() {
        this.curr = new THREE.Vector3(0,0,0)
        this.started = false
        this.from = new THREE.Vector3(0,0,0)
        this.dur = 0
        this.age = 0
    }
    copy({position = new THREE.Vector3(0,0,0), dur = 5, to = new THREE.Vector3(1,1,1)}) {
        this.curr.copy(position)
        this.dur = dur
        this.started = false
        this.age = 0
        this.to = to
    }
}

export class AnimationSystem extends System {
    init() {
        return {
            queries: {
                anims: { components: [AnimatePosition, CubeModel]}
            }
        }
    }
    execute(delta) {
        this.queries.anims.forEach(ent => {
            const anim = ent.getMutableComponent(AnimatePosition)
            const obj = ent.getComponent(CubeModel)
            if(!anim.started) {
                anim.from.copy(obj.wrapper.position)
                anim.age = 0
                anim.started = true
            }
            if(anim.started) {
                anim.age += delta
                const t = anim.age / anim.dur
                anim.curr.x = this.lerp(anim.from.x, anim.to.x, t)
                anim.curr.y = this.lerp(anim.from.y, anim.to.y, t)
                anim.curr.z = this.lerp(anim.from.z, anim.to.z, t)
                obj.wrapper.position.copy(anim.curr)
            }
            if(anim.age >= anim.dur) {
                ent.removeComponent(AnimatePosition)
                anim.started = false
            }
        })
    }

    lerp(a,b,t) {
        return a + (b-a)*t
    }
}