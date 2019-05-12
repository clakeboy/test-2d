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

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Sprite)
    old: cc.Sprite = null;

    @property(cc.Node)
    move: cc.Node = null;

    @property(cc.Node)
    world: cc.Node = null;

    /**
     * 主世界原点
     */
    @property(cc.Node)
    startPoint: cc.Node = null;

    @property
    text: string = 'hello';

    circleList: Array<cc.Sprite> = [];

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
            cc.PhysicsManager.DrawBits.e_jointBit |
            cc.PhysicsManager.DrawBits.e_shapeBit
            ;

        this.old.node.on('mousedown',this.startMove);
        // this.node.getComponent()
        setTimeout(this.addCircle.bind(this),100);
    }

    onDestroy() {
        this.old.node.off('mousedown',this.startMove);
    }

    start () {

    }

    addCircle() {
        if (this.circleList.length < 5) {
            let node:cc.Node = new cc.Node;
            node.setPosition(cc.v2(100+this.circleList.length,100));
            node.on('mousedown',this.startMove);
            node.setContentSize(50,50);

            let spr:cc.Sprite = node.addComponent(cc.Sprite);
            let rigidBody:cc.RigidBody = spr.addComponent(cc.RigidBody);
            let circleColl:cc.PhysicsCircleCollider = rigidBody.addComponent(cc.PhysicsCircleCollider);
            circleColl.radius = 30;
            circleColl.restitution = .5;
            
            this.world.addChild(node);
            this.circleList.push(spr);
            setTimeout(this.addCircle.bind(this),500);
        }
    }

    startMove = (e:cc.Event.EventMouse)=>{
        let rigidBody: cc.RigidBody = e.currentTarget.getComponent(cc.RigidBody);
        // rigidBody.awake = true;
        // rigidBody.type = cc.RigidBodyType.Static;
        let xy: cc.Vec2 = cc.v2(e.getLocationX(),e.getLocationY());
        this.move.setPosition(xy);
        let join: cc.DistanceJoint = this.move.addComponent(cc.DistanceJoint);
        join.connectedBody = rigidBody;
        join.frequency = 3 ;
        join.connectedAnchor = rigidBody.getLocalPoint(xy);
        rigidBody.awake = true;
        this.node.on('mousemove',this.bodyMove);
        this.node.on('mouseup',this.bodyEnd);
        // let bodyXy: cc.Vec2 = null;
        // rigidBody.getLocalVector(xy,bodyXy);
        // cc.log(rigidBody.getLocalPoint(xy),rigidBody.getLocalCenter());
    }

    bodyMove = (e:cc.Event.EventMouse)=>{
        // cc.log(e._x,e._y);
        this.move.setPosition(e.getLocationX(),e.getLocationY());
    }

    bodyEnd = ()=>{
        this.node.off('mousemove',this.bodyMove);
        this.node.off('mouseup',this.bodyEnd);
        // let rigidBody: cc.RigidBody = this.old.getComponent(cc.RigidBody);
        // rigidBody.awake = true;
        // rigidBody.type = cc.RigidBodyType.Dynamic;
        let join: cc.DistanceJoint = this.move.getComponent(cc.DistanceJoint);
        join.destroy();
    }

    // update (dt) {}
}
