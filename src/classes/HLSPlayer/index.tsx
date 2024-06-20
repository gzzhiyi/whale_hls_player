import HLS from 'hls.js'
import { Parser } from 'm3u8-parser'
import { loadFile } from '@/utils'

type PropsType = {
  elem: HTMLVideoElement | string
  src: string
  onParsed?: Function
  onParseError?: Function
  onPlayError?: Function
}

export default class HLSPlayer {
  public levels: any[] = []

  private src: string
  private onParsed: Function | null
  private onParseError: Function | null
  private onPlayError: Function | null

  private hls: HLS
  private video: HTMLVideoElement

  constructor(props: PropsType) {
    // Props
    this.src = props.src
    this.onParsed = props.onParsed || null
    this.onParseError = props.onParseError || null
    this.onPlayError = props.onPlayError || null

    // Prototypes
    this.hls = new HLS()

    if (typeof props.elem === 'string') {
      this.video = document.querySelector(props.elem) || document.createElement('video')
    } else {
      this.video = props.elem
    }

    // Init
    this.init()
  }

  /**
   * 解析错误处理
   */
  private parseErrorHandle(err) {
    this.hls?.destroy()
    this.onParseError && this.onParseError(err)
  }

  /**
   * 解析视频分辨率
   */
  private parseLevels(list) {
    const filterArr = list.reduce((all, next) => (all.some((item) => item.label === next.label) ? all : [...all, next]), [])
    return filterArr
  }

  /**
   * 通过src解析视频
   */
  private async parseBySrc() {
    try {
      const data = await loadFile(this.src)
      const parser = new Parser()
      parser.push(data)
      parser.end()

      const parsedManifest = parser.manifest
      const urls = this.src.split('?')[0].split('/')
      const arr = urls.filter((item, index) => index + 1 !== urls.length)
      const list = parsedManifest.playlists.map((item, index) => ({
        label: `${item.attributes.RESOLUTION.height}P`,
        value: index,
        url: `${arr.join('/')}/${item.uri}`
      }))

      // 初始化浏览器链接
      this.video.src = list[0].url || ''
      this.video.load()

      // 画质
      this.levels = this.parseLevels(list)

      this.onParsed && this.onParsed(this.levels)
    } catch (err) {
      this.parseErrorHandle(err)
    }
  }

  /**
   * 通过HLS解释视频
   */
  private parseByHLS() {
    this.hls.loadSource(this.src)
    this.hls.attachMedia(this.video)

    this.hls.on(HLS.Events.MANIFEST_PARSED, (event, data) => { // Get video resolutions
      this.hls.currentLevel = -1

      const list = data.levels.map((item: any, index: number) => ({
        label: `${item.attrs.RESOLUTION.split('x')[1]}P`,
        value: index
      }))

      this.levels = this.parseLevels(list)
      this.onParsed && this.onParsed(this.levels)
    })

    this.hls.on(HLS.Events.ERROR, (event: any, data: any) => {
      if (data.fatal) {
        this.parseErrorHandle(event)
      } else {
        console.warn(event)
      }
    })
  }

  /**
   * 初始化
   */
  private async init() {
    if (this.video?.canPlayType('application/vnd.apple.mpegurl')) {
      this.parseBySrc()
    } else if (HLS.isSupported()) {
      this.parseByHLS()
    } else {
      this.parseErrorHandle('No supported video player.')
    }
  }

  /**
   * 播放
   */
  play() {
    this.video?.play().catch((err) => {
      console.error(err)
      this.onPlayError && this.onPlayError()
    })
  }

  /**
   * 暂停
   */
  pause() {
    this.video?.pause()
  }

  /**
   * 销毁
   */
  destory() {
    this.hls?.stopLoad()
    this.hls?.detachMedia()
    this.hls?.destroy()
  }
}
