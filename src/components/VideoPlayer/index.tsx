'use client'

import MuxPlayer from '@mux/mux-player-react'

import styles from './VideoPlayer.module.scss'

export function VideoPlayer({
  playbackId,
  title,
  poster,
}: {
  playbackId: string
  title: string
  poster?: string | null
}) {
  return (
    <div className={styles.frame}>
      <MuxPlayer
        playbackId={playbackId}
        poster={poster ?? undefined}
        metadata={{ video_title: title }}
        accentColor="#ffffff"
        primaryColor="#ffffff"
        secondaryColor="#000000"
        streamType="on-demand"
        className={styles.player}
      />
    </div>
  )
}
