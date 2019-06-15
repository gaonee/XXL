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

    /**
     * Create Bitmap by resource name
     * @param name Resource name
     * @return object of egret.Bitmap
     */
    public static createBitmapByName(name: string): egret.Bitmap {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * Create MovieClip by resource name
     * @param name Resource name without '_json' & '_png' suffix
     * @param clipName To create MovieClip
     * @return object of egret.MovieClip
     */
    public static createMCByName(name: string, clipName?: string): egret.MovieClip {
        let data = RES.getRes(name + "_json");
        let txtr = RES.getRes(name + "_png");
        let mcFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory( data, txtr );
        let mc: egret.MovieClip = new egret.MovieClip(mcFactory.generateMovieClipData(clipName || ""));

        return mc;
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
