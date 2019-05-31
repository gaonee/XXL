class Util {
    public static createBlock(info: BlockInfo): BlockBase {
        switch (info.type) {
            case BLOCK_TYPE.BLACK: {
                return new BlockBlack(info);
            }
            case BLOCK_TYPE.BLUE: {
                return new BlockBlue(info);
            }
            case BLOCK_TYPE.GREEN: {
                return new BlockGreen(info);
            }
            case BLOCK_TYPE.GREY: {
                return new BlockGrey(info);
            }
            case BLOCK_TYPE.RED: {
                return new BlockRed(info);
            }
            default: {
                return null;
            }
        }
    }

    public static generateBlockInfo(row: number, col: number, size: number): BlockInfo {
        return {
            row: row,
            col: col,
            width: size,
            height: size,
            type: this.random(1, BLOCK_NUM)
        };
    }

    public static random(min: number, max: number): number {
        return parseInt((Math.random() * (max+1 - min) + min+'').substr(0, 1));
    }
}
