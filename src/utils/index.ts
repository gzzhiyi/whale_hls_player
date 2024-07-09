import axios from 'axios'

/**
 * 获取浏览器宽度
 * @returns {number}
 */
export function getClientWidth() {
  return document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth
}

/**
 * 加载文件
 * @param {string} url - 文件路径
 * @return {Object}
 */
export async function loadFile(url: string) {
  try {
    const res = await axios.get(url)
    return res.data
  } catch (err) {
    console.error(err)
  }
}

/**
 * 对集合通过Key名称去重
 * @param {Object[]} collention
 * @param {string} keyName
 * @returns {Object[]}
 */
export function uniqueByKey(collention, keyName) {
  const map = new Map()

  collention.forEach(item => {
    if (!map.has(item[keyName])) {
      map.set(item[keyName], item)
    }
  })

  return Array.from(map.values())
}

/**
 * 转秒
 * @param {string} t
 * @returns {string}
 */
function toSeconds(t: string) {
  let s = 0.0
  if (t) {
    const p = t.split(':')
    for (let i = 0; i < p.length; i++) {
      s = s * 60 + parseFloat(p[i].replace(',', '.'))
    }
  }
  return s
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
  const list: SubTitleType[] = []

  fileData
    .split(/\n\s*\n/g)
    .filter((item) => item !== '')
    .map((item) => {
      const textItem = item.split(/\n/)
      list.push({
        sort: textItem[0],
        text: textItem[2],
        startTime: toSeconds(textItem[1].split(' --> ')[0]),
        endTime: toSeconds(textItem[1].split(' --> ')[1])
      })
      return false
    })

  return list
}

/**
 * 通过时间匹配字幕
 * @param {number} currentTime - 当前时间
 * @param {SubTitleType[]} list - 字幕列表
 * @returns {string}
 */
export function matchSubTitleByTime(currentTime: number, list: SubTitleType[]) {
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
