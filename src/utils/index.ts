import axios from 'axios'

/**
 * 获取浏览器宽度
 * @returns {number}
 */
export function getClientWidth(): number {
  return document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth
}

/**
 * 加载文件
 * @param {string} url - 文件路径
 * @return {Promise<any>}
 */
export async function loadFile(url: string): Promise<any> {
  try {
    const res = await axios.get(url)
    return res.data
  } catch (err) {
    console.error('Error loading file:', err)
    throw err  // 抛出错误以便调用方处理
  }
}

/**
 * 对集合通过Key名称去重
 * @param {Object[]} collection - 要去重的集合
 * @param {string} keyName - 根据哪个key去重
 * @returns {Object[]}
 */
export function uniqueByKey<T>(collection: T[], keyName: keyof T): T[] {
  const map = new Map<any, T>()

  for (const item of collection) {
    if (!map.has(item[keyName])) {
      map.set(item[keyName], item)
    }
  }

  return Array.from(map.values())
}

/**
 * 转换时间字符串为秒数
 * @param {string} timeString - 时间字符串
 * @returns {number}
 */
function toSeconds(timeString: string): number {
  if (!timeString) return 0

  return timeString.split(':').reduce((acc, time) => (60 * acc) + parseFloat(time.replace(',', '.')), 0)
}

type SubTitleType = {
  sort: string
  text: string
  startTime: number
  endTime: number
}

/**
 * 解析字幕文件
 * @param {string} fileData - 字幕文件
 * @returns {SubTitleType[]}
 */
export function parseSubTitleFile(fileData: string): SubTitleType[] {
  return fileData
    .split(/\n\s*\n/g)
    .filter(item => item.trim() !== '')
    .map(item => {
      const textItem = item.split(/\n/)
      return {
        sort: textItem[0],
        text: textItem[2],
        startTime: toSeconds(textItem[1].split(' --> ')[0]),
        endTime: toSeconds(textItem[1].split(' --> ')[1])
      }
    })
}

/**
 * 通过时间匹配字幕
 * @param {number} currentTime - 当前时间
 * @param {SubTitleType[]} list - 字幕列表
 * @returns {string}
 */
export function matchSubTitleByTime(currentTime: number, list: SubTitleType[]): string {
  const subtitle = list.find(item => currentTime >= item.startTime && currentTime <= item.endTime)
  return subtitle ? subtitle.text : ''
}
