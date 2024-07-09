import HLS from 'hls.js'
import { Parser } from 'm3u8-parser'
import { getClientWidth, loadFile, uniqueByKey } from '@/utils'

type PropsType = {
  elem: HTMLVideoElement | string
  src: string
  onParsed?: Function
  onError?: Function
}

type LevelType = {
  label: string
  url: string
  value: number
}

export default class HLSPlayer {
  public levels: LevelType[] = []

  private src: string
  private onParsed: Function | null
  private onError: Function | null

  private hls: HLS
  private video: HTMLVideoElement

  constructor(props: PropsType) {
    // Props
    this.src = props.src
    this.onParsed = props.onParsed || null
    this.onError = props.onError || null

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
    console.error('[Parse error]')
    this.onError && this.onError(err)
  }

  /**
   * 解析视频分辨率
   */
  private parseLevels(list) {
    const filterArr = list.reduce((all, next) => (all.some((item) => item.label === next.label) ? all : [...all, next]), [])
    return filterArr
  }

  /**
   * 通过分辨率进行排序
   */
  private sortByResolutions(list = []) {
    return list.sort((a: LevelType, b: LevelType) => {
      const labelA = parseInt(a.label)
      const labelB = parseInt(b.label)

      return labelA - labelB
    })
  }

  /**
   * 匹配终端适配的分辨率
   */
  private matchLevels() {
    const pixelRatio = window.devicePixelRatio || 0
    const clientWidth = getClientWidth()

    let selectedLevel = this.levels[0]

    for (let i = 0; i < this.levels.length; i++) {
      if ((clientWidth * pixelRatio) <= parseInt(this.levels[i].label)) {
        selectedLevel = this.levels[i]
        break
      }
    }

    return selectedLevel
  }

  /**
   * 通过src解析视频
   */
  private async parseBySrc() {
    try {
      const data = await loadFile(this.src)

      const lastSlashIndex = this.src.lastIndexOf('/')
      const baseUrl = this.src.substring(0, lastSlashIndex)

      const parser = new Parser()
      parser.push(data)
      parser.end()

      const parsedManifest = parser.manifest
      if (!parsedManifest?.playlists) {
        return []
      }

      let list = parsedManifest.playlists.map((item) => ({
        label: `${item?.attributes?.RESOLUTION?.width}P`,
        url: `${baseUrl}/${item?.uri}`
      }))

      list = uniqueByKey(list, 'label')

      // 画质
      this.levels = this.sortByResolutions(this.parseLevels(list))

      // 初始化浏览器链接
      const currentLevel = this.matchLevels()
      this.video.src = currentLevel?.url || ''
      this.video.load()

      // 回调
      this.onParsed && this.onParsed(this.levels)
    } catch (err) {
      this.parseErrorHandle(err)
    }
  }

  /**
   * 通过HLS解释视频
   */
  private parseByHLS() {
    try {
      this.hls.loadSource(this.src)
      this.hls.attachMedia(this.video)

      this.hls.on(HLS.Events.MANIFEST_PARSED, (event, data) => { // Get video resolutions
        this.hls.currentLevel = -1

        const list = data.levels.map((item, index: number) => ({
          label: `${item.width}P`,
          url: item.url[0],
          value: index
        }))

        // 画质
        this.levels = this.sortByResolutions(this.parseLevels(list))

        // 回调
        this.onParsed && this.onParsed(this.levels)
      })

      this.hls.on(HLS.Events.ERROR, (event, data) => {
        if (data.fatal) {
          this.parseErrorHandle(event)
        } else {
          console.warn(event)
        }
      })
    } catch (err) {
      this.parseErrorHandle(err)
    }
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
      console.error('[Play error]')
      this.onError && this.onError(err)
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
