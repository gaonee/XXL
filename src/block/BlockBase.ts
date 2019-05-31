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
    public readonly type: number = BLOCK_TYPE.GREEN;
    public readonly border: number = 2;
    
    public constructor(info: BlockInfo) {
        // deduct border
        let x = info.col * info.width + this.border;
        let y = info.row * info.height + this.border;
        let width = info.width - (this.border*2);
        let height = info.height - (this.border*2);

        this.info = info;
        this.block = this.initBlock(x, y, width, height);
    }

    // public functions

    public addTo(container: egret.DisplayObjectContainer) {
        container.addChild(this.block);
    }

    public getObject(): egret.DisplayObject {
        return this.block;
    }

    public getRow(): number {
        return this.info.row;
    }

    public getCol() : number {
        return this.info.col;
    }

    public initBlock(x, y, w, h): egret.DisplayObject {
        var shp: egret.Shape = new egret.Shape();
        shp.graphics.beginFill( 0x00ff00 );
        shp.graphics.drawRect( x, y, w, h );
        shp.graphics.endFill();
        
        return shp;
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

    public drop(count: number, callback?: Function) {
        let tw = egret.Tween.get(this.block);
        tw.wait(100).to({
            y: this.block.y + this.info.height*count
        }, 150, egret.Ease.quadInOut).call(() => {
            this.info.row += count;
            egret.Tween.removeTweens(tw);
            if (callback) {
                callback();
            }
        });
    }
}
