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

/**
 * 格式化字幕文件
 */
export function parseSubTitleFile(data: string) {
  const list: any[] = []

  data
    .split(/\n\s*\n/g)
    .filter((item) => item !== '')
    .map((item, index) => {
      const textItem = item.split(/\n/)
      list.push({
        index,
        sort: textItem[0],
        text: textItem[2],
        startTime: toSeconds(textItem[1].split(' --> ')[0]),
        endTime: toSeconds(textItem[1].split(' --> ')[1]),
        timeLine: textItem[1]
      })
      return false
    })

  return list
}

/**
 * 加载字幕文件
 */
export async function loadSubTitleFile(url: string) {
  try {
    const res = await axios.get(url)
    return parseSubTitleFile(res.data)
  } catch (err) {
    console.error(err)
  }
  return false
}
