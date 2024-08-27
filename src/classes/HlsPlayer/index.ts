import HLS from 'hls.js'
import { Parser } from 'm3u8-parser'
import { getClientWidth, loadFile } from '@/utils'

type PropsType = {
  elem: HTMLVideoElement | string
  src: string
  onParsed?: (levels: LevelType[]) => void
  onError?: (err: any) => void
}

type LevelType = {
  label: string
  url: string
  value: number
}

export default class HlsPlayer {
  public levels: LevelType[] = []
  private src: string
  private onParsed: ((levels: LevelType[]) => void) | null
  private onError: ((err: any) => void) | null
  private hls: HLS
  private video: HTMLVideoElement

  constructor(props: PropsType) {
    this.src = props.src
    this.onParsed = props.onParsed || null
    this.onError = props.onError || null
    this.hls = new HLS()
    this.video = this.getVideoElement(props.elem)

    this.init()
  }

  private getVideoElement(elem: HTMLVideoElement | string): HTMLVideoElement {
    if (typeof elem === 'string') {
      return document.querySelector(elem) || document.createElement('video')
    }
    return elem
  }

  private sortByLevels(list: LevelType[] = []): LevelType[] {
    return list.sort((a, b) => parseInt(a.label) - parseInt(b.label))
  }

  private matchLevels(): LevelType {
    const pixelRatio = window.devicePixelRatio || 1
    const clientWidth = getClientWidth()
    return this.levels.find(level => (clientWidth * pixelRatio) <= parseInt(level.label)) || this.levels[0]
  }

  private handleError(err: any, context: string): void {
    console.error(`[${context} error]`, err)
    this.onError?.(err)
  }

  private parseLevels(list: LevelType[]): LevelType[] {
    return Array.from(new Set(list.map(item => item.label))).map(label => list.find(item => item.label === label)!)
  }

  private async parseBySrc(): Promise<void> {
    try {
      const data = await loadFile(this.src)
      const baseUrl = this.src.substring(0, this.src.lastIndexOf('/'))

      const parser = new Parser()
      parser.push(data)
      parser.end()

      const parsedManifest = parser.manifest
      if (!parsedManifest?.playlists) {
        this.video.src = this.src
        this.video.load()
        this.onParsed?.(this.levels)
        return
      }

      const list = parsedManifest.playlists.map(item => ({
        label: `${item?.attributes?.RESOLUTION?.width}P`,
        url: `${baseUrl}/${item?.uri}`
      }))

      if (list.length > 0) {
        this.levels = this.sortByLevels(this.parseLevels(list))
        const currentLevel = this.matchLevels()
        this.video.src = currentLevel?.url || ''
        this.video.load()
      }

      this.onParsed?.(this.levels)
    } catch (err) {
      this.handleError(err, 'Parse by Src')
    }
  }

  private parseByHLS(): void {
    this.hls.loadSource(this.src)
    this.hls.attachMedia(this.video)

    this.hls.on(HLS.Events.MANIFEST_PARSED, (event, data) => {
      this.hls.currentLevel = -1

      const list = data.levels
        .filter(item => item.width > 0)
        .map((item, index) => ({
          label: `${item.width}P`,
          url: item.url[0],
          value: index
        }))

      if (list.length > 0) {
        this.levels = this.sortByLevels(this.parseLevels(list))
      }

      this.onParsed?.(this.levels)
    })

    this.hls.on(HLS.Events.ERROR, (event, data) => {
      if (data.fatal) {
        this.handleError(event, 'HLS')
        this.hls.destroy()
      } else {
        console.warn(event)
      }
    })
  }

  private async init(): Promise<void> {
    if (this.video?.canPlayType('application/vnd.apple.mpegurl')) {
      await this.parseBySrc()
    } else if (HLS.isSupported()) {
      this.parseByHLS()
    } else {
      this.handleError('No supported video player', 'Initialization')
    }
  }

  play(): void {
    this.video?.play().catch(err => this.handleError(err, 'Play'))
  }

  pause(): void {
    this.video?.pause()
  }

  destroy(): void {
    this.hls?.destroy()
    this.video.src = ''
  }
}
