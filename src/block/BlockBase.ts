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
    public mc: egret.MovieClip;
    public info: BlockInfo;
    public imgRes: string = "bear_png";
    public readonly type: number = BLOCK_TYPE.GREEN;
    public readonly borderRatio: number = 0.1;
    
    public constructor(info: BlockInfo) {
        // deduct border
        let borderSize = info.width * this.borderRatio;
        let x = info.col * info.width + borderSize;
        let y = info.row * info.height + borderSize;
        let width = info.width - (borderSize*2);
        let height = info.height - (borderSize*2);

        this.info = info;
        this.block = this.initBitmap(x, y, width, height);
    }

    // public functions

    public addTo(container: egret.DisplayObjectContainer) {
        container.addChild(this.block);
    }

    /**
     * Create bitmap by resource name
     */
    public createBitmapByName(name: string) {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
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

    public getRow(): number {
        return this.info.row;
    }

    public getCol() : number {
        return this.info.col;
    }

    public initBitmap(x, y, w, h) {
        let shp = this.createBitmapByName(this.getImgRes());
        shp.x = x;
        shp.y = y;
        shp.width = w;
        shp.height = h;
        
        return shp;
    }

    public initAnimation(x, y, w, h) {
        let data = RES.getRes("aaa_json");
        let txtr = RES.getRes("aaa_png");
        let mcFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory( data, txtr );
        let mcCreate: egret.MovieClip = new egret.MovieClip( mcFactory.generateMovieClipData( "MapIcon_People_Alarm" ) );
        // mcCreate.gotoAndPlay(0);
        mcCreate.x = x;
        mcCreate.y = y;
        mcCreate.width = w;
        mcCreate.height = h;
        this.mc = mcCreate;
    }
}
