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

    @property(cc.Graphics)
    gra: cc.Graphics = null;

    @property(cc.Camera)
    camera: cc.Camera = null;
    
    currentMoveNode: Point = null;
    // LIFE-CYCLE CALLBACKS:
    circleNumber: number = 0;

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

        //测试角度变化
        var radio: cc.Vec2 = cc.v2(0,100);
        setTimeout(() => {
            this.draw(this.degreesToVectors(cc.v2(100,0),this.circleNumber*45));
        }, 500);

        
    }

    draw(radio: cc.Vec2) {
        this.gra.circle(radio.x,radio.y,10);
        this.gra.fillColor = cc.color(255,255,100,255);
        this.gra.fill();
        this.circleNumber++;
        if (this.circleNumber < 8) {
            setTimeout(() => {
                this.draw(this.degreesToVectors(cc.v2(100,0),this.circleNumber*45));
            }, 500);
        }
    }

    degreesToVectors(start: cc.Vec2,degree:number) {
        let radian = cc.misc.degreesToRadians(degree);
        let des = start.rotate(radian);
        cc.log(des,degree);
        cc.log(this.node.convertToWorldSpaceAR(des))
        return des;
    }

    start () {

    }

    // update (dt) {}
}
