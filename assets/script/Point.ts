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
import * as PoData from './PointData';

// const {ccclass, property} = cc._decorator;

// @ccclass
export default class Point extends cc.Component {

    _body: cc.RigidBody = null;

    _spr: cc.Sprite = null;

    _coll: cc.PhysicsCircleCollider = null;

    _index: number = 0;

    currentMoveNode: Point = null;
    currentRect: PointRect = null;
    //需要连接的点
    contactPoint: Point = null;

    graphics: cc.Graphics = null;
    addHandler: Function = null;
    //父节点
    _parent: Point = null;
    //所有子节点
    childList: Array<Point> = [];
    //所有连接节点
    contactList: Array<PointRect> = [];
    //点大小
    radius: number = 10;

    constructor(name:string,index:number = 0,parent?: Point) {
        super();
        this.name = name || index+'';
        this._index = index;
        this._parent = parent;

        this.node = new cc.Node(name);
        this.node.setContentSize(this.radius*2,this.radius*2);
        this.node.color = cc.color(255,255,255,255);
        
        // this._spr = this.addComponent(cc.Sprite);
        //钢体
        this._body = this.addComponent(cc.RigidBody);
        this._body.type = cc.RigidBodyType.Kinematic;
        this._body.enabledContactListener = true;
        this._body.allowSleep = false;
        this._body.awakeOnLoad = true;
        this._body.gravityScale = 100;
        //碰撞体
        this._coll = this.addComponent(cc.PhysicsCircleCollider);
        this._coll.sensor = true;
        this._coll.radius = this.radius;

        this.draw();
        this.addEvent();
    }

    draw() {
        this.graphics = this.addComponent(cc.Graphics);
        this.graphics.fillColor = cc.Color.ORANGE;
        this.graphics.circle(this.node.anchorX,this.node.anchorY,this.radius);
        this.graphics.fill();
        this.graphics.moveTo(this.node.anchorX,this.node.anchorY);
        this.graphics.lineTo(this.node.anchorX+this.radius,this.node.anchorY);
        this.graphics.strokeColor = cc.Color.RED;
        this.graphics.stroke()
    }

    addEvent () {
        this.node.on('mousedown',(e:cc.Event.EventMouse)=>{
            if (e.getButton() !== 0) return;
            e.stopPropagation();
            let po: Point = new Point(`${this.name}_${this.childList.length+1}`,this.childList.length+1,this);
            po.node.setPosition(e.getLocation());
            this.currentMoveNode = po;
            this.node.parent.addChild(po.node);

            let rect: PointRect = new PointRect();
            rect.node.setPosition(e.getLocation());
            this.node.parent.addChild(rect.node);
            this.currentRect = rect;

            this.node.parent.on('mousemove',this.nodeMove);
            this.node.parent.on('mouseup',this.nodeEnd);
        });

        //
        this._body.onBeginContact = (phyCon:cc.PhysicsContact,self:cc.PhysicsCollider,other:cc.PhysicsCollider)=>{
            if (other instanceof cc.PhysicsCircleCollider) {
                let po: Point = PoData.FindPoint(other.node.name);
                if (!po) return;
                if (this._parent.checkContact(po.name)) {
                    po.setFucos(true);
                    this.contactPoint = po;
                    cc.log(this.contactPoint);
                    cc.log(this);
                }
            }
        };

        this._body.onEndContact = (phyCon:cc.PhysicsContact,self:cc.PhysicsCollider,other:cc.PhysicsCollider)=>{
            if (other instanceof cc.PhysicsCircleCollider) {
                let po: Point = PoData.FindPoint(other.node.name);
                if (!po) return;
                po.setFucos(false);
                this.contactPoint = null;
            }
        };
    }

    setFucos(flag: boolean) {
        this.graphics.fillColor = flag?cc.Color.GREEN:cc.Color.ORANGE;
        this.graphics.circle(this.node.anchorX,this.node.anchorY,this.radius);
        this.graphics.fill();
    }

    setDynamic() {
        this._body.type = cc.RigidBodyType.Dynamic;
        this._coll.sensor = false;
        this._coll.apply();
    }

    setStatic() {
        this._body.type = cc.RigidBodyType.Static;
        this._coll.sensor = false;
        this._coll.apply();
    }

    done() {
        this._body.allowSleep = true;
        this._body.onBeginContact = null;
    }
    //检查节点是否可以和节点连接
    checkContact(name:string) {
        if (this.name === name) return false;
        if (this._parent && this._parent.name === name) return false;
        if (this.childList.some((item:Point)=>{
            return item.name === name;
        })) return false;
        return true;
    }

    nodeMove = (e:cc.Event.EventMouse) => {
        let v1: cc.Vec2 = e.getLocation();
        let v2: cc.Vec2 = cc.v2(this.node.getPosition());
        this.calculateRect(v1,v2);
    }

    calculateRect(v1: cc.Vec2,v2: cc.Vec2) {
        let height: number = v1.sub(v2).mag();
        //取得两个向量的角度
        let radian: number = cc.misc.radiansToDegrees(v2.sub(v1).signAngle(cc.v2(0,1)));
        
        // cc.log(radian);
        let size: cc.Size = this.currentRect.node.getContentSize();
        size.height = height;
        this.currentRect.setSize(size);
        this.currentRect.node.angle = -radian;
        this.currentRect._hook1.referenceAngle = -radian;
        this.currentRect._hook2.referenceAngle = -radian;
        //取得两个向量的中心向量
        let centerVec: cc.Vec2 = v2.sub(v1).normalizeSelf().scaleSelf(cc.v2(height/2,height/2)).addSelf(v1);
        this.currentRect.node.setPosition(centerVec);
        this.currentMoveNode.node.setPosition(v1);
    }

    nodeEnd = () => {
        this.node.parent.off('mousemove',this.nodeMove);
        this.node.parent.off('mouseup',this.nodeEnd);
        //添加原始连接点到连接块
        this.currentRect._hook1.connectedBody = this._body;
        // this.currentRect.node.convertToWorldSpace(this.currentRect._hook1.anchor);
        this.currentRect.leftPoint = this;
        
        this.contactList.push(this.currentRect);
        PoData.addRectNode(this.currentRect);
        //添加对像连接点到连接块
        if (this.currentMoveNode.contactPoint !== null) {
            this.currentRect._hook2.connectedBody = this.currentMoveNode.contactPoint._body;
            this.currentRect.RightPoint = this.currentMoveNode.contactPoint;
            this.currentMoveNode.node.destroy();
            this.calculateRect(cc.v2(this.currentRect.RightPoint.node.getPosition()),cc.v2(this.node.getPosition()));
            PoData.ApplyDynamic();
        } else {
            this.currentRect._hook2.connectedBody = this.currentMoveNode._body;
            this.currentRect.RightPoint = this.currentMoveNode;
            this.childList.push(this.currentMoveNode);
            PoData.addPoint(this.currentMoveNode);
            this.currentMoveNode.done();
        }
        this.currentRect.done()
        // PoData.ApplyDynamic();
    }
}
