// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

// const {ccclass, property} = cc._decorator;

// @ccclass
import Point from './Point';

export default class PointRect extends cc.Component {
    _body: cc.RigidBody = null;

    _spr: cc.Sprite = null;

    _coll: cc.PhysicsBoxCollider = null;

    _hook1: cc.WeldJoint = null;

    _hook2: cc.WeldJoint = null;

    graphics: cc.Graphics = null;

    leftPoint: Point = null;
    RightPoint: Point = null;

    width:number = 10;

    constructor() {
        super();
        this.node = new cc.Node();
        this.node.setContentSize(this.width,1);
        this.node.color = cc.color(255,255,255,255);
        this.node.group = 'wall';

        this.graphics = this.addComponent(cc.Graphics);

        // this._spr = this.addComponent(cc.Sprite);
        this._body = this.addComponent(cc.RigidBody);
        this._body.type = cc.RigidBodyType.Kinematic;

        this._coll = this.addComponent(cc.PhysicsBoxCollider);
        this._coll.sensor = true;
        this._coll.size = cc.size(this.width,1);

        this._hook1 = this.addComponent(cc.WeldJoint);
        this._hook1.frequency = 0;
        this._hook1[0] = 0;
        this._hook1.collideConnected = false;

        this._hook2 = this.addComponent(cc.WeldJoint);
        this._hook2.frequency = 0;
        this._hook2[0] = 0;
        this._hook2.collideConnected = false;
    }

    setSize(size: cc.Size) {
        this.node.setContentSize(size);
        this._hook1.anchor = cc.v2(0,size.height/2);
        this._hook2.anchor = cc.v2(0,-size.height/2);
        // this._hook1.distance = distance;
        // this._hook2.distance = distance;
        this.graphics.clear();
        this.graphics.circle(this._hook1.anchor.x,this._hook1.anchor.y,5);
        this.graphics.fillColor = cc.Color.RED;
        this.graphics.fill();
        this.graphics.circle(this._hook2.anchor.x,this._hook2.anchor.y,5);
        this.graphics.fillColor = cc.Color.YELLOW;
        this.graphics.fill();

        this.graphics.moveTo(this._hook1.anchor.x,this._hook1.anchor.y);
        this.graphics.lineTo(this._hook2.anchor.x,this._hook2.anchor.y);
        this.graphics.strokeColor = cc.Color.YELLOW;
        this.graphics.stroke();
    }

    done() {
        this._hook1.apply();
        this._hook2.apply();
    }

    setDynamic() {
        this._body.type = cc.RigidBodyType.Dynamic;
        this._coll.size = this.node.getContentSize();
        this._coll.sensor = false;
        this._coll.apply();
    }
}
