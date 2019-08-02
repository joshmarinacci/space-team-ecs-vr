export class CubeModel {
    constructor() {
        this.mesh = new THREE.Mesh(
            new THREE.BoxBufferGeometry(1,1,1),
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



export class ThreeSceneHolder {
    constructor() {
        this.scene = new THREE.Scene()
        this.space_rot = new THREE.Group()
        this.space_trans = new THREE.Group()
        this.ship_group = new THREE.Group()

        this.scene.add(this.space_rot)
        this.space_rot.add(this.space_trans)
        this.scene.add(this.ship_group)
        this.renderer = null
    }
}

export class CameraHolder {
    constructor() {
        this.camera = null
    }
}
