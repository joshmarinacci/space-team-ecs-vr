//draw players as spheres
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
        this.canvas.width = 512
        this.canvas.height = 512
        this.texture = new THREE.CanvasTexture(this.canvas)

        this.mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(0.5,0.5),
            new THREE.MeshLambertMaterial({map:this.texture})
        )
        this.wrapper = new THREE.Group()
        this.wrapper.add(this.mesh)


        this.redraw()
    }


    redraw() {
        const c = this.canvas.getContext('2d')
        c.fillStyle = 'blue'
        c.fillRect(0,0,this.canvas.width, this.canvas.height)
    }
}
