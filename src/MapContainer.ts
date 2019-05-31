//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  container of BlockMap
//
//////////////////////////////////////////////////////////////////////////////////////

class MapContainer extends egret.DisplayObjectContainer {
    constructor(left: number, top: number, width: number, height: number) {
        super();
        this.x = left;
        this.y = top;
        this.width = width;
        this.height = height;
        this.touchEnabled = true;
        // 增加遮罩，超出mapView区域不显示
        this.mask = new egret.Rectangle(0, 0, width, height);
    }
}
