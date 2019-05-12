// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import PointRect from './PointRect';

// const {ccclass, property} = cc._decorator;
// @ccclass
export default class Point extends cc.Component {

    _body: cc.RigidBody = null;

    _spr: cc.Sprite = null;

    _coll: cc.PhysicsCircleCollider = null;

    currentMoveNode: Point = null;
    currentRect: PointRect = null;
    graphics: cc.Graphics = null;
    _index: number = 0;
    addHandler: Function = null;

    constructor(name?:string,index:number = 0) {
        super();
        let radius: number = 20;
        this.name = name || index+'';
        this._index = index;
        this.node = new cc.Node(name);
        this.node.setContentSize(radius*2,radius*2);
        this.node.color = cc.color(255,255,255,255);
        this.graphics = this.addComponent(cc.Graphics);
        this.graphics.fillColor = cc.Color.ORANGE;
        this.graphics.circle(this.node.anchorX,this.node.anchorY,radius);
        this.graphics.fill();
        this.graphics.moveTo(this.node.anchorX,this.node.anchorY);
        this.graphics.lineTo(this.node.anchorX+radius,this.node.anchorY);
        this.graphics.strokeColor = cc.Color.RED;
        this.graphics.stroke()
        // this._spr = this.addComponent(cc.Sprite);
        this._body = this.addComponent(cc.RigidBody);
        this._body.type = cc.RigidBodyType.Kinematic;
        this._body.enabledContactListener = true;
        this._body.allowSleep = false;
        this._coll = this.addComponent(cc.PhysicsCircleCollider);
        this._coll.sensor = true;
        this._coll.radius = radius;
        this.addEvent();
    }

    onAdd(func: Function) {
        this.addHandler = func;
    }

    addEvent () {
        this.node.on('mousedown',(e:cc.Event.EventMouse)=>{
            if (e.getButton() !== 0) return;
            let po: Point = new Point(`${this.name}_${this._index+1}`,this._index+1);
            po.node.setPosition(e.getLocation());
            this.currentMoveNode = po;
            this.node.parent.addChild(po.node);

            let rect: PointRect = new PointRect();
            rect.node.setPosition(e.getLocation());
            this.node.parent.addChild(rect.node);
            this.currentRect = rect;

            this.node.parent.on('mousemove',this.nodeMove,this);
            this.node.parent.on('mouseup',this.nodeEnd,this);
        });

        //
        this._body.onBeginContact = (phyCon:cc.PhysicsContact,self:cc.PhysicsCollider,other:cc.PhysicsCollider)=>{
            if (other instanceof cc.PhysicsCircleCollider) {
                cc.log(other.node.name);
                cc.log(other.node.getComponent(Point));
            }
        };
    }

    setDynamic() {
        this._body.type = cc.RigidBodyType.Dynamic;
        this._coll.sensor = false;
        this._coll.apply();
    }

    done() {
        this._body.allowSleep = true;
        this._body.onBeginContact = null;
    }

    nodeMove(e:cc.Event.EventMouse) {
        let v1: cc.Vec2 = e.getLocation();
        let v2: cc.Vec2 = cc.v2(this.node.getPosition());
        let height: number = v1.sub(v2).mag();
        //取得两个向量的角度
        let radian: number = cc.misc.radiansToDegrees(v2.sub(v1).signAngle(cc.v2(0,1)));
        // cc.log(radian);
        let size: cc.Size = this.currentRect.node.getContentSize();
        size.height = height;
        this.currentRect.setSize(size);
        this.currentRect.node.angle = -radian;
        //取得两个向量的中心向量
        let centerVec: cc.Vec2 = v2.sub(v1).normalizeSelf().scaleSelf(cc.v2(height/2,height/2)).addSelf(v1);
        this.currentRect.node.setPosition(centerVec);
        this.currentMoveNode.node.setPosition(v1);
    }

    nodeEnd() {
        this.node.parent.off('mousemove',this.nodeMove,this);
        this.node.parent.off('mouseup',this.nodeEnd,this);
        this.currentRect._hook1.connectedBody = this._body;
        this.currentRect._hook2.connectedBody = this.currentMoveNode._body;
        this.currentRect.done()
        this.currentMoveNode.done();
        if (this.addHandler) {
            this.addHandler(this.currentRect,this.currentMoveNode);
        }
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    // start () {

    // }

    // update (dt) {}
}
