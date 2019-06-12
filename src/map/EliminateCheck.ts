//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  判断是否达到消除条件，以及判断消除类型。消除类型分为线性和非线性消除。
//  线性消除包含横向和纵向两种。具体又分为三消、四消和五消。
//  非线性消除包含T型消除、L型消除，两种方式可做一种类型处理。
//
//////////////////////////////////////////////////////////////////////////////////////

enum ELIMINATE_TYPE {
    ROW_LINE_THREE,
    ROW_LINE_FOUR,
    ROW_LINE_FIVE,
    COL_LINE_THREE,
    COL_LINE_FOUR,
    COL_LINE_FIVE,
    NON_LINE
}

class EliminateCheck {

    constructor() {}

    /*
     * 计算本次交换是否会达到消除条件，用于滑动后的首次消除。
     * @param map BlockMap
     * @param touchRow 发起交换的格子所在行
     * @param touchCol 发起交换的格子所在列
     * @param distRow 目标格子所在行
     * @param distCol 目标格子所在列
     * @param dir 手指滑动方向
    **/
    public touchCheck(map: BlockMap, touchRow: number, touchCol: number, distRow: number, distCol: number, dir: number): Point[] {
        let touchRet: Point[] = this.singleScan(map, distRow, distCol, map.get(touchRow, touchCol), dir);
        let distRet: Point[] = this.singleScan(map, touchRow, touchCol, map.get(distRow, distCol), -dir);

        return touchRet.concat(distRet);
    }

    /*
     * 全图扫描，计算是否存在可消除的情况。
     * 算法原理：通过两次扫描，找到所有符合条件的格子。算法复杂度为O(2n)。详细原理如下：
     * 1.先逐行扫，找到连续三个或者三个以上相同格子，计入行消除列表；
     * 2.逐列扫描，找到连续三个或者三个以上相同格子，计入列消除列表；
     * 3.比较两个消除列表，找到重复的格子。（暂未实现）
    **/
    public whollyCheck(map: BlockMap): Point[] {
        let rowPoints: Point[] = this.scanRow(map);
        let colPoints: Point[] = this.scanCol(map);

        return rowPoints.concat(colPoints);
    }

    /*
     * 根据点的位置和将要移过去的格子进行计算
     * @param map BlockMap
     * @param row 交换后格子所在行
     * @param col 交换后格子所在列
     * @param block 移到该位置的格子
     * @param dir 交换方向
     * 注意：交换方向的格子不参与计算，因为肯定无法消除。可不传，不影响正常判断。
    **/
    private singleScan(map: BlockMap, row: number, col: number, block: BlockBase, dir?: number): Point[] {
        let rowAmount: number = map.getRowAmount();
        let colAmount: number = map.getColAmount();
        let colArr: Point[] = new Array();
        let rowArr: Point[] = new Array();
        let ret: Point[] = new Array();
        let type = block.type;

        rowArr.push({row: row, col: col});
        colArr.push({row: row, col: col});

        // 左侧
        if (dir != MOVE_DIRECTION.RIGHT && col > 0) {
            if (map.compare(row, col-1, type)) {
                rowArr.unshift({row: row, col: col-1});
                if (map.compare(row, col-2, type))  {
                    rowArr.unshift({row: row, col: col-2});
                }
            }
        }
        // 右侧
        if (dir != MOVE_DIRECTION.LEFT && col < colAmount-1) {
            if (map.compare(row, col+1, type)) {
                rowArr.push({row: row, col: col+1});
                if (map.compare(row, col+2, type))  {
                    rowArr.push({row: row, col: col+2});
                }
            }
        }
        // above
        if (dir != MOVE_DIRECTION.BOTTOM && row > 0) {
            if (map.compare(row-1, col, type)) {
                colArr.unshift({row: row-1, col: col});
                if (map.compare(row-2, col, type))  {
                    colArr.unshift({row: row-2, col: col});
                }
            }
        }
        // bottom
        if (dir != MOVE_DIRECTION.TOP && row < rowAmount-1) {
            if (map.compare(row+1, col, type)) {
                colArr.push({row: row+1, col: col});
                if (map.compare(row+2, col, type))  {
                    colArr.push({row: row+2, col: col});
                }
            }
        }
        if (colArr.length >= 3) {
            ret = ret.concat(colArr);
            Log.debug("删除第 "+colArr[0].col+" 列, 起始行："+colArr[0].row+"，数量：" + colArr.length);
        }
        if (rowArr.length >= 3) {
            ret = ret.concat(rowArr);
            Log.debug("删除第 "+rowArr[0].row+" 行，起始列："+rowArr[0].col+"，数量：" + rowArr.length);
        }
        this.getEliminateInfo(rowArr, colArr, {row: row, col: col});
        return ret;
    }

    /*
     * 逐列扫描，找到所有纵向连续三个或者三个以上相同格子
    **/
    private scanCol(map: BlockMap): Point[] {
        let ret: Point[] = new Array();
        let rowAmount: number = map.getRowAmount();
        let colAmount: number = map.getColAmount();

        for (let col = 0; col < colAmount; col++) {
            let anchorType = null;
            let count = 0;
            for (let row = 0; row < rowAmount; row++) {
                let block = map.get(row, col);
                if (block != null) {
                    if (anchorType == block.type) {
                        count ++;
                        if (row == rowAmount-1) {
                            this.settleCol(row, col, count, ret);
                        }
                    } else {
                        this.settleCol(row-1, col, count, ret);
                        anchorType = block.type;
                        count = 1;
                    }
                } else {
                    this.settleCol(row-1, col, count, ret);
                    anchorType = null;
                    count = 0
                }
            }
        }

        return ret;
    }

    /*
     * 逐行扫描，找到所有横向连续三个或者三个以上相同格子
    **/
    private scanRow(map: BlockMap): Point[] {
        let ret: Point[] = new Array();
        let rowAmount: number = map.getRowAmount();
        let colAmount: number = map.getColAmount();

        for (let row = 0; row < rowAmount; row++) {
            let anchorType = null;
            let count = 0;
            for (let col = 0; col < colAmount; col++) {
                let block = map.get(row, col);
                if (block != null) {
                    if (anchorType == block.type) {
                        count ++;
                        // 扫描到最后一行，需要结算扫描结果。
                        if (col == colAmount-1) {
                            this.settleRow(row, col, count, ret);
                        }
                    } else {
                        this.settleRow(row, col-1, count, ret);
                        anchorType = block.type;
                        count = 1;
                    }
                } else {
                    anchorType = null;
                    this.settleRow(row, col-1, count, ret);
                    count = 0;
                }
            }
        }

        return ret;
    }

    /*
     * 行扫描遇到不同的格子，需要结算结果
     * @param row 扫描所在行
     * @param col 扫描相等列的最后一列
     * @param count 本次扫描的相同格子数量
     * @param ret 结果
    **/
    private settleRow(row: number, col: number, count: number, ret) {
        if (count >= 3) {
            for (let i = 0; i < count; i++) {
                ret.push({
                    row: row,
                    col: col - i
                });
            }
        }
    }

    /*
     * 列扫描遇到不同的格子，需要结算结果
     * @param row 扫描相等行的最后一行
     * @param col 扫描所在列
     * @param count 本次扫描的相同格子数量
     * @param ret 结果
    **/
    private settleCol(row: number, col: number, count: number, ret) {
        if (count >= 3) {
            for (let i = 0; i < count; i++) {
                ret.push({
                    row: row - i,
                    col: col
                });
            }
        }
    }

    /*
     * 计算本次消除的类型
     * @param rowArr 消除的行，可为空；不为空时需按行号从小到大排列。
     * @param colArr 消除的列，可为空；不为空时需按列号从小到大排列。
     * @param keyPoint 关键点，参考 EliminateInfo 中的说明。
     * @return EliminateInfo
    **/
    private getEliminateInfo(rowArr: Point[], colArr: Point[], keyPoint: Point): EliminateInfo {
        let eliminateType: ELIMINATE_TYPE = null;
        let eliminatePoints: Point[] = null;

        if (Array.isArray(rowArr) && rowArr.length >= 3) {
            if (Array.isArray(colArr) && colArr.length >= 3) {
                // L型，keyPoint处在rowArr和colArr的两端
                // T型，keyPoint分别处在rowArr和colArr的两端和中间
                // if ((keyPoint.col != rowArr[0].col && keyPoint.col != rowArr[rowArr.length-1].col) ||
                //     (keyPoint.row != colArr[0].row && keyPoint.row != colArr[colArr.length-1].row)) {
                //     eliminateType = ELIMINATE_TYPE.T_TYPE;
                // } else {
                //     eliminateType = ELIMINATE_TYPE.L_TYPE;
                // }
                eliminateType = ELIMINATE_TYPE.NON_LINE;
            } else {
                // 横向线性消除
                let len = rowArr.length;
                if (len == 3) {
                    eliminateType = ELIMINATE_TYPE.ROW_LINE_THREE;
                } else if (len == 4) {
                    eliminateType = ELIMINATE_TYPE.ROW_LINE_FOUR;
                } else {
                    eliminateType = ELIMINATE_TYPE.ROW_LINE_FIVE;
                }
                eliminatePoints = rowArr;
            }
        } else {
            // 纵向线性消除
            if (Array.isArray(colArr) && colArr.length >= 3) {
                let len = colArr.length;
                if (len == 3) {
                    eliminateType = ELIMINATE_TYPE.COL_LINE_THREE;
                } else if (len == 4) {
                    eliminateType = ELIMINATE_TYPE.COL_LINE_FOUR;
                } else {
                    eliminateType = ELIMINATE_TYPE.COL_LINE_FIVE;
                }
                eliminatePoints = colArr;
            }
        }
        Log.debug("eliminateType: " + eliminateType);
        return {
            type: eliminateType,
            points: eliminatePoints,
            keyPoint: keyPoint
        };
    }
}
