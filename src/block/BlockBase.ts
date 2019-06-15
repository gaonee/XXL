//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  Declare base infomation of block,such as position,size,color.
//
//////////////////////////////////////////////////////////////////////////////////////

class BlockBase {
    public block: egret.DisplayObject;
    public info: BlockInfo;
    public imgRes: string = "bear_png";
    public type: number = BLOCK_TYPE.GREEN;
    public readonly borderRatio: number = 0.1;
    
    public constructor(info: BlockInfo) {
        this.info = info;
        this.draw();
        this.setSize();
    }

    // public functions

    public addTo(container: egret.DisplayObjectContainer) {
        container.addChild(this.block);
    }

    public change(dir:number, callback?:Function, waitTime?:number) {
        let props = null;

        switch(dir) {
            case MOVE_DIRECTION.LEFT: {
                props = {x: this.block.x - this.info.width};
                this.info.col -= 1;
                break;
            }
            case MOVE_DIRECTION.RIGHT: {
                props = {x: this.block.x + this.info.width};
                this.info.col += 1;
                break;
            }
            case MOVE_DIRECTION.TOP: {
                props = {y: this.block.y - this.info.height};
                this.info.row -= 1;
                break;
            }
            case MOVE_DIRECTION.BOTTOM: {
                props = {y: this.block.y + this.info.height};
                this.info.row += 1;
                break;
            }
            default: {
                console.warn("Invalid direction.")
                break;
            }
        }

        if (props != null) {
            let tw = egret.Tween.get(this.block);
            if (waitTime) {
                tw.wait(waitTime);
            }
            tw.to(props, 100, egret.Ease.quadInOut).call(() => {
                egret.Tween.removeTweens(tw);
                if (callback) {
                    callback();
                }
            });
        }
    }

    public draw() {
        this.block = Util.createBitmapByName(this.getImgRes());
    }

    public drop(count: number, callback?: Function) {
        let tw = egret.Tween.get(this.block);
        tw.wait(100).to({
            y: this.block.y + this.info.height*count
        }, 200, egret.Ease.quartIn).call(() => {
            this.info.row += count;
            egret.Tween.removeTweens(tw);
            if (callback) {
                callback();
            }
        });
    }

    public getBgImg() {}

    public getImgRes() {
        return "bear_png";
    }

    public getObject(): egret.DisplayObject {
        return this.block;
    }

    public getBlockInfo(): BlockInfo {
        return this.info;
    }

    public getRow(): number {
        return this.info.row;
    }

    public getCol() : number {
        return this.info.col;
    }

    public setSize() {
        let borderSize = this.info.width * this.borderRatio;

        this.block.x = this.info.col * this.info.width + borderSize;
        this.block.y = this.info.row * this.info.height + borderSize;
        this.block.width = this.info.width - (borderSize*2);
        this.block.height = this.info.height - (borderSize*2);
    }

    public setType(type: BLOCK_TYPE) {
        this.type = type;
    }
}
