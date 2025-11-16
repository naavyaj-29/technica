import React, { useState, useRef } from "react";
import { Upload, Heart, MessageCircle, Share2, Send } from "lucide-react";

const styles = {
  container: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "20px",
  },

  composer: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    marginBottom: "24px",
  },

  composerHeader: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "12px",
  },

  composerAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#f3f4f6,#e9d5ff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#4b5563",
  },

  textArea: {
    width: "100%",
    minHeight: "80px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    resize: "vertical",
    marginBottom: "12px",
  },

  uploadButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#f3f4f6",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    border: "none",
    fontSize: "14px",
  },

  submitButton: {
    background: "linear-gradient(45deg, #8b5cf6 0%, #ec4899 100%)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  postCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    marginBottom: "24px",
  },
  entriesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  entryCard: {
    backgroundColor: 'white',
    padding: '18px',
    borderRadius: '12px',
    boxShadow: '0 6px 18px -8px rgba(0,0,0,0.12)',
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
    cursor: 'pointer'
  },
  entryCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  entryTitle: {
    fontSize: '16px',
    fontWeight: 700,
    margin: 0,
    color: '#111827'
  },
  sentimentBadge: {
    padding: '6px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    color: 'white',
    fontWeight: 600
  },
  entryContent: {
    color: '#374151',
    marginBottom: '12px',
    lineHeight: 1.5
  },
  entryMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#9ca3af'
  },
  emotionTags: {
    marginTop: '12px',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  emotionTag: {
    padding: '4px 10px',
    backgroundColor: '#eef2ff',
    color: '#3730a3',
    fontSize: '12px',
    borderRadius: '9999px'
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#e5e7eb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "600",
  },

  username: {
    fontWeight: "600",
    fontSize: "15px",
    margin: 0,
  },

  timestamp: {
    fontSize: "12px",
    color: "#6b7280",
  },

  text: {
    marginTop: "12px",
    marginBottom: "12px",
    fontSize: "15px",
    color: "#374151",
    lineHeight: "1.5",
  },

  image: {
    width: "100%",
    borderRadius: "8px",
    marginTop: "12px",
  },

  video: {
    width: "100%",
    borderRadius: "8px",
    marginTop: "12px",
  },

  actionRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "12px",
  },

  actionButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid #e6e6e6",
    background: "transparent",
    cursor: "pointer",
    fontSize: "14px",
  },

  likeCount: {
    fontSize: "13px",
    color: "#6b7280",
    marginLeft: "auto",
  },

  commentSection: {
    marginTop: "12px",
    borderTop: "1px solid #f3f4f6",
    paddingTop: "12px",
  },

  commentItem: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
    marginBottom: "8px",
  },

  commentAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    color: "#4f46e5",
  },

  commentBubble: {
    background: "#f8fafc",
    padding: "8px 12px",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#374151",
  },

  commentComposer: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
  },

  commentInput: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
  },
  /* Instagram-like styles */
  postMedia: {
    width: '100%',
    height: 480,
    backgroundColor: '#111827',
    borderRadius: 12,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  postImage: { width: '100%', height: '100%', objectFit: 'cover' },
  heartOverlay: { position: 'absolute', zIndex: 20, pointerEvents: 'none', transform: 'translate(-50%, -50%)', left: '50%', top: '50%', fontSize: 120, opacity: 0.95, color: 'white', textShadow: '0 6px 30px rgba(0,0,0,0.5)' },
  viewComments: { color: '#6b7280', fontSize: 13, marginTop: 8, cursor: 'pointer' },
};

export default function CommunityPage({ currentUser }) {
  // Mock sample posts to demonstrate features
  const mockPosts = [
    {
      id: '1',
      user: 'Sarah Chen',
      timestamp: '2 hours ago',
      text: 'Just ate a meal with friends. Tried a new cuisine today!',
      image: null,
      video: null,
      likes: 24,
      liked: false,
      showHeart: false,
      comments: [
        { id: '1a', user: 'Alex Johnson', text: 'That\'s awesome!' },
        { id: '1b', user: 'Jordan Lee', text: 'Love it! I wish I could try too.' }
      ]
    },
    {
      id: '2',
      user: 'Marcus Thompson',
      timestamp: '4 hours ago',
      text: 'Finally tried Biryani. Made me feel at home!',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a104?w=800&q=80',
      video: null,
      likes: 56,
      liked: false,
      showHeart: false,
      comments: [
        { id: '2a', user: 'Emma Davis', text: 'That\'s amazing!' },
      ]
    },
    {
      id: '3',
      user: 'Nina Patel',
      timestamp: '6 hours ago',
      text: 'Tried some homemade herbal tea!',
      image: 'https://images.unsplash.com/photo-1597318972595-9c87ad0e1ae5?w=800&q=80',
      video: null,
      likes: 42,
      liked: false,
      showHeart: false,
      comments: []
    },
    {
      id: '4',
      user: 'James Wilson',
      timestamp: '8 hours ago',
      text: 'Can anyone explain what the origin of Gulab Jamun is?',
      image: null,
      video: null,
      likes: 18,
      liked: false,
      showHeart: false,
      comments: [
        { id: '4a', user: 'Sarah Chen', text: 'I\'m not sure, I\'d love to hear about it too!' },
        { id: '4b', user: 'Marcus Thompson', text: 'It was invented in medieval India' },
        { id: '4c', user: 'Nina Patel', text: 'Yeah but\'s roots are traced back to a Persian dish' }
      ]
    }
  ];

  const [posts, setPosts] = useState(mockPosts);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const fileRef = useRef();

  const submitPost = () => {
    if (!text.trim() && !media) return;

    const postId = Date.now().toString();

    const finalize = ({ imageSrc = null, videoSrc = null }) => {
      const post = {
        id: postId,
        user: currentUser?.name || "Anonymous",
        text,
        timestamp: "Just now",
        image: imageSrc,
        video: videoSrc,
        likes: 0,
        liked: false,
        showHeart: false,
        comments: [],
      };

      setPosts((prev) => [post, ...prev]);
      setText("");
      setMedia(null);
    };

    if (!media) return finalize({});

    const type = media.type || "";
    const isImage = type.startsWith("image/");
    const isVideo = type.startsWith("video/");

    const url = URL.createObjectURL(media);

    if (isImage) finalize({ imageSrc: url });
    else if (isVideo) finalize({ videoSrc: url });
    else finalize({});
  };

  // LIKE HANDLER
  const toggleLike = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
          : p
      )
    );
  };

  // Double-click / double-tap to like with heart overlay
  const handleDoubleLike = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const alreadyLiked = p.liked;
      return { ...p, liked: true, likes: alreadyLiked ? p.likes : p.likes + 1, showHeart: true };
    }));

    // clear overlay after short delay
    setTimeout(() => {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, showHeart: false } : p));
    }, 900);
  };

  // ADD COMMENT
  const addComment = (postId) => {
    const text = (commentInputs[postId] || "").trim();
    if (!text) return;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: Date.now().toString(),
                  user: currentUser?.name || "You",
                  text,
                },
              ],
            }
          : p
      )
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <div style={styles.container}>
      {/* COMPOSER */}
      <div style={styles.composer}>
        <div style={styles.composerHeader}>
          <div style={styles.composerAvatar}>
            {(currentUser?.name || "A")[0]}
          </div>

          <div style={{ flex: 1 }}>
            <textarea
              style={styles.textArea}
              placeholder="Share something with the community..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                style={styles.uploadButton}
                onClick={() => fileRef.current.click()}
              >
                <Upload size={16} /> Add Image / Video
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                style={{ display: "none" }}
                onChange={(e) => setMedia(e.target.files[0])}
              />

              <button style={styles.submitButton} onClick={submitPost}>
                Post
              </button>
            </div>

            {media && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: "13px", marginBottom: 8, color: '#6b7280' }}>
                  Selected: {media.name}
                </p>
                {media.type.startsWith('image/') && (
                  <img src={URL.createObjectURL(media)} alt="preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginBottom: 8 }} />
                )}
                {media.type.startsWith('video/') && (
                  <video src={URL.createObjectURL(media)} style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginBottom: 8 }} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* POSTS as boxed entries grid */}
      <div style={styles.entriesGrid}>
        {posts.map((p) => (
          <div key={p.id} style={{...styles.entryCard, position:'relative'}}>
            <div style={styles.entryCardHeader}>
              <div style={{display:'flex', gap:12, alignItems:'center'}}>
                <div style={{width:44, height:44, borderRadius:'50%', background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#4338ca'}}>{p.user[0]}</div>
                <div>
                  <p style={styles.entryTitle}>{p.user}</p>
                  <div style={{fontSize:12, color:'#6b7280'}}>{p.timestamp}</div>
                </div>
              </div>
              <span style={{
                ...styles.sentimentBadge,
                ...(p.likes > 0 ? {backgroundColor:'#10b981'} : {backgroundColor:'#6b7280'})
              }}>{p.likes>10? 'popular' : 'new'}</span>
            </div>

            {/* If there's media (image/video) render as a large media post (Instagram-like) */}
            {(p.image || p.video) ? (
              <>
                <div style={{position:'relative', marginBottom: 12}} onDoubleClick={() => handleDoubleLike(p.id)}>
                  <div style={styles.postMedia}>
                    {p.video ? (
                      <video controls src={p.video} style={styles.postImage} />
                    ) : p.image ? (
                      <img src={p.image} alt="post" style={styles.postImage} />
                    ) : null}
                  </div>

                  {p.showHeart && (
                    <div style={styles.heartOverlay}>❤️</div>
                  )}
                </div>

                {/* caption below media */}
                {p.text && <p style={styles.entryContent}>{p.text}</p>}
              </>
            ) : (
              /* Text-only post: render as a normal post body */
              p.text && <p style={styles.entryContent}>{p.text}</p>
            )}

            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: (p.image || p.video || p.text) ? 12 : 8}}>
              <div style={{display:'flex', gap:8}}>
                <button
                  style={{
                    ...styles.actionButton,
                    background: p.liked ? "linear-gradient(90deg,#ff7ab6,#8b5cf6)" : "transparent",
                    color: p.liked ? "white" : undefined,
                  }}
                  onClick={() => toggleLike(p.id)}
                >
                  <Heart size={18} />
                </button>

                <button style={styles.actionButton} onClick={() => document.getElementById(`comment-input-${p.id}`)?.focus()}>
                  <MessageCircle size={18} />
                </button>

                <button style={styles.actionButton} onClick={() => alert('Share link copied!')}>
                  <Share2 size={18} />
                </button>
              </div>

              <div style={{fontWeight:700}}>{p.likes} {p.likes===1? 'like' : 'likes'}</div>
            </div>

            {/* comments preview */}
            <div style={{marginTop:10}}>
              {p.comments.length > 2 && (
                <div style={styles.viewComments}>View all {p.comments.length} comments</div>
              )}

              {p.comments.slice(0,2).map(c => (
                <div key={c.id} style={{display:'flex', gap:8, alignItems:'flex-start', marginTop:8}}>
                  <div style={styles.commentAvatar}>{c.user[0]}</div>
                  <div>
                    <strong style={{display:'block', fontSize:13}}>{c.user}</strong>
                    <div style={{fontSize:14, color:'#374151'}}>{c.text}</div>
                  </div>
                </div>
              ))}

              <div style={styles.commentComposer}>
                <input
                  id={`comment-input-${p.id}`}
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  value={commentInputs[p.id] || ''}
                  onChange={(e) => setCommentInputs(prev => ({...prev, [p.id]: e.target.value}))}
                  onKeyDown={(e) => { if (e.key === 'Enter') addComment(p.id); }}
                />

                <button style={styles.actionButton} onClick={() => addComment(p.id)}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
