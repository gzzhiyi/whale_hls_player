type PropsType = {
    elem: HTMLVideoElement | string;
    src: string;
    onParsed?: Function;
    onError?: Function;
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
    private sortByLevels;
    private matchLevels;
    private parseErrorHandle;
    private parseLevels;
    private parseBySrc;
    private parseByHLS;
    private init;
    play(): void;
    pause(): void;
    destory(): void;
}
export {};
