type PropsType = {
    elem: HTMLVideoElement | string;
    src: string;
    onParsed?: (levels: LevelType[]) => void;
    onError?: (err: any) => void;
};
type LevelType = {
    label: string;
    url: string;
    value: number;
};
export default class HlsPlayer {
    levels: LevelType[];
    private src;
    private onParsed;
    private onError;
    private hls;
    private video;
    constructor(props: PropsType);
    private getVideoElement;
    private sortByLevels;
    private matchLevels;
    private handleError;
    private parseLevels;
    private parseBySrc;
    private parseByHLS;
    private init;
    play(): void;
    pause(): void;
    destroy(): void;
}
export {};
