//PostPage.js
import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { UserContext } from "../UserContext";
import { Link } from "react-router-dom";
export default function PostPage() {
    const [postInfo, setPostInfo] = useState(null);
    const [comment, setComment] = useState("");
    const { userInfo } = useContext(UserContext);
    const { id } = useParams();
    const navigate = useNavigate();
    const { id: postId } = useParams();

    

    useEffect(() => {
        fetchPost();
    }, [id]);


    const fetchPost = () => {
        fetch(`http://localhost:4000/post/${id}`)
            .then(response => response.json())
            .then(data => {
                console.log('Fetched post data:', data);
                setPostInfo(data);
            })
            .catch(error => console.error('Error fetching post:', error));
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        fetch(`http://localhost:4000/post/${id}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ content: comment })
        })
        .then(response => response.json())
        .then(() => {
            setComment('Write a comment..');
            fetchPost(); // Refresh comments
        })
        .catch(error => console.error('Error posting comment:', error));
    };

    // This is the function you call when clicking the delete button for a comment
const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
        fetch(`http://localhost:4000/post/${postId}/comment/${commentId}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(response => {
            if (response.ok) {
                alert('Comment deleted successfully');
                fetchPost(); // Refresh comments
            } else {
                alert('Error deleting comment');
            }
        })
        .catch(error => console.error('Error deleting comment:', error));
    }
};

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            fetch(`http://localhost:4000/post/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            .then(response => {
                if (response.ok) {
                    alert('Post deleted successfully');
                    navigate('/');
                } else {
                    alert('Error deleting post');
                }
            })
            .catch(error => console.error('Error deleting post:', error));
        }
    };

    if (!postInfo) return 'Loading...';

    return (
        <div className="post-page">
            <h1>{postInfo.title}</h1>
            <time>{format(new Date(postInfo.createdAt), 'MMM d, yyyy HH:mm')}</time>
            <div className="author">by {postInfo.author.username}</div>
            {userInfo && userInfo.role === 'admin' && (
                <div className="admin-actions">
                    <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
                        Edit this post
                    </Link>
                    <button onClick={handleDelete} className="delete-btn">
                        Delete Post
                    </button>
                </div>
            )}
            <div className="image">
                <img src={`http://localhost:4000/${postInfo.cover}`} alt={postInfo.title}/>
            </div>
            <div className="content" dangerouslySetInnerHTML={{ __html: postInfo.content }} />

            <div className="comments-section">
                <h2>Comments</h2>
                {userInfo && (
                    <form onSubmit={handleCommentSubmit}>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write a comment..."
                        />
                        <button type="submit">Post Comment</button>
                    </form>
                )}
                {postInfo.comments && postInfo.comments.map(comment => (
    <div key={comment._id} className="comment">
        <p>{comment.content}</p>
        <small>by {comment.author?.username || 'Unknown'}</small>
        {userInfo && userInfo.role === 'admin' && (
            <button onClick={() => handleDeleteComment(comment._id)}>Delete</button>
        )}
    </div>
))}

            </div>
        </div>
    );
}
