//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  magic bird.
//
//////////////////////////////////////////////////////////////////////////////////////

class MagicBird extends BlockBase {
    public readonly type: number = BLOCK_TYPE.MAGIC_BIRD;
    constructor(info: BlockInfo) {
        super(info);
    }

    /*
    * 绘制普通状态
    **/
    public drawNormal(): egret.Bitmap {
        return Util.createBitmapByName("magicbird_png");
    }
}
