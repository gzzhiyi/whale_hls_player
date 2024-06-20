import axios from 'axios'

/**
 * 获取浏览器 UA
 * @return {object}
 */
export function getUA () {
  const u = window.navigator.userAgent

  return {
    trident: u.includes('Trident'), // IE内核
    presto: u.includes('Presto'), // opera内核
    webKit: u.includes('AppleWebKit'), // 苹果、谷歌内核
    gecko: u.includes('Gecko'), // 火狐内核
    safari: u.includes('Safari'), // safari浏览器
    mobile: !!u.match(/AppleWebKit.*Mobile.*/), // 移动终端
    ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), // ios终端
    android: u.includes('Android') || u.includes('Linux'), // android或uc浏览器
    iPhone: u.includes('iPhone'), // iPhone或QQHD浏览器
    iPad: u.includes('iPad'), // iPad
    weibo: u.toLowerCase().includes('weibo'), // 微博
    wechat: u.toLowerCase().includes('micromessenger') // 微信
  }
}

/**
 * 加载文件
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
 * 转秒
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
 * 格式化字幕文件
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
 * @param {number} currentTime
 * @param {SubTitleType[]} list
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
