export declare function getUA(): {
    trident: boolean;
    presto: boolean;
    webKit: boolean;
    gecko: boolean;
    safari: boolean;
    mobile: boolean;
    ios: boolean;
    android: boolean;
    iPhone: boolean;
    iPad: boolean;
    weibo: boolean;
    wechat: boolean;
};
export declare function loadFile(url: string): Promise<any>;
type SubTitleType = {
    sort: string;
    text: string;
    startTime: number;
    endTime: number;
};
export declare function parseSubTitleFile(fileData: string): SubTitleType[];
export declare function matchSubTitleByTime(currentTime: number, list: SubTitleType[]): string;
export {};
