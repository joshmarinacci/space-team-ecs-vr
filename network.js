import {System} from "./node_modules/ecsy/build/ecsy.module.js"
import {PhaserShotX, Ship} from './player.js'

const states = {
    disconnected:'disconnected',
    connecting:'connecting',
    connected:'connected',
}

export class NetworkState {
    constructor() {
        this.mode = 'disconnected'
    }
}

export class NetworkSystem extends System {
    init() {
        return {
            queries: {
                state: { components: [NetworkState]},
                ships: { components: [Ship] },
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

    execute() {
        this.queries.state.forEach(ent => this.updateNetwork(ent.getMutableComponent(NetworkState)))
    }

    updateNetwork(state) {
        this.queries.ships.forEach(ent => {
            const ship = ent.getComponent(Ship)
            console.log("ship is now",ship.wrapper.position.x)
            //if position changed, then send over the network
        })

        if(state.mode === states.disconnected) {
            state.mode = states.connecting
            console.log("state is",state.mode)
            /*
            state.pubnub = new PubNub({
                pubkey:'foo',
                subkey:'foo'
            })
            state.pubnub.subscribe({
                channels:['foozoo'],
                onMessage:((m)=>{
                    console.log("got a message",m)
                    if(m.payload.type === 'choose') {
                        console.log("the other player has chosen",m.payload.role)
                    }
                }),
                onConnect:(()=>{
                    state.mode = states.connected
                    state.pubnub.publish({
                        message:{
                            type:'choose',
                            role:'nav'
                        }
                    })
                }),
            })
             */
        }


        this.events.phasers.added.forEach(ent => {
            const phaser = ent.getComponent(PhaserShotX)
            console.log("fired a phaser at ",phaser.target)
            //if phaser changed, send over the network
        })
    }
}