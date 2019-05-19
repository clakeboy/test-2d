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
        cc.log(this.camera.node.getPosition());
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
        let afterOutMat4 = new cc.Mat4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        this.camera.getWorldToCameraMatrix(afterOutMat4);
        let afterDiff = cc.v2(afterOutMat4['m12'],afterOutMat4['m13']);
        // let afterMouse = e.getLocation().subSelf(afterDiff);
        // cc.log(afterMouse);
        // let afterPo = this.camera.getWorldToCameraPoint(cc.v2(cc.winSize.width/2,cc.winSize.height/2))
        // cc.log(afterPo);
        // cc.log(afterDiff);
        let afterZoom = this.camera.zoomRatio;
        let isZoom = e.getScrollY()>0;
        if (isZoom) {
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

        let outMat4 = new cc.Mat4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        this.camera.getWorldToCameraMatrix(outMat4)
        let diff = cc.v2(outMat4['m12'],outMat4['m13'])
        let position = this.camera.node.getPosition();
        // let currentMouse = e.getLocation().subSelf(diff);
        // cc.log(currentMouse)
        // let currentPo = this.camera.getWorldToCameraPoint(cc.v2(cc.winSize.width/2,cc.winSize.height/2))
        // cc.log(currentPo);
        let mouse = e.getLocation();
        let center = cc.v2(cc.winSize.width/2,cc.winSize.height/2);
        let height: number = center.sub(mouse).mag();
        let centerVec: cc.Vec2 = center.sub(mouse).
            normalizeSelf().scaleSelf(cc.v2(height*.1,height*.1)).addSelf(mouse);
        cc.log(centerVec);
        cc.log(mouse.sub(centerVec))
        let gra = this.getComponent(cc.Graphics);
        gra.circle(centerVec.x,centerVec.y,1);
        gra.fillColor = cc.Color.RED;
        gra.fill();
        //设置缩放中心点位移
        let w = this.node.width*afterZoom;
        // let h = this.node.height*afterZoom;
        let currentW = this.node.width*this.camera.zoomRatio;
        // let currentH = this.node.height*this.camera.zoomRatio;

        // let movex = (currentMouse.x - afterMouse.x) / w * (currentW-w);
        // let movey = (currentMouse.y - afterMouse.y) / h * (currentH-h);
        
        // cc.log(afterMouse.sub(currentMouse));
        // cc.log(movex,movey);
        // cc.log(diff.sub(afterDiff));
        // cc.log(diff);
        cc.log(mouse.sub(centerVec).divSelf(currentW/w));
        cc.log(currentW/w,this.camera.zoomRatio)
        if (isZoom) {
            position.subSelf(mouse.sub(centerVec).divSelf(this.camera.zoomRatio));
        }
        else {
            position.addSelf(mouse.sub(centerVec).divSelf(afterZoom));
        }
        // //超过左边,回退到左边对齐
        // if (diff.x>0) {
        //     position.x += diff.x/outMat4['m00'];
        // }
        // //超过右边,回退到右边对齐
        // if (this.node.width*outMat4['m00']+diff.x < cc.winSize.width) {
        //     position.x -= (cc.winSize.width - (this.node.width*outMat4['m00']+diff.x))/outMat4['m00'];
        // }

        // //超过底边,回退到底边对齐
        // if (diff.y>0) {
        //     position.y += diff.y/outMat4['m00'];
        // }
        // //超过顶边,回退到顶边对齐
        // if (this.node.height*outMat4['m00']+diff.y < cc.winSize.height) {
        //     position.y -= (cc.winSize.height - (this.node.height*outMat4['m00']+diff.y))/outMat4['m00'];
        // }

        this.camera.node.setPosition(position)
        cc.log(position);
        // cc.log(this.camera.getWorldToCameraPoint(e.getLocation()))
    }

    // update (dt) {}
}
