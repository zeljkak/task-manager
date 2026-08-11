import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { isFileAllowed } from "../utils/fileValidation.js";
import { getTaskComments, createTaskComment } from "../services/taskService.js";
import { createCommentAttachment, updateComment, deleteComment } from "../services/commentService.js";
import { deleteAttachment } from "../services/attachmentService.js";
import AttachmentIcon from "../components/icons/AttachmentIcon.jsx";
import DeleteIcon from "../components/icons/DeleteIcon.jsx";

function TaskCommentsComponent({ taskId, user, iconSize, onCommentUpdated }) {

    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [newCommentText, setNewCommentText] = useState("");
    const [commentAttachments, setCommentAttachments] = useState([]);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);
    const [commentError, setCommentError] = useState("");
    const [commentItemErrors, setCommentItemErrors] = useState({});

    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);
    const newCommentErrorRef = useRef(null);

    const fetchComments = useCallback(async () => {
        setCommentsLoading(true);
        try {
            const response = await getTaskComments(taskId);
            setComments(response.data?.comments || []);
        } catch (err) {
            console.error("Failed to fetch comments:", err);
        } finally {
            setCommentsLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    useEffect(() => {
        if (commentError && newCommentErrorRef.current) {
            requestAnimationFrame(() => {
                newCommentErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            });
        }
    }, [commentError]);

    useEffect(() => {
        const hasActiveError = Object.values(commentItemErrors).some(err => Boolean(err));
        if (hasActiveError) {
            requestAnimationFrame(() => {
                const errorElement = document.querySelector(".comment-item-error");
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            });
        }
    }, [commentItemErrors]);

    const handleSync = async () => {
        await fetchComments();
        if (onCommentUpdated) await onCommentUpdated();
    };

    const handleNewCommentFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const MAX_SIZE = 10 * 1024 * 1024;
        const oversizedFile = files.find(file => file.size > MAX_SIZE);
        const invalidFile = files.find(file => !isFileAllowed(file));

        if (invalidFile) {
            setCommentError(`"${invalidFile.name}" has an invalid file type.`);
            setTimeout(() => setCommentError(""), 4000);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }

        if (oversizedFile) {
            setCommentError(`"${oversizedFile.name}" exceeds the 10 MB limit.`);
            setTimeout(() => setCommentError(""), 4000);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setCommentError(""); // Clear error on valid selection
        setCommentAttachments(prev => [...prev, ...files]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeNewCommentAttachment = (indexToRemove) => {
        setCommentAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleEditCommentFileChange = async (e, commentId) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const MAX_SIZE = 10 * 1024 * 1024;
        const oversizedFile = files.find(file => file.size > MAX_SIZE);
        const invalidFile = files.find(file => !isFileAllowed(file));

        if (invalidFile) {
            setCommentItemErrors(prev => ({
              ...prev,
              [commentId]: `"${invalidFile.name}" has an invalid file type.`
            }));
            setTimeout(() => setCommentItemErrors(prev => ({ ...prev, [commentId]: "" })), 4000);
            if (e.target) e.target.value = "";
            return;
          }

        if (oversizedFile) {
            setCommentItemErrors(prev => ({
                ...prev,
                [commentId]: `"${oversizedFile.name}" exceeds the 10 MB limit.`
            }));
            setTimeout(() => setCommentItemErrors(prev => ({ ...prev, [commentId]: "" })), 4000);
            if (e.target) e.target.value = "";
            return;
        }

        try {
            const commentAttachmentData = new FormData();
            files.forEach(file => commentAttachmentData.append("file", file));

            await createCommentAttachment(commentId, commentAttachmentData);
            setCommentItemErrors(prev => ({ ...prev, [commentId]: "" }));
            await handleSync();
        } catch (err) {
            console.error("Failed to add attachment to existing comment:", err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to upload file.";
            setCommentItemErrors(prev => ({ ...prev, [commentId]: errorMsg }));
            setTimeout(() => setCommentItemErrors(prev => ({ ...prev, [commentId]: "" })), 4000);
        } finally {
            if (editFileInputRef.current) editFileInputRef.current.value = "";
        }
    };

    const handleEditCommentTextChange = async (commentId, newText) => {
        const currentComment = comments.find(c => c.id === commentId);
        if (!currentComment) return;

        const previousText = currentComment.comment || "";
        const hasExistingAttachments = currentComment?.attachments && currentComment.attachments.length > 0;

        setComments(prevComments =>
            prevComments.map(c => c.id === commentId ? { ...c, comment: newText } : c)
        );

        try {
            await updateComment(commentId, { comment: newText, hasAttachments: hasExistingAttachments });
            setCommentItemErrors(prev => ({ ...prev, [commentId]: "" }));
        } catch (err) {
            console.error("Failed to update comment text:", err);
            setComments(prevComments =>
                prevComments.map(c => c.id === commentId ? { ...c, comment: previousText } : c)
            );
            const errorMsg = err.response?.data?.error || "Failed to update comment.";
            setCommentItemErrors(prev => ({ ...prev, [commentId]: errorMsg }));
            setTimeout(() => setCommentItemErrors(prev => ({ ...prev, [commentId]: "" })), 3000);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const hasText = newCommentText.trim().length > 0;
        const hasAttachments = commentAttachments.length > 0;

        if (!hasText && !hasAttachments) return;

        setIsSubmittingComment(true);
        setCommentError("");

        try {
            const commentResponse = await createTaskComment(taskId, { comment: newCommentText, hasAttachments });
            const createdComment = commentResponse.data?.comment;

            if (hasAttachments && createdComment?.id) {
                const commentAttachmentData = new FormData();
                commentAttachments.forEach(file => commentAttachmentData.append("file", file));
                await createCommentAttachment(createdComment.id, commentAttachmentData);
            }
            setNewCommentText("");
            setCommentAttachments([]);
            if (fileInputRef.current) fileInputRef.current.value = "";

            await handleSync();
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to post comment.";
            setCommentError(errorMsg);
            setTimeout(() => setCommentError(""), 4000);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleCommentDelete = async (commentId) => {
        try {
            await deleteComment(commentId);
            await handleSync();
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Failed to delete comment.";
            setCommentItemErrors(prev => ({ ...prev, [commentId]: errorMsg }));
            setTimeout(() => setCommentItemErrors(prev => ({ ...prev, [commentId]: "" })), 3000);
        } finally {
            setDeletingCommentId(null);
        }
    };

    const handleAttachmentDelete = async (attachmentId) => {
        try {
            await deleteAttachment(attachmentId);
            await handleSync();
        } catch (error) {
            console.error("Failed to delete attachment: ", error);
        }
    };

    return (
        <div className="task-comments">
            <h4>Comments</h4>
            {commentsLoading ? (
                <p>Loading comments...</p>
            ) : comments.length === 0 ? (
                <p className="no-comments">No comments yet.</p>
            ) : (
                <div className="comments-list">
                    {comments.map((c) => {
                        const isAuthor = c.user?.id === user?.id;
                        return (
                            <div key={c.id} className="comment-item">
                                <div className="comment-header">
                                    <strong>{c.user ? `${c.user.firstName} ${c.user.lastName}` : "User"}</strong>
                                    {c.createdAt && (
                                        <span className="comment-date">
                                            {new Date(c.createdAt)
                                                .toLocaleString("en-GB")
                                                .replaceAll("/", ".")
                                                .replaceAll(",", ".")
                                                .concat(".")
                                                .slice(0, -1)}
                                        </span>
                                    )}
                                    {isAuthor && (
                                        <button type="button" className="delete-comment-btn" onClick={() => setDeletingCommentId(c.id)}>
                                            <DeleteIcon size={iconSize} />
                                        </button>
                                    )}
                                </div>

                                {deletingCommentId === c.id &&
                                    createPortal(
                                        <div className="confirmation-overlay">
                                            <div className="confirmation-div">
                                                <p>Are you sure you want to delete this comment?</p>
                                                <div className="confirmation-actions">
                                                    <button type="button" className="positive" onClick={() => handleCommentDelete(c.id)}>
                                                        Yes
                                                    </button>
                                                    <button type="button" className="negative" onClick={() => setDeletingCommentId(null)}>
                                                        No
                                                    </button>
                                                </div>
                                            </div>
                                        </div>,
                                        document.getElementById("content") || document.body
                                    )}

                                {isAuthor ? (
                                    <>
                                        <div className="textarea-wrapper">
                                            <textarea className="comment-text-input" value={c.comment || ""}
                                                onChange={(e) => handleEditCommentTextChange(c.id, e.target.value)}
                                            />
                                            {c.attachments && c.attachments.length > 0 && (
                                                <div className="comment-attachments">
                                                    {c.attachments.map((a) => (
                                                        <div key={a.id} className="attachment-chip">
                                                            {deletingAttachmentId === a.id ? (
                                                                createPortal(
                                                                    <div className="confirmation-overlay">
                                                                        <div className="confirmation-div">
                                                                            <p>
                                                                                Delete{" "}
                                                                                <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="file-name">
                                                                                    {a.fileName}
                                                                                </a>
                                                                                ?
                                                                            </p>
                                                                            <div className="confirmation-actions">
                                                                                <button type="button" className="positive"
                                                                                    onClick={() => {
                                                                                        handleAttachmentDelete(a.id);
                                                                                        setDeletingAttachmentId(null);
                                                                                    }}
                                                                                >
                                                                                    Yes
                                                                                </button>
                                                                                <button type="button" className="negative" onClick={() => setDeletingAttachmentId(null)}>
                                                                                    No
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>,
                                                                    document.getElementById("content") || document.body
                                                                )
                                                            ) : (
                                                                <>
                                                                    <button type="button" onClick={() => setDeletingAttachmentId(a.id)}>
                                                                        <DeleteIcon size={iconSize} />
                                                                    </button>
                                                                    <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="file-name">
                                                                        {a.fileName}
                                                                    </a>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <label htmlFor={`edit-comment-attachment-${c.id}`} className="attachment-label">
                                                <AttachmentIcon size={iconSize} />
                                            </label>
                                            <input type="file" name={`edit-comment-attachment-${c.id}`}
                                                accept=".png,.jpg,.jpeg,.gif,.svg,.webp,.pdf,.docx,.txt,.csv,.xlsx,.xls,.pptx"
                                                className="attachment-input" ref={editFileInputRef}
                                                id={`edit-comment-attachment-${c.id}`} multiple
                                                onChange={(e) => handleEditCommentFileChange(e, c.id)}
                                            />
                                        </div>
                                        {commentItemErrors[c.id] && <p className="error comment-item-error">{commentItemErrors[c.id]}</p>}
                                    </>
                                ) : (
                                    <>
                                        <p className="comment-text">{c.comment || ""}</p>
                                        {c.attachments && c.attachments.length > 0 && (
                                            <div className="comment-attachments">
                                                {c.attachments.map((a) => (
                                                    <div key={a.id} className="attachment-chip">
                                                        <AttachmentIcon size={iconSize} />
                                                        <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="file-name">
                                                            {a.fileName}
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                                <hr />
                            </div>
                        );
                    })}
                </div>
            )}
            {commentError && (
                <div className="error-message" ref={newCommentErrorRef}>
                    <p className="error">{commentError}</p>
                </div>
            )}
            <form onSubmit={handleCommentSubmit} className="add-comment-form">
                <div className="textarea-wrapper">
                    <textarea placeholder="Write a comment..." rows={3}
                        name="new-comment-text" value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                    />
                    {commentAttachments.length > 0 && (
                        <div className="selected-comment-attachments">
                            {commentAttachments.map((file, idx) => (
                                <div key={idx} className="attachment-chip">
                                    <button type="button" onClick={() => removeNewCommentAttachment(idx)}>
                                        <DeleteIcon size={iconSize} />
                                    </button>
                                    <a href="#" target="_blank" rel="noopener noreferrer" className="file-name">
                                        {file.name}
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                    <label htmlFor="new-comment-attachment" className="attachment-label">
                        <AttachmentIcon size={iconSize} />
                    </label>
                </div>
                <input type="file" name="comment-attachments" multiple
                    accept=".png,.jpg,.jpeg,.gif,.svg,.webp,.pdf,.docx,.txt,.csv,.xlsx,.xls,.pptx"
                    className="attachment-input" id="new-comment-attachment"
                    ref={fileInputRef} onChange={handleNewCommentFileChange}
                />
                <button type="submit" id="submit-new-comment-button"
                    disabled={isSubmittingComment || (!newCommentText.trim() && commentAttachments.length === 0)}
                >
                    {isSubmittingComment ? "Commenting..." : "Comment"}
                </button>
            </form>
        </div>
    );
}

export default TaskCommentsComponent;