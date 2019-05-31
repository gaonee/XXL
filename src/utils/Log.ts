enum LOG_LEVEL {
    ERROR,
    WARN,
    INFO,
    DEBUG
}

class Log {
    private static level: number = LOG_LEVEL.DEBUG;

    public static setLevel(level: number) {
        this.level = level;
    }
    
    public static debug(info) {
        if (this.level >= LOG_LEVEL.DEBUG) {
            console.log("[DEBUG] " + info);
        }
    }
    public static info(info) {
        if (this.level >= LOG_LEVEL.INFO) {
            console.log("[INFO] " + info);
        }
    }
    public static warn(info) {
        if (this.level >= LOG_LEVEL.WARN) {
            console.warn("[WARN] " + info);
        }
    }
    public static error(info) {
        if (this.level >= LOG_LEVEL.ERROR) {
            console.error("[ERROR] " + info);
        }
    }
}
