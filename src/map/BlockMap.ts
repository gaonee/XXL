//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  block map
//
//////////////////////////////////////////////////////////////////////////////////////

class BlockMap {
    private container: egret.DisplayObjectContainer;
    private map: BlockBase[][] = new Array();
    private row: number = 0;
    private column: number = 0;
    private size: number = 0;
    private effectsProcess: EliminateProcess = null;

    constructor(container: egret.DisplayObjectContainer, row: number, col: number, size: number) {
        if (container == null) return;

        this.container = container;
        this.row = row;
        this.column = col;
        this.size = size;
        this.effectsProcess = new EliminateProcess();

        for (let row = 0; row < this.row; row++) {
            this.map[row] = new Array();
        }
    }

    /*
     * 填充格子
    **/
    public add(row: number, col: number, block: BlockBase): void {
        if (Array.isArray(this.map[row])) {
            this.map[row][col] = block;
        } else {
            Log.warn("BlockMap, add block error! row: " + row + ", col: " + col);
        }
    }

    /*
     * [row]行[col]列的格子是否是[type]类型
     * @param row 行号
     * @param col 列号
     * @param type 类型
     * @param 布尔值，TRUE表示相同，FALSE表示不相同。
    **/
    public compare(row: number, col: number, type: number): boolean {
        let block = this.get(row, col);
        if (block != null) {
            return block.type == type;
        }
        return false;
    }

    /*
     * 获取格子
    **/
    public get(row: number, col: number): BlockBase {
        if (Array.isArray(this.map[row]) && col < this.map[row].length) {
            return this.map[row][col];
        }
        return null;
    }

    /*
     * 生成跟左边和上方格子类型都不相同的类型
    **/
    public getDifferentType(row: number, col: number) {
        let type = null;
        for (let bt = 1; bt <= BLOCK_NUM; bt++) {
            if (!this.compare(row-1, col, bt) &&
                !this.compare(row, col-1, bt)) {
                type = bt;
                break;
            }
        }

        if (type == null) {
            Log.warn("Can not find a different type.");
            type = BLOCK_TYPE.BLACK;
        }
        
        return type;
    }

    public getRowAmount(): number {
        return this.row;
    }

    public getColAmount(): number {
        return this.column;
    }

    public getContainer(): egret.DisplayObjectContainer {
        return this.container;
    }

    public getSize(): number {
        return this.size;
    }

    public hasDrop(row: number, col: number): boolean {
        let eliminateMemo = this.effectsProcess.eliminateMemo;
        return eliminateMemo[col] != undefined && eliminateMemo[col] >= row;
    }

    /*
     * 是否存在连续三个格子相同的情况
     * 初始化时，只需要判断上方和左侧即可
    **/
    public isLine(row: number, col: number, info: BlockInfo): boolean {
        // above
        if (row-1>=0&&row-2>=0 &&
            this.map[row-1][col].type == info.type && this.map[row-2][col].type == info.type) {
            return true;
        }
        // left side
        if (col-1>=0&&col-2>=0 &&
            this.map[row][col-1].type == info.type && this.map[row][col-2].type == info.type) {
            return true;
        }

        return false;
    }

    public remove(row: number, col: number, block?: BlockBase) {
        if (block == undefined || block == null) {
            block = this.get(row, col);
        }

        if (block == null) {
            return;
        }

        this.container.removeChild(block.getObject());
        this.map[row][col] = null;
    }

    public render() {
        for (let row = 0; row < this.row; row++) {
            for (let col = 0; col < this.column; col++) {
                if (this.map[row][col] instanceof BlockBase) {
                    this.map[row][col].show(this.container);
                }
            }
        }
    }

    public risingTop(row: number, col: number) {
        let block = this.get(row, col);
        if (block != null) {
            this.container.removeChild(block.getObject());
            block.show(this.container);
        }
    }

    public set(row: number, col: number, block: BlockBase) {
        this.map[row][col] = block;
    }

    /**
     * 简单消除，只根据指定点进行消除。
     * @param eliminateList EliminateInfo组成的数组
     * @param callback 消除并补全、下落完成后调用
    **/
    public simpleEliminateProcess(eliminateList: EliminateInfo[], callback: Function) {
        this.effectsProcess.simple(this, eliminateList, callback);
    }

    /**
     * 双特效交换消除
     * @param touchBlock 手指触摸的格子
     * @param swapBlock 被交换的格子
     * @param callback 消除并补全、下落完成后调用
    **/
    public effectSwapEliminateProcess(touchBlock: BlockBase, swapBlock: BlockBase, callback: Function) {
        let touchBlockEffect = touchBlock.getSpecialEffect();
        let swapBlockEffect = swapBlock.getSpecialEffect();

        switch (touchBlockEffect) {
            case EFFECT_TYPE.ROW_LINE: {
                switch (swapBlockEffect) {
                    case EFFECT_TYPE.ROW_LINE: {}
                    case EFFECT_TYPE.COL_LINE: {}
                    case EFFECT_TYPE.BOMB: {}
                    case EFFECT_TYPE.MAGIC_BIRD: {}
                }
            }
            case EFFECT_TYPE.COL_LINE: {}
            case EFFECT_TYPE.BOMB: {}
            case EFFECT_TYPE.MAGIC_BIRD: {}
        }
    }

    /**
     * 交换相邻位置格子
    **/
    public swap(distRow: number, distCol: number, resRow: number, resCol: number): void {
        let temp = this.map[distRow][distCol];

        this.map[distRow][distCol] = this.map[resRow][resCol];
        this.map[resRow][resCol] = temp;
    }

    public swapNeighbors(res: BlockBase, dist: BlockBase, dir: number, callback ?: Function, waitTime ?: number) {
        let count = 0;
        let process = () => {
            count ++;
            if (count == 2 && callback) {
                callback();
            }
        }
        res.move(dir, process, waitTime);
        dist.move(-dir, process, waitTime);
    }
}
