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
    public imgRes: string = "chick_png";
    public readonly type: number = BLOCK_TYPE.BLUE;
    constructor(info: BlockInfo) {
        super(info);
    }

    public getImgRes() {
        return "chick_png";
    }
}
