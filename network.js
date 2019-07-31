import {System} from "./node_modules/ecsy/build/ecsy.module.js"
import {LocalPlayer, NavConsolePlayer, PhaserShotX, Ship, WeaponsConsolePlayer} from './player.js'

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

const CHANNEL = "foozoo"

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
                players: {
                    components: [LocalPlayer],
                    events: {
                        added: { event: 'EntityAdded'},
                        removed: { event: 'EntityRemoved'}
                    }
                }
            }
        }
    }

    execute() {
        this.queries.state.forEach(ent => this.updateNetwork(ent.getMutableComponent(NetworkState)))
    }

    updateNetwork(state) {
        this.queries.ships.forEach(ent => {
            const ship = ent.getComponent(Ship)
            // console.log("ship is now",ship.wrapper.position.x)
            //if position changed, then send over the network
        })

        if(state.mode === states.disconnected) {
            state.mode = states.connecting
            console.log("connecting to the network")
            state.pubnub = new PubNub({
                publish_key:'pub-c-d25e6314-7990-4ab7-a3c5-bc1675a76c78',
                subscribe_key:'sub-c-3c574a32-b3dd-11e9-a7e1-2afc1677ec4d'
            })
            state.pubnub.subscribe({
                channels: [CHANNEL],
            })
            state.pubnub.addListener({
                status: (e) => {
                    // console.log("status",e)
                    if(e.category === 'PNConnectedCategory') {
                        console.log("connected")
                        state.mode = states.connected
                        state.pubnub.publish({
                            channel:CHANNEL,
                            message:{
                                type:'choose',
                                role:'nav'
                            }
                        })
                    }
                },
                message:((m)=>{
                    if(m.publisher === state.pubnub.getUUID()) {
                        console.log("it's my own message. never mind")
                        return
                    }
                    console.log("got a message",m)
                    if(m.message.type === 'choose') {
                        console.log("the other player has chosen",m.message.role)
                    }
                }),
                /*
                onConnect:(()=>{
                    state.mode = states.connected
                    state.pubnub.publish({
                        message:{
                            type:'choose',
                            role:'nav'
                        }
                    })
                }),
                 */
            })
        }


        this.events.phasers.added.forEach(ent => {
            const phaser = ent.getComponent(PhaserShotX)
            console.log("fired a phaser at ",phaser.target)
            //if phaser changed, send over the network
        })

        this.events.players.added.forEach(ent => {
            console.log("ent",ent)
            if(ent.hasComponent(NavConsolePlayer)) {
                console.log("chose navigation")
            }
            if(ent.hasComponent(WeaponsConsolePlayer)) {
                console.log("chose weapons")
            }
        })
    }
}