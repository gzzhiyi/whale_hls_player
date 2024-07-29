export declare function getClientWidth(): number;
export declare function loadFile(url: string): Promise<any>;
export declare function uniqueByKey(collention: any, keyName: any): any[];
type SubTitleType = {
    sort: string;
    text: string;
    startTime: number;
    endTime: number;
};
export declare function parseSubTitleFile(fileData: string): SubTitleType[];
export declare function matchSubTitleByTime(currentTime: number, list: SubTitleType[]): string;
export {};
