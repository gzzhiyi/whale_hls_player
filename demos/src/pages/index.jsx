import { useEffect, useRef } from 'react'
import { HlsPlayer } from '../../dist/components/index.esm.js'
import Styles from './index.module.less'

export default () => {
  // const url = 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8'
  // const url = 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8'
  const url = 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/level_1.m3u8'

  const player = useRef(null)
  const video = useRef(null)

  const onError = (err) => {
    console.error(err)
  }

  const onParsed = (levels) => {
    console.log('Parsed!')
    console.log(levels)
  }

  const pause = () => {
    player.current.pause()
  }

  const play = () => {
    player.current.play()
  }

  const ready = () => {
    console.log('Ready!')
  }

  useEffect(() => {
    player.current = new HlsPlayer({
      elem: video.current,
      onError,
      onParsed,
      src: url
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
