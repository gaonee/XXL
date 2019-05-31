//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  blue block.
//
//////////////////////////////////////////////////////////////////////////////////////

class BlockBlue extends BlockBase {
    public readonly type: number = BLOCK_TYPE.BLUE;
    constructor(info: BlockInfo) {
        super(info);
    }

    public initBlock(x, y, w, h): egret.DisplayObject {
        var shp: egret.Shape = new egret.Shape();
        shp.graphics.beginFill( 0x0000ff );
        shp.graphics.drawRect( x, y, w, h );
        shp.graphics.endFill();
        
        return shp;
    }
}
