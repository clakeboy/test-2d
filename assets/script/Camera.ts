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
    centerPoint: cc.Vec2 = cc.v2(cc.winSize.width/2,cc.winSize.height/2);

    onLoad () {
        //场景放大缩小
        this.node.on('mousewheel',this.zoomWorld,this);
        //移动场景
        this.node.on('mousedown',this.startMoveWorld,this);
    }

    start () {

    }

    startMoveWorld(e: cc.Event.EventMouse) {
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
        let outMat4 = new cc.Mat4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        this.camera.getWorldToCameraMatrix(outMat4)
        cc.log(outMat4);
        cc.log(this.node.width,this.node.width*outMat4['m00'],this.node.width*outMat4['m00']+outMat4['m12'])
    }

    zoomWorld(e: cc.Event.EventMouse) {
        let isZoom = e.getScrollY()>0;
        let zoom = isZoom?this.camera.zoomRatio-.1:this.camera.zoomRatio+.1;
        if (zoom < .2) {
            zoom = .2;
        } else if (zoom > 1) {
            zoom = 1;
        }
        cc.log(zoom,this.camera.zoomRatio);
        if (zoom.toFixed(1) === this.camera.zoomRatio.toFixed(1)) {
            return;
        }
        let center = this.camera.node.convertToNodeSpace(e.getLocation());
        cc.log(center);
        this.camera.node.setAnchorPoint(center.normalizeSelf());
        this.camera.zoomRatio = zoom;
        let outMat4 = new cc.Mat4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        this.camera.getWorldToCameraMatrix(outMat4)
        let diff = cc.v2(outMat4['m12'],outMat4['m13'])
        let position = this.camera.node.getPosition();
        
        //设置缩放中心点位移
        // let mouse = e.getLocation();
        // let height: number = this.centerPoint.sub(mouse).mag();
        // let centerVec: cc.Vec2 = this.centerPoint.sub(mouse).
        //     normalizeSelf().scaleSelf(cc.v2(height*.1,height*.1)).addSelf(mouse);
        
        // if (isZoom) {
        //     position.subSelf(mouse.sub(centerVec).divSelf(this.camera.zoomRatio));
        //     this.centerPoint.subSelf(mouse.sub(centerVec).divSelf(this.camera.zoomRatio))
        //     diff.addSelf(mouse.sub(centerVec));
        // } else {
        //     position.addSelf(mouse.sub(centerVec).divSelf(this.camera.zoomRatio));
        //     this.centerPoint.addSelf(mouse.sub(centerVec).divSelf(this.camera.zoomRatio))
        //     diff.subSelf(mouse.sub(centerVec));
        // }
        
        //超过左边,回退到左边对齐
        if (diff.x>0) {
            position.x += diff.x/outMat4['m00'];
            this.centerPoint.x += diff.x/outMat4['m00'];
        }
        //超过右边,回退到右边对齐
        if (this.node.width*outMat4['m00']+diff.x < cc.winSize.width) {
            let di = (cc.winSize.width - (this.node.width*outMat4['m00']+diff.x))/outMat4['m00'];
            position.x -= di;
            this.centerPoint.x -= di;
        }
        //超过底边,回退到底边对齐
        if (diff.y>0) {
            position.y += diff.y/outMat4['m00'];
            this.centerPoint.y += diff.y/outMat4['m00'];
        }
        //超过顶边,回退到顶边对齐
        if (this.node.height*outMat4['m00']+diff.y < cc.winSize.height) {
            let di = (cc.winSize.height - (this.node.height*outMat4['m00']+diff.y))/outMat4['m00'];
            position.y -= di;
            this.centerPoint.y -= di;
        }

        this.camera.node.setPosition(position)
        
        // cc.log(this.camera.getWorldToCameraPoint(e.getLocation()))
    }

    // update (dt) {}
}
