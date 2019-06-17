//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  grey block.
//
//////////////////////////////////////////////////////////////////////////////////////

class BlockGrey extends BlockBase {
    public readonly type: number = BLOCK_TYPE.GREY;
    constructor(info: BlockInfo) {
        super(info);
    }

    /*
    * 绘制普通状态
    **/
    public drawNormal(): egret.Bitmap {
        return Util.createBitmapByName("frog_png");
    }

    /*
    * 绘制特效
    **/
    public drawSpecialEffect(): egret.MovieClip {
        return Util.createMCByName("mcfrog");
    }
}
