import {System} from "./node_modules/ecsy/build/ecsy.module.js"
import {CubeModel, ThreeSceneHolder} from './common.js'
import {Enemy} from './enemy.js'
import {MouseInputState} from './input.js'
import {AnimatePosition} from './three.js'

export class NavConsoleComponent {
}
export class NavConsolePlayer {

}
export class NavConsoleSystem extends System {

}

export class WeaponsConsoleComponent {
}
export class WeaponsConsolePlayer {

}
export class WeaponsConsoleSystem extends System {

}


export class PlayerAvatar {
    constructor() {
        this.mesh = new THREE.Mesh(
            new THREE.SphereBufferGeometry(0.2),
            new THREE.MeshLambertMaterial({color:'red'})
        )
        this.wrapper = new THREE.Group()
        this.wrapper.add(this.mesh)
    }
    copy(src) {
        if(src && src.color) {
            this.mesh.material = new THREE.MeshLambertMaterial({color:src.color})
        }
    }
}

export class CanvasScreen {
    constructor() {
        this.canvas = document.createElement('canvas')
        this.canvas.width = 128
        this.canvas.height = 128
        this.texture = new THREE.CanvasTexture(this.canvas)

        this.mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(0.5,0.5),
            new THREE.MeshLambertMaterial({map:this.texture})
        )
        this.wrapper = new THREE.Group()
        this.wrapper.add(this.mesh)
        this.mesh.userData.clickable = true


        this.redraw()
    }

    getContext() {
        return this.canvas.getContext('2d')
    }

    flush() {
        this.texture.needsUpdate = true
    }

    getWidth() {
        return this.canvas.width
    }
    getHeight() {
        return this.canvas.height
    }


    redraw() {
        const c = this.canvas.getContext('2d')
        c.fillStyle = 'blue'
        c.fillRect(0,0,this.canvas.width, this.canvas.height)
    }
}

export class Ship {

}


export class CanvasScreenRenderer extends System {
    init() {
        return {
            queries: {
                scene: { components: [ThreeSceneHolder]},
                input: { components: [MouseInputState]},
                navs: { components: [CanvasScreen]},
                phasers: { components: [PhaserShot]},
                enemies: {
                    components: [Enemy, CubeModel],
                    events: {
                        added: { event: 'EntityAdded'},
                        removed: { event: 'EntityRemoved'}
                    }
                },
                ships: { components: [Ship, CubeModel] },
            }
        }
    }
    execute(delta) {
        this.queries.input.forEach(ent => {
            const mouse = ent.getComponent(MouseInputState)
            if(mouse.pressed && mouse.type === 'mousedown') {
                this.handleClick(mouse)
            }
        })

        //draw the navs
        this.queries.navs.forEach(sc => {
            const can = sc.getComponent(CanvasScreen)
            const c = can.getContext()

            this.drawBackground(c,can)
            this.queries.enemies.forEach(ent =>  this.drawEnemyShip(c,ent.getComponent(CubeModel)))
            this.queries.ships.forEach(ent => this.drawPlayerShip(c, ent.getComponent(CubeModel)))
            this.queries.phasers.forEach(ent => {
                const shot = ent.getMutableComponent(PhaserShot)
                this.drawPhaserShot(c, ent.getMutableComponent(PhaserShot))
                shot.age += delta
                if(shot.age > shot.timeout) {
                    const sceneEnt = this.queries.scene[0]
                    const scene = sceneEnt.getMutableComponent(ThreeSceneHolder).scene

                    scene.remove(shot.target.getComponent(CubeModel).wrapper)
                    shot.target.removeComponent(CubeModel)
                    ent.removeComponent(PhaserShot)
                    scene.remove(ent.getComponent(PhaserShotX).wrapper)
                    ent.removeComponent(PhaserShotX)
                }
            })

            can.flush()
        })
    }

    handleClick(mouse) {
        const uv = mouse.intersection.uv
        const pt = new THREE.Vector2(uv.x*128, 128 - uv.y*128)
        this.queries.navs.forEach(ent => {
            const can = ent.getComponent(CanvasScreen)
            if(mouse.intersection.object !== can.mesh) return
            if(ent.hasComponent(NavConsoleComponent)) {
                //move the ship
                this.queries.ships.forEach(ent => {
                    const newPos = this.fromCanvas(pt)
                    ent.addComponent(AnimatePosition,{to:newPos, dur:3 })
                })
            }
            if(ent.hasComponent(WeaponsConsoleComponent)) {
                //check if we shot an enemy
                this.queries.enemies.forEach(ent => {
                    const en = ent.getComponent(CubeModel)
                    const pt2 = this.toCanvas(en.wrapper.position)
                    if(pt.x >= pt2.x-10 && pt.x <= pt2.x+10) {
                        if(pt.y >= pt2.y-10 && pt.y <= pt2.y+10) {
                            this.shootEnemy(ent)
                        }
                    }
                })
            }
        })
    }

    shootEnemy(ent) {
        const shot = this.world.createEntity()
        console.log("target is",ent, this.queries.ships[0])
        shot.addComponent(PhaserShot, {source:this.queries.ships[0], target:ent})
        shot.addComponent(PhaserShotX,{source:this.queries.ships[0], target:ent})
    }

    fromCanvas(pt) {
        return new THREE.Vector3(
            (pt.x-64)/10,
            0,
            (pt.y-64)/10,
        )
    }

    toCanvas(v) {
        return {
            x: 64+v.x*10,
            y: 64+v.z*10,
            z: v.z,
        }
    }

    drawEnemyShip(c, en) {
        c.fillStyle = 'red'
        c.save()
        const s = 5
        const pos = this.toCanvas(en.wrapper.position)
        c.translate(pos.x,pos.y)
        c.fillRect(-s,-s,s*2,s*2)
        c.restore()
    }

    drawPlayerShip(c, obj) {
        c.fillStyle = 'blue'
        c.save()
        const s = 7
        const pos = this.toCanvas(obj.wrapper.position)
        c.translate(pos.x,pos.y)
        c.fillRect(-s,-s,s*2,s*2)
        c.restore()
    }

    drawBackground(c, can) {
        c.fillStyle = 'gray'
        c.fillRect(0,0,can.getWidth(),can.getHeight())

    }

    drawPhaserShot(c, shot) {
        c.strokeStyle = 'white'
        c.beginPath()
        const start = this.toCanvas(shot.source.getComponent(CubeModel).wrapper.position)
        const end = this.toCanvas(shot.target.getComponent(CubeModel).wrapper.position)
        c.moveTo(start.x,start.y)
        c.lineTo(end.x,end.y)
        c.lineWidth = 3.0
        c.stroke()
    }
}


class PhaserShot {
    copy({source, target}) {
        this.source = source
        this.target = target
        this.age = 0
        this.timeout = 2
    }
}

export class PhaserShotX {
    constructor() {
        // this.source = null
        this.mesh = new THREE.Mesh(
            new THREE.BoxBufferGeometry(3.0,0.2,0.2),
            new THREE.MeshLambertMaterial({color:'red'})
        )
        this.mesh.position.set(-3/2,0,0)
        this.wrapper = new THREE.Group()
        this.wrapper.add(this.mesh)
    }

    copy({source, target}) {
        console.log("Made",source,target)
        if(!source )return
        this.source = source
        this.target = target
        this.age = 0
        this.timeout = 2
        this.wrapper.position.copy(this.source.getComponent(CubeModel).wrapper.position)

        const tgtPos = this.target.getComponent(CubeModel).wrapper.position
        // const diff = .sub(this.wrapper.position)
        this.wrapper.lookAt(tgtPos)
        // console.log("diff is",diff)
    }
}