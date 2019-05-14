// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

import Point from "./Point";
import * as PoData from './PointData';

@ccclass
export default class GamePoint extends cc.Component {
    @property(cc.Node)
    phy: cc.Node = null;

    @property(cc.Prefab)
    circle: cc.Prefab = null;
    
    currentMoveNode: Point = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_jointBit |
            cc.PhysicsManager.DrawBits.e_shapeBit;

        let point: Point = new Point('root');
        point.node.setPosition(cc.v2(480,600));
        this.phy.addChild(point.node);
        point.done();
        PoData.addPoint(point,true);

        this.node.on('mousedown',(e: cc.Event.EventMouse)=>{
            e.stopPropagation();
            let node = cc.instantiate(this.circle);
            node.group = 'ball';
            node.parent = this.phy;
            node.setPosition(e.getLocation())
        })
    }

    start () {

    }

    // update (dt) {}
}
