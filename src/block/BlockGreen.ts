//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  green block.
//
//////////////////////////////////////////////////////////////////////////////////////

class BlockGreen extends BlockBase {
    public imgRes: string = "fox_png";
    public readonly type: number = BLOCK_TYPE.GREEN;
    constructor(info: BlockInfo) {
        super(info);
    }

    public getImgRes() {
        return "fox_png";
    }
}
