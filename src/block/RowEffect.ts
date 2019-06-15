//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  横向的直线特效.
//
//////////////////////////////////////////////////////////////////////////////////////

class RowEffect extends BlockBase {
    public block: egret.MovieClip;
    constructor(info: BlockInfo) {
        super(info);
        this.setType(info.type);
    }

    public draw() {
        this.block = Util.createMCByName("mcbear");
    }

    public play() {
        this.block.gotoAndPlay("lateral", -1);
    }
}