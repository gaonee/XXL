//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  black block.
//
//////////////////////////////////////////////////////////////////////////////////////

class BlockBlack extends BlockBase {
    public readonly type: number = BLOCK_TYPE.BLACK;
    constructor(info: BlockInfo) {
        super(info);
    }

    /*
    * 绘制普通状态
    **/
    public drawNormal(): egret.Bitmap {
        return Util.createBitmapByName("bear_png");
    }

    /*
    * 绘制特效
    **/
    public drawSpecialEffect(): egret.MovieClip {
        return Util.createMCByName("mcbear");
    }
}
