//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  move control.
//
//////////////////////////////////////////////////////////////////////////////////////

class Control {
    private container: egret.DisplayObjectContainer;
    private map: BlockMap = null;
    private eliminateCheck: EliminateCheck = null;
    private deadMapCheck: DeadMapCheck = null;
    private size: number = 0;
    private touchX: number = 0;
    private touchY: number = 0;
    private status: number = BLOCK_STATUS.READY;
    private readonly row: number = 9;
    private readonly column: number = 9;
    // 一次touchBegin只能执行一次交换动作，后面的滑动会屏蔽
    private swapFlag: boolean = true;

    constructor(container: egret.DisplayObjectContainer) {
        this.container = container;
        this.size = this.container.width / 9;
        this.map = new BlockMap(container, this.row, this.column, this.size);
        this.eliminateCheck = new EliminateCheck();
        this.deadMapCheck = new DeadMapCheck();

        this.initMap();
    }

    // event process
    private bindEvent() {
        this.container.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
        this.container.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
        this.container.addEventListener(egret.TouchEvent.TOUCH_CANCEL, this.onTouchEnd, this);
        this.container.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchEnd, this);
        this.container.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
    }

    private onTouchBegin(evt: egret.TouchEvent) {
        if (this.status != BLOCK_STATUS.READY) {
            Log.warn("onTouchBegin, current status is not READY, it's " + this.status);
            return;
        }
        let touchCol = Math.floor(evt.localX / this.size);
        let touchRow = Math.floor(evt.localY / this.size);
        let block = this.map.get(touchRow, touchCol);
        Log.debug("onTouchBegin, touch block, row = " + (touchRow+1) + ", col = " + (touchCol+1));
        if (block != null) {
            // rising block,so that it will be render on the top.
            this.map.risingTop(touchRow, touchCol);
            this.touchX = evt.localX;
            this.touchY = evt.localY;
            this.status = BLOCK_STATUS.CHECKED;
            // 此处设置为true，防止出现onTouchEnd事件异常的情况，保证每次拖动正常执行。
            this.swapFlag = true;
        }
    }

    private onTouchEnd(evt: egret.TouchEvent) {
        // 只有一次touch事件完整结束时，才能进行下一次的交换动作。
        if (this.status == BLOCK_STATUS.TOUCH_MOVE ||
            this.status == BLOCK_STATUS.CHECKED) {
            this.status = BLOCK_STATUS.READY;
        }
        this.swapFlag = true;
    }

    private onTouchMove(evt: egret.TouchEvent) {
        if (!this.swapFlag) {
            return;
        }

        /* 选中格子后才能进行下一步操作 */
        if (this.status == BLOCK_STATUS.CHECKED) {
            this.status = BLOCK_STATUS.TOUCH_MOVE;
        }

        /* 屏蔽无效的手指滑动 */
        if (this.status != BLOCK_STATUS.TOUCH_MOVE) {
            return;
        }

        let moveX = evt.localX - this.touchX;
        let moveY = evt.localY - this.touchY;
        let touchCol = Math.floor(this.touchX / this.size);
        let touchRow = Math.floor(this.touchY / this.size);
        let dir: number = null;
        let swapRow = touchRow;
        let swapCol = touchCol;

        if (Math.abs(moveX) >= this.size / 3) {
            if (moveX > 0) {
                swapCol = touchCol + 1;
                dir = MOVE_DIRECTION.RIGHT;
            } else {
                swapCol = touchCol - 1;
                dir = MOVE_DIRECTION.LEFT;
            }
        } else if (Math.abs(moveY) >= this.size / 3) {
            if (moveY > 0) {
                swapRow = touchRow + 1;
                dir = MOVE_DIRECTION.BOTTOM;
            } else {
                swapRow = touchRow - 1;
                dir = MOVE_DIRECTION.TOP;
            }
        }

        if (dir != null) {
            if (this.map.get(swapRow, swapCol) == null ||
                this.map.get(touchRow, touchCol) == null) {
                this.status = BLOCK_STATUS.READY;
            } else {
                this.swapFlag = false;
                this.swapRequest(touchRow, touchCol, swapRow, swapCol, dir);
            }
        }
    }

    /*
     * Request to swap
    **/
    private swapRequest(touchRow: number, touchCol: number, distRow: number, distCol: number, dir: MOVE_DIRECTION) {
        Log.debug("Swap block: row: " + (touchRow+1) + ", col: " + (touchCol+1) + ", dir: " + dir);

        let touchBlock = this.map.get(touchRow, touchCol);
        let distBlock = this.map.get(distRow, distCol);

        this.status = BLOCK_STATUS.MOVING;
        this.map.swapNeighbors(touchBlock, distBlock, dir, () => {
            let touchEffect = touchBlock.getSpecialEffect();
            let distEffect = distBlock.getSpecialEffect();

            if (touchEffect != null && distEffect != null) {
                this.specialEffectSwap();
            } else {
                if (touchEffect == EFFECT_TYPE.MAGIC_BIRD && distEffect == EFFECT_TYPE.MAGIC_BIRD) {
                    this.singleMagicBirdSwap();
                } else {
                    if (!this.simpleSwap(touchRow, touchCol, distRow, distCol, dir)) {
                        // move back
                        this.map.swapNeighbors(touchBlock, distBlock, -dir, () => {
                            this.status = BLOCK_STATUS.READY;
                        }, 100);
                    }
                }
            }
        });
    }

    /*
     * 简单交换
    **/
    private simpleSwap(touchRow: number, touchCol: number, distRow: number, distCol: number, dir: number): boolean {
        let ret: EliminateInfo[] = this.eliminateCheck.swapCheck(this.map, touchRow, touchCol, distRow, distCol, dir);
        if (ret.length > 0) {
            this.map.swap(touchRow, touchCol, distRow, distCol);
            this.map.eliminate(ret, () => {
                this.whoolyEliminate();
            });
        }
        return ret.length > 0;
    }

    /*
     * 单魔力鸟交换
    **/
    public singleMagicBirdSwap() {}

    /*
     * 双特效交换
    **/
    public specialEffectSwap() {}

    private whoolyEliminate() {
        let ret: EliminateInfo[] = this.eliminateCheck.whollyCheck(this.map);
        if (ret.length > 0) {
            this.map.eliminate(ret, () => {
                this.whoolyEliminate();
            });
        } else {
            Log.debug("Finish eliminate.");
            this.status = BLOCK_STATUS.READY;
            this.checkMap();
        }
    }

    private initMap() {
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.column; j++) {
                let info: BlockInfo = Util.generateBlockInfo(i, j, this.size);
                // 出现连续三个相同的情况，则生成一个跟上方和左侧都不一样的块
                if (this.map.isLine(i, j, info)) {
                    info.type = this.map.getDifferentType(i, j);
                }
                this.map.add(i, j, Util.createBlock(info))
            }
        }
        if (this.deadMapCheck.check(this.map)) {
            Log.debug("DEAD MAP! so that we will create the map again.");
            this.initMap();
        } else {
            this.map.render();
            this.bindEvent();
            this.checkMap()
        }
    }

    public checkMap() {
        for (let row = 0; row < this.row; row++) {
            for (let col = 0; col < this.column; col++) {
                let block = this.map.get(row, col);
                if (block == null) continue;
                if (row != block.getRow() ||
                    col != block.getCol()) {
                    Log.warn("rol or column not match: row: " + row + ", col: " + col);
                }
            }
        }
    }
}
