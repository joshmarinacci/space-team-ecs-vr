//draw players as spheres
import {World, System} from "./node_modules/ecsy/build/ecsy.module.js"
import {CubeModel} from './common'
import {Enemy} from './enemy'
import {MouseInputState} from './input'

export class NavConsoleComponent {
}
export class NavConsolePlayer {

}
export class NavConsoleSystem extends System {

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


export class CanvasScreenRenderer extends System {
    init() {
        return {
            queries: {
                input: { components: [MouseInputState]},
                navs: { components: [NavConsoleComponent, CanvasScreen]},
                enemies: {
                    components: [Enemy, CubeModel],
                    events: {
                        removed: {
                            event:'ComponentRemoved'
                        }
                    }
                },
            }
        }
    }
    execute(delta) {
        //check the input
        this.queries.input.forEach(ent => {
            const mouse = ent.getComponent(MouseInputState)
            if(mouse.pressed && mouse.type === 'mousedown') {
                const uv = mouse.intersection.uv
                const pt = new THREE.Vector2(uv.x*128, 128 - uv.y*128)
                this.handleClick(pt)
            }
        })

        //draw the navs
        this.queries.navs.forEach(sc => {
            const can = sc.getComponent(CanvasScreen)
            const c = can.getContext()
            c.fillStyle = 'gray'
            c.fillRect(0,0,can.getWidth(),can.getHeight())


            this.queries.enemies.forEach(ent => {
                const en = ent.getComponent(CubeModel)
                c.fillStyle = 'red'
                c.save()
                c.translate(50+en.wrapper.position.x*10,en.wrapper.position.z*10+50)
                c.fillRect(0,0,10,10)
                c.restore()
            })

            can.flush()
        })
    }

    handleClick(pt) {
        this.queries.enemies.forEach(ent => {
            const en = ent.getComponent(CubeModel)
            const x = 50+en.wrapper.position.x*10
            const y = 50+en.wrapper.position.z*10
            if(pt.x >= x && pt.x <= x+10) {
                if(pt.y >= y && pt.y <= y+10) {
                    // console.log("clicked on enemy")
                    this.shootEnemy(ent)
                }
            }
        })
    }

    shootEnemy(ent) {
        ent.removeComponent(Enemy)
        ent.removeComponent(CubeModel)
    }
}
