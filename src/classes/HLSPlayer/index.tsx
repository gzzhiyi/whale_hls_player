import axios from 'axios'
import HLS from 'hls.js'
import { Parser } from 'm3u8-parser'
import { getUA } from '../../utils'

type PropsType = {
  elem: HTMLVideoElement | string
  src: string
  onReady: Function
  onError: Function
}

const ua = getUA()

export default class HLSPlayer {
  public levels: any[] = []
  public subtitles: any[] = []

  private video: HTMLVideoElement
  private hls: HLS
  private src: string

  private onReady: Function | null
  private onError: Function | null

  constructor(props: PropsType) {
    // Props
    this.onReady = props.onReady || null
    this.onError = props.onError || null

    this.hls = new HLS()
    this.src = props.src

    if (typeof props.elem === 'string') {
       this.video = document.querySelector(props.elem) || document.createElement('video')
    } else {
      this.video = props.elem
    }

    // Init
    this.init()
  }

  play() {
    this.video.play()
  }

  pause() {
    this.video.pause()
  }

  /**
   * 初始化
   */
  async init() {
    if (ua.ios && this.video?.canPlayType('application/vnd.apple.mpegurl')) { // IOS
      this.parseManifest(this.src)
    } else if (HLS.isSupported()) { // 安卓
      this.hls.loadSource(this.src)
      this.hls.attachMedia(this.video)
      this.hls.on(HLS.Events.MANIFEST_PARSED, (event, data) => { // 获取视频清晰度
        this.hls.currentLevel = -1

        const list = data.levels.map((item: any, index: number) => ({
          label: `${item.attrs.RESOLUTION.split('x')[1]}P`,
          value: index
        }))

        this.levels = this.getLevels(list)
      })

      this.hls.on(HLS.Events.ERROR, (event: any, data: any) => { // 错误处理
        if (data.fatal) {
          this.errorHandle(event)
        } else {
          console.warn(event)
        }
      })
    } else {
      this.errorHandle('No supported video player.')
    }
  }

  /**
   * 通过时间匹配字幕
   */
  mappingSubTitle(currentTime: number, list: any) {
    let str = ''

    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      const { startTime, endTime, text } = item

      if ((currentTime >= startTime) && (currentTime <= endTime)) {
        str = text
        break
      }
    }

    return str
  }

  /**
   * 销毁
   */
  destory() {
    this.hls?.stopLoad()
    this.hls?.detachMedia()
  }

  /**
   * 解析画质
   */
  getLevels(list) {
    const filterArr = list.reduce((all, next) => (all.some((item) => item.label === next.label) ? all : [...all, next]), [])

    return [
      { label: 'Automatic', value: '' },
      ...filterArr
    ]
  }

  errorHandle(err) {
    this.hls.destroy()
    this.onError && this.onError(err)
    console.error(err)
  }

  /**
   * IOS加载视频文件
   */
  async loadManifestFile(src: string) {
    try {
      const res = await axios.get(src)
      return res.data
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * 解析IOS加载视频文件
   */
  async parseManifest(src: string) {
    try {
      const data = await this.loadManifestFile(src)
      const parser = new Parser()
      parser.push(data)
      parser.end()

      const parsedManifest = parser.manifest
      const urls = src.split('?')[0].split('/')
      const arr = urls.filter((item, index) => index + 1 !== urls.length)
      const list = parsedManifest.playlists.map((item, index) => ({
        label: `${item.attributes.RESOLUTION.height}P`,
        value: index,
        url: `${arr.join('/')}/${item.uri}`
      }))

      // 画质
      this.levels = this.getLevels(list)

      // 初始化浏览器链接
      this.video.src = list[0].url || ''
      this.video.load()

      // 兼容微信、微博浏览器IOS端的问题
      if (ua.wechat || ua.weibo) {
        this.onReady && this.onReady()
      }
    } catch (err) {
      this.errorHandle(err)
    }
  }
}
