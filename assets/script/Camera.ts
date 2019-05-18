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

    @property(cc.Camera)
    camera: cc.Camera = null;

    // LIFE-CYCLE CALLBACKS:

    cameraStart: cc.Vec2 = cc.v2();
    mouseStart: cc.Vec2 = cc.v2();

    onLoad () {
        //场景放大缩小
        this.node.on('mousewheel',this.zoomWorld,this);
        //移动场景
        this.node.on('mousedown',this.startMoveWorld,this);
    }

    start () {

    }

    startMoveWorld(e: cc.Event.EventMouse) {
        cc.log(e);
        if (e.getButton() !== 2) {
            return;
        }
        this.node.on('mousemove',this.moveWorld,this);
        this.node.on('mouseup',this.endMoveWorld,this);
        this.cameraStart = cc.v2(this.camera.node.getPosition());
        this.mouseStart = e.getLocation();
    }

    moveWorld(e: cc.Event.EventMouse) {
        let current = e.getLocation();
        let move = this.cameraStart.add(this.mouseStart.sub(current).divSelf(this.camera.zoomRatio));
        this.camera.node.setPosition(move);
        // this.drawPoint(move);
    }

    endMoveWorld(e: cc.Event.EventMouse) {
        this.node.off('mousemove',this.moveWorld,this);
        this.node.off('mouseup',this.endMoveWorld,this);
        let gra = this.getComponent(cc.Graphics);
        gra.clear();   
    }

    zoomWorld(e: cc.Event.EventMouse) {
        if (e.getScrollY()>0) {
            let zoom = this.camera.zoomRatio-.1;
            if (zoom < .2) {
                zoom = .2;
            }
            this.camera.zoomRatio = zoom;

        } else {
            let zoom = this.camera.zoomRatio+.1;
            if (zoom > 1) {
                zoom = 1;
            }
            this.camera.zoomRatio = zoom;
        }
    }

    // update (dt) {}
}
