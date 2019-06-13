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

    public getImgRes() {
        return "bear_png";
    }
}
