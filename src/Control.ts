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
    private size: number = 0;
    private touchX: number = 0;
    private touchY: number = 0;
    private status: number = BLOCK_STATUS.READY;
    private readonly row: number = 9;
    private readonly column: number = 9;

    constructor(container: egret.DisplayObjectContainer) {
        this.container = container;
        this.size = this.container.width / 9;
        this.map = new BlockMap(container, this.row, this.column, this.size);
        this.eliminateCheck = new EliminateCheck(this.row, this.column);

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
        }
    }

    private onTouchEnd(evt: egret.TouchEvent) {
        if (this.status == BLOCK_STATUS.TOUCH_MOVE) {
            this.status = BLOCK_STATUS.READY;
        }
    }

    private onTouchMove(evt: egret.TouchEvent) {
        if (this.status == BLOCK_STATUS.READY) {
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
        let changeRow = touchRow;
        let changeCol = touchCol;

        if (Math.abs(moveX) >= this.size / 3) {
            if (moveX > 0) {
                changeCol = touchCol + 1;
                dir = MOVE_DIRECTION.RIGHT;
            } else {
                changeCol = touchCol - 1;
                dir = MOVE_DIRECTION.LEFT;
            }
        } else if (Math.abs(moveY) >= this.size / 3) {
            if (moveY > 0) {
                changeRow = touchRow + 1;
                dir = MOVE_DIRECTION.BOTTOM;
            } else {
                changeRow = touchRow - 1;
                dir = MOVE_DIRECTION.TOP;
            }
        }

        if (dir != null) {
            if (this.map.get(changeRow, changeCol) == null ||
                this.map.get(touchRow, touchCol) == null) {
                this.status = BLOCK_STATUS.READY;
            } else {
                this.change(touchRow, touchCol, changeRow, changeCol, dir);
            }
        }
    }

    /*
     * change position
    **/
    private change(touchRow, touchCol, distRow: number, distCol: number, dir) {
        Log.debug("Exchange block: row: " + (touchRow+1) + ", col: " + (touchCol+1) + ", dir: " + dir);

        let touchBlock = this.map.get(touchRow, touchCol);
        let dist = this.map.get(distRow, distCol);

        this.status = BLOCK_STATUS.MOVING;
        touchBlock.change(dir, () => {
            let ret: Point[] = this.eliminateCheck.touchCheck(this.map, touchRow, touchCol, distRow, distCol, dir);
            if (ret.length > 0) {
                Log.debug("Start eliminate.");
                this.status = BLOCK_STATUS.ELIMINATION;
                this.map.exchange(touchRow, touchCol, distRow, distCol);
                this.map.eliminate(ret, () => {
                    // 
                    this.checkMap();
                    this.whoolyEliminate();
                });
            } else {
                // move back
                touchBlock.change(-dir, () => {
                    this.status = BLOCK_STATUS.READY;
                }, 100);
                dist.change(dir, () => {}, 100);
            }
        });
        dist.change(-dir);
    }

    private whoolyEliminate() {
        let ret = this.eliminateCheck.whollyCheck(this.map);
        if (ret.length > 0) {
            this.map.eliminate(ret, () => {
                this.whoolyEliminate();
            });
        } else {
            Log.debug("Finish eliminate.");
            this.status = BLOCK_STATUS.READY;
            this.checkMap();
            console.log(this.map)
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
        if (DeadMapCheck.check(this.map, this.row, this.column)) {
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
