//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  dead map checker
//
//////////////////////////////////////////////////////////////////////////////////////

class DeadMapCheck {
    /*
     * 死图检测，即没有可消除的格子
     * 返回值：布尔值，TRUE表示死图，FALSE表示不是死图。
    **/
    public check(map: BlockMap): boolean {
        let rowAmount: number = map.getRowAmount();
        let colAmount: number = map.getColAmount();
        for (let row = 0; row < rowAmount; row ++) {
            for (let col = 0; col < colAmount; col ++) {
                let block = map.get(row, col);
                if (this.checkModel1(map, row, col) ||
                    this.checkModel2(map, row, col) ||
                    this.checkModel3(map, row, col)) {
                        return false;
                    }
            }
        }
        
        return true;
    }

    /*     口
     *   口  口      
     *     口        
     *     口       
     *   口  口
     *     口     
     * 情形1：垂直方向有连续两个相同的格子（即中间两个格子），
     * 则周围六个个格子中只要有一个相同，即表示不是死图。
     * 注意：由于是二维数组从左到右，从上到下遍历，因此，当前点只需要判断下方的点即可。
     * 返回值：布尔值，TRUE表示不是死图，FALSE表示死图。
    **/
    private checkModel1(map:BlockMap , row: number, col: number): boolean {
        let block = map.get(row, col);
        let type = block.type;
        // 下方格子是否相同
        if (map.compare(row+1, col, type)) {
            // 左上角的格子是否相同
            if (map.compare(row-1, col-1, type)) {
                return true;
            }
            // 右上角的格子是否相同
            if (map.compare(row-1, col+1, type)) {
                return true;
            }
            // 左下角的格子是否相同
            if (map.compare(row+2, col-1, type)) {
                return true;
            }
            // 右下角的格子是否相同
            if (map.compare(row+2, col+1, type)) {
                return true;
            }
            // 最上方的格子是否相同
            if (map.compare(row-2, col, type)) {
                return true;
            }
            // 最下方的格子是否相同
            if (map.compare(row+3, col, type)) {
                return true;
            }
        }
        return false;
    }

    /*   口  口        
     *     口        
     *   口  口     
     * 情形2：周围相邻的两个格子跟中间的格子相同。
    **/
    private checkModel2(map:BlockMap , row: number, col: number): boolean {
        let block = map.get(row, col);
        let type = block.type;
        // 同时存在左上角和右上角格子
        if (map.compare(row-1, col-1, type) && map.compare(row-1, col+1, type)) {
            return true;
        }
        // 同时存在左下角和左上角格子
        if (map.compare(row-1, col-1, type) && map.compare(row+1, col-1, type)) {
            return true;
        }
        // 同时存在右上角和右下角格子
        if (map.compare(row-1, col+1, type) && map.compare(row+1, col+1, type)) {
            return true;
        }
        // 同时存在左下角和右下角格子
        if (map.compare(row+1, col-1, type) && map.compare(row+1, col+1, type)) {
            return true;
        }

        return false;
    }

    /*     口    口        
     *   口  口口  口      
     *     口    口   
     * 情形3：水平方向有连续两个相同的格子（即中间两个格子），
     * 则周围六个格子中只要有一个相同，即表示不是死图。
    **/
    private checkModel3(map:BlockMap , row: number, col: number): boolean {
        let block = map.get(row, col);
        let type = block.type;
        // 下方格子是否相同
        if (map.compare(row, col+1, type)) {
            // 左上角的格子是否相同
            if (map.compare(row-1, col-1, type)) {
                return true;
            }
            // 右上角的格子是否相同
            if (map.compare(row-1, col+2, type)) {
                return true;
            }
            // 左下角的格子是否相同
            if (map.compare(row+1, col-1, type)) {
                return true;
            }
            // 右下角的格子是否相同
            if (map.compare(row+1, col+2, type)) {
                return true;
            }
            // 最左侧的格子是否相同
            if (map.compare(row, col-2, type)) {
                return true;
            }
            // 最右侧的格子是否相同
            if (map.compare(row, col+3, type)) {
                return true;
            }
        }
        return false;
    }
}
