type PropsType = {
    elem: HTMLVideoElement | string;
    src: string;
    onParsed?: Function;
    onParseError?: Function;
    onPlayError?: Function;
};
export default class HLSPlayer {
    levels: any[];
    private src;
    private onParsed;
    private onParseError;
    private onPlayError;
    private hls;
    private video;
    constructor(props: PropsType);
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
