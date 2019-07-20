//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  特效消除处理模块
//
//////////////////////////////////////////////////////////////////////////////////////

interface DropInfo {
    count: number;
    block: BlockBase;
}

class EliminateProcess {
    // 标识哪一列有格子消除，并记录每列最下方的消除位置
    public eliminateMemo: number[] = new Array();

    /**
     * 下降后位置更新
    **/
    private dropColList(map: BlockMap, col: number, dropList: DropInfo[], callback?: Function): void {
        let finishCount = 0;
        for (let row = 0; row < dropList.length; row++) {
            let block: BlockBase = dropList[row].block;
            block.drop(dropList[row].count, () => {
                finishCount ++;
                if (finishCount == dropList.length) {
                    for (let r = 0; r < dropList.length; r++) {
                        map.set(r, col, dropList[r].block);
                    }
                    callback && callback();
                }
            })
        }
    }

    /**
     * 填充和下落
     * @param eliminateArr 哪些列有格子消除
     */
    private dropDown(map: BlockMap, callback?: Function) {
        if (map == null || map == undefined) {
            callback && callback();
            return;
        }

        let dropCount = 0;
        let rowNum = map.getRowAmount();
        let colNum = map.getColAmount();
        
        for (let i = 0; i < colNum; i++) {
            let count = 0;
            let dropList: DropInfo[] = new Array();

            for (let row = rowNum-1; row >= 0; row--) {
                let block = map.get(row, i);
                if (block == null) {
                    count ++;
                } else {
                    if (count > 0) {
                        dropList.unshift({
                            count: count,
                            block: block
                        });
                    }
                }
            }

            if (count <= 0) continue;

            dropCount ++;

            // 上方生成新的格子，补足消除的空缺
            for (let c = 1; c <= count; c++) {
                // let index = count - c + 1;
                let info: BlockInfo = Util.generateBlockInfo(-c, i, map.getSize());
                let block: BlockBase = Util.createBlock(info);
                block.show(map.getContainer());
                dropList.unshift({
                    count: count,
                    block: block
                });
            }
            this.dropColList(map, i, dropList, () => {
                dropCount --;
                if (dropCount == 0) {
                    callback && callback();
                }
            });
        }
    }

    /**
     * 非特效消除。包括以下情况：
     * 1.格子交换三消；
     * 2.格子补全、下落后，经全图扫描后的消除。
     * @param points 需要消除的格子的位置组成的数组
    **/
    private eliminateBlocks(map: BlockMap, points: Point[]): BlockBase[] {
        let effectList: BlockBase[] = new Array();

        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            map.remove(p.row, p.col);
        }

        return effectList;
    }

    /**
     * 消除中的特效检查，若该消除有特效产生，则删除keyPoint位置的格子，
     * 并根据特效类型，在该位置生成新的格子。
     * @param block 需要消除的特效格子
     * @param point 格子位置
    **/
    private simpleEliminateProcess(map: BlockMap, eliminateInfo: EliminateInfo) {
        let points: Point[] = eliminateInfo.points;

        this.eliminateBlocks(map, points);
    }

    /************************************************* 消除调用场景 **************************************************/

    /**
     * 【简单交换消除】
     * 调用场景：1.简单交换三消；2.格子补全、下落消除。
     * @param map 消除发生的BlockMap
     * @param eliminateList EliminateInfo组成的数组
     * @param callback 所有消除完成，且格子补全、下落后执行回调
    **/
    public simple(map: BlockMap, eliminateList: EliminateInfo[], callback: Function): void {
        for (let i = 0; i < eliminateList.length; i++) {
            this.simpleEliminateProcess(map, eliminateList[i]);
        }

        this.dropDown(map, callback);
    }
}
