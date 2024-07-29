import { useEffect, useRef } from 'react'
import { HlsPlayer } from '../../dist/components/index.esm.js'
import Styles from './index.module.less'

export default () => {
  const url1 = 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8'
  // const url2 = 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8'

  const video = useRef(null)
  const player = useRef(null)

  const play = () => {
    player.current.play()
  }

  const pause = () => {
    player.current.pause()
  }

  const ready = () => {
    console.log('Ready!')
  }

  const onParsed = (levels) => {
    console.log('Parsed!')
    console.log(levels)
  }

  const onParseError = (err) => {
    console.error(err)
  }

  useEffect(() => {
    player.current = new HlsPlayer({
      elem: video.current,
      src: url1,
      onParsed,
      onParseError
    })
  }, [])

  return (
    <>
      <div className={Styles.container}>
        <video ref={video} playsInline onCanPlayThrough={ready} />
      </div>
      <div className={Styles.test}>
        <div className={Styles.test__btn} onClick={play}>Play</div>
        <div className={Styles.test__btn} onClick={pause}>Pause</div>
      </div>
    </>
  )
}
