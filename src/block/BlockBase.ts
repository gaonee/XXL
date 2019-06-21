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
    public block: egret.Bitmap | egret.MovieClip;
    public info: BlockInfo;
    public type: number = BLOCK_TYPE.GREEN;
    public readonly borderRatio: number = 0.1;
    
    public constructor(info: BlockInfo) {
        this.info = info;
        this.initDisplay();
        this.setSize();
    }

    private initDisplay() {
        switch (this.info.effectType) {
            case EFFECT_TYPE.ROW_LINE:
            case EFFECT_TYPE.COL_LINE:
            case EFFECT_TYPE.BOMB:
            /*case EFFECT_TYPE.MAGIC_BIRD:*/ {
                this.block = this.drawSpecialEffect();
                break;
            }
            default: {
                this.block = this.drawNormal();
                break;
            }
        }
    }



    /**
     * 绘制普通状态
     */
    public drawNormal(): egret.Bitmap {
        return Util.createBitmapByName("bear_png");
    }

    /**
     * 绘制特效
     * @return MovieClip对象
     */
    public drawSpecialEffect(): egret.MovieClip {
        return Util.createMCByName("mcbear");
    }

    /**
     * 消除成功后，上方格子下落时调用
     * @param count 下落的格子数
     * @param callback 下落完成后执行
     */
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

    public getPoint(): Point {
        return {
            row: this.getRow(),
            col: this.getCol()
        }
    }

    public getSpecialEffect() {
        return this.info.effectType != undefined ? this.info.effectType : null;
    }

    public getType() {
        return this.type;
    }

    /**
     * 根据特定方向移动一个格子
     * @param dir 移动方向
     * @param callback 移动完成后回调
     * @param waitTime 延时多长时间之后执行移动操作
     */
    public move(dir:number, callback?:Function, waitTime?:number) {
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

    public setSize() {
        let borderSize = this.info.width * this.borderRatio;

        this.block.x = this.info.col * this.info.width + borderSize;
        this.block.y = this.info.row * this.info.height + borderSize;
        this.block.width = this.info.width - (borderSize*2);
        this.block.height = this.info.height - (borderSize*2);
    }

    public show(container: egret.DisplayObjectContainer) {
        container.addChild(this.block);
        if (this.info.effectType != undefined && this.block instanceof egret.MovieClip) {
            switch (this.info.effectType) {
                case EFFECT_TYPE.ROW_LINE: {
                    this.block.gotoAndPlay("rowline", -1);
                    break;
                }
                case EFFECT_TYPE.COL_LINE: {
                    this.block.gotoAndPlay("colline", -1);
                    break;
                }
                case EFFECT_TYPE.BOMB: {
                    this.block.gotoAndPlay("bomb", -1);
                    break;
                }
                case EFFECT_TYPE.MAGIC_BIRD: {
                    this.block.gotoAndPlay("magicbird", -1);
                    break;
                }
                default: {
                    break;
                }
            }
        }
    }
}
