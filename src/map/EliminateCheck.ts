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

class EliminateCheck {
    private eliminateList: EliminateInfo[] = null;
    /*
     * 二次消除特效点列表
     * 二次消除表示被直线特效或者魔力鸟消除的点，这些点在当次消除中不会立即消除；
     * 当该次消除结束后，继续触发该点特效，用以表现消除的层次。
    **/
    private effectList: BlockInfo[] = null;

    public getResult(): EliminateInfo[] {
        return this.eliminateList;
    }
    /*
     * 计算本次交换是否会达到消除条件，用于滑动后的首次消除。
     * @param map BlockMap
     * @param touchRow 发起交换的格子所在行
     * @param touchCol 发起交换的格子所在列
     * @param distRow 目标格子所在行
     * @param distCol 目标格子所在列
     * @param dir 手指滑动方向
    **/
    public swapCheck(map: BlockMap, touchRow: number, touchCol: number, distRow: number, distCol: number, dir: number): EliminateInfo[] {
        let eliminateList: EliminateInfo[] = new Array();
        let touchRet: EliminateInfo = this.singleScan(map, distRow, distCol, map.get(touchRow, touchCol), dir);
        let distRet: EliminateInfo = this.singleScan(map, touchRow, touchCol, map.get(distRow, distCol), -dir);

        if (touchRet != null) {
            eliminateList.push(touchRet);
        }
        if (distRet != null) {
            eliminateList.push(distRet)
        }

        return eliminateList;
    }

    /*
     * 全图扫描，计算是否存在可消除的情况。
     * 算法原理：通过两次扫描，找到所有符合条件的格子。算法复杂度为O(2n)。详细原理如下：
     * 1.先逐行扫，找到连续三个或者三个以上相同格子，计入行消除列表；
     * 2.逐列扫描，找到连续三个或者三个以上相同格子，计入列消除列表；
     * 3.比较两个消除列表，找到重复的格子；
     * 4.有交叉表示非线性消除，交叉点为keyPoint；
     * 5.无交叉为线性消除。
    **/
    public whollyCheck(map: BlockMap): EliminateInfo[] {
        let eliminateList: EliminateInfo[] = new Array();
        let rowPoints: Point[][] = this.scanRow(map);
        let colPoints: Point[][] = this.scanCol(map);

        if (rowPoints.length > 0) {
            if (colPoints.length > 0) {
                for (let i = 0; i < rowPoints.length; i++) {
                    for (let j = 0; j < colPoints.length; j++) {
                        let keyPoint = this.isCross(rowPoints[i], colPoints[j]);
                        if (keyPoint != null) {
                            let block = map.get(keyPoint.row, keyPoint.col);
                            eliminateList.push({
                                type: ELIMINATE_TYPE.NON_LINE,
                                blockType: block.getType(),
                                points: rowPoints[i].concat(colPoints[j]),
                                keyPoint: keyPoint
                            });
                            // 产生交叉，该列不再参与后面的比较
                            colPoints.splice(j, 1);
                            break;
                        } else {
                            if (j == colPoints.length-1) {
                                let keyPoint = this.getKeyPoint(map, "row", rowPoints[i]);
                                let block = map.get(keyPoint.row, keyPoint.col);
                                // 没有交叉，直接返回
                                eliminateList.push({
                                    type: this.getEliminateType("row", rowPoints[i].length),
                                    blockType: block.getType(),
                                    points: rowPoints[i],
                                    keyPoint: keyPoint
                                });
                            }
                        }
                    }
                }
                // 因为只有所有的比较完成，才知道哪些列未交叉，此时需要消除剩余的列
                this.addLineEliminatePoints(map, "col", colPoints, eliminateList);
            } else {
                // 只有行消除
                this.addLineEliminatePoints(map, "row", rowPoints, eliminateList);
            }
        } else {
            if (colPoints.length > 0) {
                // 只有列消除
                this.addLineEliminatePoints(map, "col", colPoints, eliminateList);
            }
        }

        return eliminateList;
    }

    private addLineEliminatePoints(map: BlockMap, axis: string, points: Point[][], eliminateList: EliminateInfo[]) {
        for (let i = 0; i < points.length; i++) {
            let keyPoint = this.getKeyPoint(map, axis, points[i]);
            let block = map.get(keyPoint.row, keyPoint.col);

            eliminateList.push({
                type: this.getEliminateType(axis, points[i].length),
                blockType: block.getType(),
                points: points[i],
                keyPoint: keyPoint
            });
        }
    }

    /*
     * 计算本次消除的类型
     * @param rowArr 消除的行，可为空；不为空时需按行号从小到大排列。
     * @param colArr 消除的列，可为空；不为空时需按列号从小到大排列。
     * @param keyPoint 关键点，参考 EliminateInfo 中的说明。
     * @return EliminateInfo
    **/
    private getEliminateInfo(rowArr: Point[], colArr: Point[], keyPoint: Point, blockType: BLOCK_TYPE): EliminateInfo {
        let eliminateType: ELIMINATE_TYPE = null;
        let eliminatePoints: Point[] = null;

        if (Array.isArray(rowArr) && rowArr.length >= 3) {
            if (Array.isArray(colArr) && colArr.length >= 3) {
                // 非线性消除中，存在线性5消，认为是线性5消
                if (rowArr.length == 5 || colArr.length == 5) {
                    eliminateType = ELIMINATE_TYPE.ROW_LINE_FIVE;
                } else {
                    eliminateType = ELIMINATE_TYPE.NON_LINE;
                }
                
                eliminatePoints = rowArr.concat(colArr);
            } else {
                // 横向线性消除
                eliminateType = this.getEliminateType("row", rowArr.length);
                eliminatePoints = rowArr;
            }
        } else {
            // 纵向线性消除
            if (Array.isArray(colArr) && colArr.length >= 3) {
                eliminateType = this.getEliminateType("col", colArr.length);
                eliminatePoints = colArr;
            }
        }
        Log.debug("eliminateType: " + eliminateType);
        return eliminateType == null ? null : {
            type: eliminateType,
            blockType: blockType,
            points: eliminatePoints,
            keyPoint: keyPoint
        };
    }

    /*
     * 计算消除类型
     * @param rowArr 消除的行，可为空；不为空时需按行号从小到大排列。
     * @param colArr 消除的列，可为空；不为空时需按列号从小到大排列。
     * @return ELIMINATE_TYPE
    **/
    private getEliminateType(axis: string, eliminateNum: number): ELIMINATE_TYPE {
        let eliminateType: ELIMINATE_TYPE = null;

        if (axis == "row") {
            if (eliminateNum == 3) {
                eliminateType = ELIMINATE_TYPE.ROW_LINE_THREE;
            } else if (eliminateNum == 4) {
                eliminateType = ELIMINATE_TYPE.ROW_LINE_FOUR;
            } else {
                eliminateType = ELIMINATE_TYPE.ROW_LINE_FIVE;
            }
        } else {
            if (eliminateNum == 3) {
                eliminateType = ELIMINATE_TYPE.COL_LINE_THREE;
            } else if (eliminateNum == 4) {
                eliminateType = ELIMINATE_TYPE.COL_LINE_FOUR;
            } else {
                eliminateType = ELIMINATE_TYPE.COL_LINE_FIVE;
            }
        }

        return eliminateType;
    }

    /*
     * 线性消除的keyPoint
    **/
    private getKeyPoint(map: BlockMap, axis: string, points: Point[]) {
        if (points.length <= 3) {
            return points[0];
        }
        if (axis == "row") {
            for (let i = 0; i < points.length; i++) {
                if (map.hasDrop(points[i].row, points[i].col)) {
                    return points[i];
                }
            }
        } else {
            for (let i = points.length-1; i >= 0; i--) {
                if (map.hasDrop(points[i].row, points[i].col)) {
                    return points[i];
                }
            }
        }
        return points[0];
    }

    /*
     * 判断横向和纵向消除是否交叉。若交叉，返回交叉点；否则，返回null。
     * @param rowPoints 横向扫描的一组相同点
     * @param colPoints 纵向扫描的一组相同点
     * @return 交叉点
    **/
    private isCross(rowPoints: Point[], colPoints: Point[]): Point {
        let rowPos = rowPoints[0].row;
        let colPos = colPoints[0].col;

        if ((colPos >= rowPoints[0].col && colPos <= rowPoints[rowPoints.length-1].col) ||
            (rowPos >= colPoints[0].row && rowPos <= colPoints[colPoints.length-1].row)) {
            return {
                row: rowPos,
                col: colPos
            };
        }

        return null;
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
    private singleScan(map: BlockMap, row: number, col: number, block: BlockBase, dir?: number): EliminateInfo {
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
        return this.getEliminateInfo(rowArr, colArr, {row: row, col: col}, type);
    }

    /*
     * 逐列扫描，找到所有纵向连续三个或者三个以上相同格子
    **/
    private scanCol(map: BlockMap): Point[][] {
        let ret: Point[][] = new Array();
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
    private scanRow(map: BlockMap): Point[][] {
        let ret: Point[][] = new Array();
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
    private settleRow(row: number, col: number, count: number, ret: Point[][]) {
        if (count >= 3) {
            let points = new Array();
            for (let i = count-1; i >= 0; i--) {
                points.push({
                    row: row,
                    col: col - i
                });
            }
            ret.push(points);
        }
    }

    /*
     * 列扫描遇到不同的格子，需要结算结果
     * @param row 扫描相等行的最后一行
     * @param col 扫描所在列
     * @param count 本次扫描的相同格子数量
     * @param ret 结果
    **/
    private settleCol(row: number, col: number, count: number, ret: Point[][]) {
        if (count >= 3) {
            let points = new Array();
            for (let i = count-1; i >= 0; i--) {
                points.push({
                    row: row - i,
                    col: col
                });
            }
            ret.push(points);
        }
    }
}
