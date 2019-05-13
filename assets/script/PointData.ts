import Point from './Point';
import PointRect from './PointRect';

let allPointList: Object = {};

let allNodeList: Object = {};

let dynamicPointList: Array<Point> = [];
let dynamicNodeList: Array<PointRect> = [];

/**
 * 添加一个节点
 * @param po Point
 */
export function addPoint(po: Point,staticPoint: boolean = false) {
    allPointList[po.name] = po;
    if (!staticPoint) {
        dynamicPointList.push(po);
    }
}
/**
 * 添加一个连接块
 * @param rect PointRect
 */
export function addRectNode(rect: PointRect) {
    allNodeList[rect.name] = rect;
    dynamicNodeList.push(rect);
}

/**
 * 使用名称查找一个节点
 * @param name string
 */
export function FindPoint(name: string) {
    if (allPointList[name]) {
        return allPointList[name];
    } else {
        return null;
    }
}

/**
 * 使用名称查找一个连接块
 * @param name string
 */
export function FindRect(name: string) {
    if (allNodeList[name]) {
        return allNodeList[name];
    } else {
        return null;
    }
}
/**
 * 使所有静态的节点活动起来
 */
export function ApplyDynamic() {
    dynamicNodeList.forEach((rect:PointRect)=>{
        rect.setDynamic();
    });
    dynamicPointList.forEach((po:Point)=>{
        po.setDynamic();
    });
}