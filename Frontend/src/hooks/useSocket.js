import { useEffect, useContext } from 'react'
import { SocketContext } from '../context/SocketContext'
import useReviewStore from '../store/reviewStore'

export const useSocket = (reviewId = null) => {
  const socket = useContext(SocketContext)
  const { addLiveUpdate, updateReviewStatus } = useReviewStore()

  useEffect(() => {
    if (!socket) return

    if (reviewId) {
      socket.emit('subscribe:review', { reviewId })
    }

    socket.on('review:queued', (data) => {
      addLiveUpdate({
        ...data,
        event:   'review:queued',
        message: `Review queued: ${data.prTitle || 'Manual Review'}`,
        time:    new Date().toLocaleTimeString(),
      })
    })

    socket.on('review:started', (data) => {
      addLiveUpdate({
        ...data,
        event:   'review:started',
        message: `Analysis started — ${data.totalFiles} file(s)`,
        time:    new Date().toLocaleTimeString(),
      })
      updateReviewStatus(data.reviewId, 'running')
    })

    socket.on('review:file:done', (data) => {
      addLiveUpdate({
        ...data,
        event:   'review:file:done',
        message: `${data.filename} — Score: ${data.fileScore} — ${data.issuesFound} issues`,
        time:    new Date().toLocaleTimeString(),
      })
    })

    socket.on('review:complete', (data) => {
      addLiveUpdate({
        ...data,
        event:   'review:complete',
        message: `Review complete — Score: ${data.overallScore}/100 | ${data.totalIssues} issues`,
        time:    new Date().toLocaleTimeString(),
      })
      updateReviewStatus(data.reviewId, 'completed', {
        overallScore: data.overallScore,
        totalIssues:  data.totalIssues,
      })
    })

    socket.on('review:failed', (data) => {
      addLiveUpdate({
        ...data,
        event:   'review:failed',
        message: `Review failed: ${data.error}`,
        time:    new Date().toLocaleTimeString(),
      })
      updateReviewStatus(data.reviewId, 'failed')
    })

    socket.on('review:posted', (data) => {
      addLiveUpdate({
        ...data,
        event:   'review:posted',
        message: `GitHub comments posted — ${data.postedCount} comments`,
        time:    new Date().toLocaleTimeString(),
      })
    })

    return () => {
      if (reviewId) socket.emit('unsubscribe:review', { reviewId })
      socket.off('review:queued')
      socket.off('review:started')
      socket.off('review:file:done')
      socket.off('review:complete')
      socket.off('review:failed')
      socket.off('review:posted')
    }
  }, [socket, reviewId])

  return { socket }
}