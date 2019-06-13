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
    public imgRes: string = "frog_png";
    public readonly type: number = BLOCK_TYPE.GREY;
    constructor(info: BlockInfo) {
        super(info);
    }

    public getImgRes() {
        return "frog_png";
    }
}
