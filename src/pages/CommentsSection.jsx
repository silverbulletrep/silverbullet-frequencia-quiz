import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Heart, User } from 'lucide-react'
import styles from './Fim.module.scss'

import marianaImg from '../../img/I02.webp'
import carlosImg from '../../img/Gemini_Generated_Image_olb9snolb9snolb9.webp'
import luciaImg from '../../img/Gemini_Generated_Image_28com28com28com2.webp'

export default function CommentsSection() {
    const { t } = useTranslation()
    const [comments, setComments] = useState(() => [
        {
            id: 'c1',
            author: 'Hannah S.',
            time: `${t('comments.ago')} 4 ${t('comments.min')}`,
            text: t('comments.simulated.c1'),
            likes: 78,
            liked: false,
            replies: [],
        },
        {
            id: 'c2',
            author: 'Thomas Weber',
            time: `${t('comments.ago')} 12 ${t('comments.min')}`,
            text: t('comments.simulated.c2'),
            likes: 432,
            liked: false,
            replies: [
                {
                    id: 'c2r1',
                    author: 'Thomas Weber',
                    time: `${t('comments.ago')} 11 ${t('comments.min')}`,
                    text: t('comments.simulated.c2r1'),
                    likes: 92,
                    liked: false,
                },
            ],
        },
        {
            id: 'c3',
            author: 'Julia F.',
            time: `${t('comments.ago')} 45 ${t('comments.min')}`,
            text: t('comments.simulated.c3'),
            likes: 240,
            liked: false,
            replies: [],
        },
    ])
    const [expanded, setExpanded] = useState({ c2: true })
    const [draft, setDraft] = useState({})
    const [newDraft, setNewDraft] = useState('')

    function wrapLinks(text) {
        const cleanedText = String(text).replace(/^\s*Carlos Mendes:\s*/i, '')
        const key = 'Johan Müller'
        if (cleanedText.includes(key)) {
            const parts = cleanedText.split(key)
            return (
                <>
                    {parts[0]}<a href="#" className={styles.link} aria-label="Perfil de Johan Müller">{key}</a>{parts.slice(1).join(key)}
                </>
            )
        }
        return cleanedText
    }

    function toggleLike(commentId, replyId) {
        const operacao = 'comments.like_toggle'
        const dados_entrada = { commentId, replyId }
        try {
            console.log(`[COMMENTS] Iniciando operação: ${operacao}`, { dados_entrada })
            setComments((prev) => prev.map((c) => {
                if (c.id !== commentId) return c
                if (!replyId) {
                    const liked = !c.liked
                    return { ...c, liked, likes: Math.max(0, (c.likes || 0) + (liked ? 1 : -1)) }
                }
                const replies = (c.replies || []).map((r) => {
                    if (r.id !== replyId) return r
                    const liked = !r.liked
                    return { ...r, liked, likes: Math.max(0, (r.likes || 0) + (liked ? 1 : -1)) }
                })
                return { ...c, replies }
            }))
            console.log('[COMMENTS] Operação concluída com sucesso:', {
                id_resultado: commentId,
                timestamp: new Date().toISOString(),
            })
        } catch (error) {
            console.error(`[COMMENTS] Erro na operação: ${error.message}`, {
                dados_entrada,
                stack: error.stack,
                timestamp: new Date().toISOString(),
            })
        }
    }
    function addComment() {
        const operacao = 'comments.add_comment'
        const dados_entrada = { text: newDraft.trim() }
        try {
            console.log(`[COMMENTS] Iniciando operação: ${operacao}`, { dados_entrada })
            const text = newDraft.trim()
            if (!text) return
            const item = {
                id: `c_${Date.now()}`,
                author: t('comments.you'),
                time: t('comments.just_now'),
                text,
                likes: 0,
                liked: false,
                replies: [],
            }
            setComments((prev) => [item, ...prev])
            setNewDraft('')
            console.log('[COMMENTS] Operação concluída com sucesso:', {
                id_resultado: item.id,
                timestamp: new Date().toISOString(),
            })
        } catch (error) {
            console.error(`[COMMENTS] Erro na operação: ${error.message}`, {
                dados_entrada,
                stack: error.stack,
                timestamp: new Date().toISOString(),
            })
        }
    }

    function deleteComment(commentId) {
        const operacao = 'comments.delete_comment'
        const dados_entrada = { commentId }
        try {
            console.log(`[COMMENTS] Iniciando operação: ${operacao}`, { dados_entrada })
            const ok = window.confirm(t('comments.confirm_delete_comment'))
            if (!ok) return
            setComments((prev) => prev.filter((c) => c.id !== commentId))
            console.log('[COMMENTS] Operação concluída com sucesso:', {
                id_resultado: commentId,
                timestamp: new Date().toISOString(),
            })
        } catch (error) {
            console.error(`[COMMENTS] Erro na operação: ${error.message}`, {
                dados_entrada,
                stack: error.stack,
                timestamp: new Date().toISOString(),
            })
        }
    }

    function deleteReply(commentId, replyId) {
        const operacao = 'comments.delete_reply'
        const dados_entrada = { commentId, replyId }
        try {
            console.log(`[COMMENTS] Iniciando operação: ${operacao}`, { dados_entrada })
            const ok = window.confirm(t('comments.confirm_delete_reply'))
            if (!ok) return
            setComments((prev) => prev.map((c) => {
                if (c.id !== commentId) return c
                return { ...c, replies: (c.replies || []).filter((r) => r.id !== replyId) }
            }))
            console.log('[COMMENTS] Operação concluída com sucesso:', {
                id_resultado: replyId,
                timestamp: new Date().toISOString(),
            })
        } catch (error) {
            console.error(`[COMMENTS] Erro na operação: ${error.message}`, {
                dados_entrada,
                stack: error.stack,
                timestamp: new Date().toISOString(),
            })
        }
    }

    function addReply(commentId) {
        const operacao = 'comments.add_reply'
        const dados_entrada = { commentId, text: (draft[commentId] || '').trim() }
        try {
            console.log(`[COMMENTS] Iniciando operação: ${operacao}`, { dados_entrada })
            const text = (draft[commentId] || '').trim()
            if (!text) return
            setComments((prev) => prev.map((c) => {
                if (c.id !== commentId) return c
                const reply = {
                    id: `r_${Date.now()}`,
                    author: t('comments.you'),
                    time: t('comments.just_now'),
                    text,
                    likes: 0,
                    liked: false,
                    replies: [],
                }
                return { ...c, replies: [...(c.replies || []), reply] }
            }))
            setDraft((prev) => ({ ...prev, [commentId]: '' }))
            setExpanded((prev) => ({ ...prev, [commentId]: true }))
            console.log('[COMMENTS] Operação concluída com sucesso:', {
                id_resultado: commentId,
                timestamp: new Date().toISOString(),
            })
        } catch (error) {
            console.error(`[COMMENTS] Erro na operação: ${error.message}`, {
                dados_entrada,
                stack: error.stack,
                timestamp: new Date().toISOString(),
            })
        }
    }

    return (
        <div className={styles.comments} aria-label={t('comments.title')}>
            <div className={styles.newCommentForm} aria-label={t('comments.aria.add_new_comment')}>
                <div className={styles.newCommentAvatar} aria-hidden="true"><User size={16} /></div>
                <input className={styles.newCommentInput} value={newDraft} onChange={(e) => setNewDraft(e.target.value)} placeholder={t('comments.add_placeholder')} aria-label={t('comments.aria.new_comment_input')} />
                {newDraft.trim() && (
                    <button className={styles.newCommentSubmit} onClick={addComment} aria-label={t('comments.publish')}>{t('comments.publish')}</button>
                )}
            </div>
            {comments.map((c) => (
                <div key={c.id} id={`comment-${c.id}`} className={styles.commentItem}>
                    <div className={styles.avatar} aria-hidden="true">
                        {c.author === t('comments.you') ? (
                            <User size={14} />
                        ) : c.author === 'Hannah S.' ? (
                            <img src={marianaImg} alt="Hannah S." width="36" height="36" loading="lazy" decoding="async" />
                        ) : c.author === 'Thomas Weber' ? (
                            <img src={carlosImg} alt="Thomas Weber" width="36" height="36" loading="lazy" decoding="async" />
                        ) : c.author === 'Julia F.' ? (
                            <img src={luciaImg} alt="Julia F." width="36" height="36" loading="lazy" decoding="async" />
                        ) : null}
                    </div>
                    <div className={styles.commentContent}>
                        <div className={styles.commentHeader}>
                            <span className={styles.commentAuthor}><a href={`#comment-${c.id}`} className={styles.link}>{c.author}</a></span>
                            <span className={styles.dotSep}>·</span>
                            <span className={styles.commentTime}>{c.time}</span>
                        </div>
                        <div className={styles.commentText}>{wrapLinks(c.text)}</div>
                        <div className={styles.metaRow}>
                            <button className={`${styles.heart} ${c.liked ? styles.heartLiked : ''}`} onClick={() => toggleLike(c.id)} aria-pressed={c.liked} aria-label={c.liked ? t('comments.aria.unlike') : t('comments.aria.like')}>
                                <Heart size={18} />
                            </button>
                            <span className={styles.likesCount}>{c.likes} {t('comments.likes')}</span>
                            {!!(c.replies && c.replies.length) && <span className={styles.likesCount}>{c.replies.length} {t('comments.replies')}</span>}
                            {c.author === t('comments.you') && (
                                <button className={styles.trashButton} onClick={() => deleteComment(c.id)} aria-label={t('comments.delete_comment')}>🗑️</button>
                            )}
                        </div>
                        {expanded[c.id] && (
                            <>
                                <div className={styles.replyForm}>
                                    <input className={styles.replyInput} value={draft[c.id] || ''} onChange={(e) => setDraft((prev) => ({ ...prev, [c.id]: e.target.value }))} placeholder={t('comments.reply_placeholder')} />
                                    <button className={styles.replySubmit} onClick={() => addReply(c.id)}>{t('comments.publish')}</button>
                                </div>
                                {!!(c.replies && c.replies.length) && (
                                    <div className={styles.replyList} aria-label={`Respostas para ${c.author}`}>
                                        {c.replies.map((r) => (
                                            <div key={r.id} className={styles.replyItem}>
                                                <div className={styles.replyAvatar} aria-hidden="true">
                                                    {r.author === t('comments.you') ? (
                                                        <User size={12} />
                                                    ) : r.author === 'Hannah S.' ? (
                                                        <img src={marianaImg} alt="Hannah S." width="24" height="24" loading="lazy" decoding="async" />
                                                    ) : r.author === 'Thomas Weber' ? (
                                                        <img src={carlosImg} alt="Thomas Weber" width="24" height="24" loading="lazy" decoding="async" />
                                                    ) : r.author === 'Julia F.' ? (
                                                        <img src={luciaImg} alt="Julia F." width="24" height="24" loading="lazy" decoding="async" />
                                                    ) : null}
                                                </div>
                                                <div className={styles.replyContent}>
                                                    <div className={styles.commentHeader}>
                                                        <span className={styles.commentAuthor}><a href={`#comment-${c.id}`} className={styles.link}>{r.author}</a></span>
                                                        <span className={styles.dotSep}>·</span>
                                                        <span className={styles.commentTime}>{r.time}</span>
                                                    </div>
                                                    <div className={styles.commentText}>{wrapLinks(r.text)}</div>
                                                    <div className={styles.metaRow}>
                                                        <button className={`${styles.heart} ${r.liked ? styles.heartLiked : ''}`} onClick={() => toggleLike(c.id, r.id)} aria-pressed={r.liked} aria-label={r.liked ? t('comments.aria.unlike_reply') : t('comments.aria.like_reply')}>
                                                            <Heart size={16} />
                                                        </button>
                                                        <span className={styles.likesCount}>{r.likes} {t('comments.likes')}</span>
                                                        {r.author === 'Você' && (
                                                            <button className={styles.trashButton} onClick={() => deleteReply(c.id, r.id)} aria-label="Excluir resposta">🗑️</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
