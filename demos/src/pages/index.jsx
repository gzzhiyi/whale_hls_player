import { useEffect, useRef } from 'react'
import { HLSPlayer } from '../../dist/components/index.esm.js'
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

  useEffect(() => {
    player.current = new HLSPlayer({
      elem: video.current,
      src: url1
    })
  }, [])

  return (
    <>
      <video ref={video} />
      <div className={Styles.test}>
        <div className={Styles.test__btn} onClick={play}>Play</div>
        <div className={Styles.test__btn} onClick={pause}>Pause</div>
      </div>
    </>
  )
}
