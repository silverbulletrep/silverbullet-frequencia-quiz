import React, { useMemo, useState } from 'react'
import { Star, Heart, MessageSquare } from 'lucide-react'
import styles from './VSLComments.module.scss'
import { useTranslation } from 'react-i18next'

function formatTimeAgo(iso, t) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days >= 1) return t(days === 1 ? 'vsl_comments.time_ago.day' : 'vsl_comments.time_ago.days', { count: days })
  if (hours >= 1) return t(hours === 1 ? 'vsl_comments.time_ago.hour' : 'vsl_comments.time_ago.hours', { count: hours })
  return t('vsl_comments.time_ago.minutes', { count: minutes })
}

function Stars({ rating = 5 }) {
  const { t } = useTranslation()
  const icons = new Array(5).fill(0)
  return (
    <span className={styles.stars} aria-label={t('vsl_comments.rating_aria', { rating })}>{icons.map((_, i) => (<Star key={i} size={16} />))}</span>
  )
}

function CommentCard({ c, onLike, liked, onToggleReply, showReplyBox, onSubmitReply }) {
  const { t } = useTranslation()
  const totalReplies = (c.replies || []).length
  const rating = 5
  const initials = (c.author_name || 'U').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()
  return (
    <li className={styles.card} role="listitem">
      <div className={styles.cardTop}>
        <div className={styles.avatar} aria-hidden="true">{initials}</div>
        <div className={styles.meta}>
          <div className={styles.authorRow}>
            <p className={styles.authorName}>{c.author_name}</p>
            <p className={styles.timeAgo}>{formatTimeAgo(c.created_at || Date.now(), t)}</p>
          </div>
          <div className={styles.ratingRow}>
            <Stars rating={rating} />
            <span className={styles.ratingText}>{rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <p className={styles.content}>{c.content}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.actionBtn} onClick={() => onLike(c)} aria-pressed={!!liked} aria-label={t('comments.aria.like')}>
          <Heart size={16} />
          <span>{c.likes + (liked ? 1 : 0)}</span>
        </button>
        <button type="button" className={styles.actionBtn} onClick={() => onToggleReply(c)} aria-expanded={!!showReplyBox} aria-controls={`reply-${c.id}`}>
          <MessageSquare size={16} />
          <span>{t('vsl_comments.replies_count', { count: totalReplies })}</span>
        </button>
      </div>
      {showReplyBox && (
        <div className={styles.replyBox} id={`reply-${c.id}`}>
          <input className={styles.replyInput} type="text" placeholder={t('vsl_comments.reply_placeholder')} aria-label={t('comments.aria.new_comment_input')} onKeyDown={(e) => { if (e.key === 'Enter') onSubmitReply(c, e.currentTarget.value) }} />
          <button type="button" className={styles.sendBtn} onClick={(e) => {
            const box = e.currentTarget.previousSibling
            onSubmitReply(c, box?.value || '' )
          }}>{t('vsl_comments.send')}</button>
        </div>
      )}
      {totalReplies > 0 && (
        <div className={styles.listReplies}>
          {(c.replies || []).map((r) => (
            <div key={r.id} className={styles.replyItem}>
              <div className={styles.authorRow}>
                <p className={styles.authorName}>{r.author_name}</p>
                <p className={styles.timeAgo}>{formatTimeAgo(r.created_at || Date.now(), t)}</p>
              </div>
              <p className={styles.content}>{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </li>
  )
}

export default function VSLComments() {
  const { t } = useTranslation()
  const operacao = 'comments.render'
  try { console.log(`[COMMENTS] Iniciando operação: ${operacao}`) } catch {}
  const pinned = data.pinned_comment
  const base = data.comments || []
  const [comments, setComments] = useState(base)
  const [likedMap, setLikedMap] = useState({})
  const [replyBoxMap, setReplyBoxMap] = useState({})
  const [newComment, setNewComment] = useState('')
  const sorted = useMemo(() => {
    return [...comments].sort((a, b) => (b.likes + (b.reactions?.insightful || 0)) - (a.likes + (a.reactions?.insightful || 0)))
  }, [comments])

  function onLike(c) {
    const prev = !!likedMap[c.id]
    const next = { ...likedMap, [c.id]: !prev }
    setLikedMap(next)
    setComments((arr) => arr.map((it) => it.id === c.id ? { ...it, likes: it.likes + (prev ? -1 : 1) } : it))
    try { console.log('[COMMENTS] like', { id: c.id, liked: !prev }) } catch {}
  }
  function onToggleReply(c) {
    const prev = !!replyBoxMap[c.id]
    const set = { ...replyBoxMap, [c.id]: !prev }
    setReplyBoxMap(set)
    try { console.log('[COMMENTS] toggle_reply', { id: c.id, expanded: !prev }) } catch {}
  }
  function onSubmitReply(c, text) {
    const tVal = String(text || '').trim()
    if (!tVal) return
    const reply = { id: `local_${Date.now()}`, author_name: t('vsl_comments.you'), content: tVal, likes: 0, created_at: new Date().toISOString() }
    setComments((arr) => arr.map((it) => it.id === c.id ? { ...it, replies: [...(it.replies || []), reply] } : it))
    setReplyBoxMap({ ...replyBoxMap, [c.id]: false })
    try { console.log('[COMMENTS] reply_submitted', { parent_id: c.id }) } catch {}
  }
  function onSubmitComment() {
    const tVal = String(newComment || '').trim()
    if (!tVal) return
    const item = { id: `local_${Date.now()}`, author_name: t('vsl_comments.you'), content: tVal, likes: 0, created_at: new Date().toISOString(), replies: [] }
    setComments((arr) => [item, ...arr])
    setNewComment('')
    try { console.log('[COMMENTS] comment_submitted') } catch {}
  }

  return (
    <section className={styles.commentsContainer} aria-label={t('vsl_comments.section_aria')}>
      <h2 className={styles.heading}>{t('vsl_comments.heading')}</h2>
      <div className={styles.inputBox} role="form" aria-label={t('vsl_comments.send_comment_aria')}>
        <textarea className={styles.commentInput} value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={t('vsl_comments.write_comment')} aria-label={t('vsl_comments.comment_field_aria')} />
        <button type="button" className={styles.sendBtn} onClick={onSubmitComment}>{t('vsl_comments.send')}</button>
      </div>
      {pinned && (
        <div className={styles.card} aria-label={t('vsl_comments.pinned_comment_aria')}>
          <div className={styles.cardTop}>
            <div className={styles.avatar} aria-hidden="true">EP</div>
            <div className={styles.meta}>
              <div className={styles.authorRow}>
                <p className={styles.authorName}>{pinned.author}</p>
                <p className={styles.timeAgo}>{formatTimeAgo(pinned.created_at || Date.now(), t)}</p>
              </div>
              <div className={styles.ratingRow}>
                <Stars rating={5} />
                <span className={styles.ratingText}>5.0</span>
              </div>
            </div>
          </div>
          <p className={styles.content}>{pinned.content}</p>
          <div className={styles.actions}>
            <button type="button" className={styles.actionBtn} aria-label={t('vsl_comments.like_pinned_aria')}>
              <Heart size={16} />
              <span>{pinned.likes}</span>
            </button>
          </div>
        </div>
      )}
      <ul className={styles.list} role="list">
        {sorted.map((c) => (
          <CommentCard
            key={c.id}
            c={c}
            onLike={onLike}
            liked={!!likedMap[c.id]}
            onToggleReply={onToggleReply}
            showReplyBox={!!replyBoxMap[c.id]}
            onSubmitReply={onSubmitReply}
          />
        ))}
      </ul>
    </section>
  )
}

