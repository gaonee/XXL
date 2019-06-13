//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  red block.
//
//////////////////////////////////////////////////////////////////////////////////////

class BlockRed extends BlockBase {
    public imgRes: string = "owl_png";
    public readonly type: number = BLOCK_TYPE.RED;
    constructor(info: BlockInfo) {
        super(info);
    }

    public getImgRes() {
        return "owl_png";
    }
}
