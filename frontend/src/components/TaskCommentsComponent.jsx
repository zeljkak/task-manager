import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { isFileAllowed } from "../utils/fileValidation.js";
import { getTaskComments, getDeletedTaskComments, createTaskComment } from "../services/taskService.js";
import { createCommentAttachment, updateComment, deleteComment } from "../services/commentService.js";
import { deleteAttachment } from "../services/attachmentService.js";
import URLComponent, { formatLinksWithNewLines } from "./URLComponent.jsx";
import AttachmentIcon from "../components/icons/AttachmentIcon.jsx";
import DeleteIcon from "../components/icons/DeleteIcon.jsx";

function TaskCommentsComponent({ taskId, user, iconSize, onCommentUpdated, deletedTask, isMobile = false }) {

    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [newCommentText, setNewCommentText] = useState("");
    const [commentAttachments, setCommentAttachments] = useState([]);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);
    const [commentError, setCommentError] = useState("");
    const [commentItemErrors, setCommentItemErrors] = useState({});

    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);
    const newCommentErrorRef = useRef(null);
    const commentTextareaRefs = useRef({});

    const fetchComments = useCallback(async () => {
        setCommentsLoading(true);
        try {
            if (!deletedTask) {
                const response = await getTaskComments(taskId);
                setComments(response.data?.comments || []);
            } else {
                const response = await getDeletedTaskComments(taskId);
                setComments(response.data?.comments || []);
            }
        } catch (err) {
            console.error("Failed to fetch comments:", err);
        } finally {
            setCommentsLoading(false);
        }
    }, [taskId, deletedTask]);

    const resizeCommentTextarea = useCallback((commentId) => {
        const el = commentTextareaRefs.current[commentId];
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, []);

    useEffect(() => {
        comments.forEach((c) => {
            resizeCommentTextarea(c.id);
        });
    }, [comments, resizeCommentTextarea]);

    useEffect(() => {
        if (editingCommentId !== null) {
            requestAnimationFrame(() => resizeCommentTextarea(editingCommentId));
        }
    }, [editingCommentId, resizeCommentTextarea]);

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

        setCommentError("");
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

    const handleEditCommentBlur = async (commentId, currentText) => {
        const formattedText = formatLinksWithNewLines(currentText || "");
        if (formattedText !== (currentText || "")) {
            await handleEditCommentTextChange(commentId, formattedText);
        }
        setEditingCommentId(null);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const formattedCommentText = formatLinksWithNewLines(newCommentText);
        const hasText = formattedCommentText.trim().length > 0;
        const hasAttachments = commentAttachments.length > 0;

        if (!hasText && !hasAttachments) return;

        setIsSubmittingComment(true);
        setCommentError("");

        let createdComment = null;

        try {
            const commentResponse = await createTaskComment(taskId, { comment: formattedCommentText, hasAttachments });
            createdComment = commentResponse.data?.comment;

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
            if (!hasText && createdComment?.id) {
                try {
                    await deleteComment(createdComment.id);
                } catch (cleanupErr) {
                    console.error("Failed to cleanup empty comment after attachment failure:", cleanupErr);
                }
            }

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

    const renderAttachmentsBlock = (attachments, allowDelete) => {
        if (!attachments || attachments.length === 0) return null;

        return (
            <div className="comment-attachments">
                {attachments.map((a) => (
                    <div key={a.id} className="attachment-chip">
                        {allowDelete ? (
                            deletingAttachmentId === a.id ? (
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
                            )
                        ) : (
                            <>
                                <AttachmentIcon size={iconSize} />
                                <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="file-name">
                                    {a.fileName}
                                </a>
                            </>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="task-comments">
            <h4>Comments</h4>
            {commentsLoading ? (
                <p>Loading comments...</p>
            ) : comments.length === 0 ? (
                <p className="no-comments">{deletedTask ? "No comments." : "No comments yet."}</p>
            ) : (
                <div className="comments-list">
                    {comments.map((c) => {
                        const isAuthor = c.user?.id === user?.id;
                        const canEdit = isAuthor && !deletedTask;
                        const isEditing = canEdit && editingCommentId === c.id;

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
                                                .slice(0, -4)}
                                        </span>
                                    )}
                                    {canEdit && (
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

                                {isEditing ? (
                                    <>
                                        <div className="textarea-wrapper">
                                            <textarea
                                                ref={(el) => {
                                                    if (el) {
                                                        commentTextareaRefs.current[c.id] = el;
                                                    } else {
                                                        delete commentTextareaRefs.current[c.id];
                                                    }
                                                }}
                                                className="comment-text-input"
                                                value={c.comment || ""}
                                                id={`comment-${c.id}-edit`}
                                                rows={1}
                                                autoFocus
                                                onChange={(e) => {
                                                    handleEditCommentTextChange(c.id, e.target.value);
                                                    requestAnimationFrame(() => resizeCommentTextarea(c.id));
                                                }}
                                                onBlur={(e) => handleEditCommentBlur(c.id, e.target.value)}
                                            />
                                            {renderAttachmentsBlock(c.attachments, true)}
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
                                        <div
                                            className="comment-text"
                                            onClick={canEdit ? () => setEditingCommentId(c.id) : undefined}
                                        >
                                            <URLComponent
                                                text={formatLinksWithNewLines(c.comment || "")}
                                                placeholder=""
                                                mobile={isMobile}
                                            />
                                        </div>
                                        {renderAttachmentsBlock(c.attachments, canEdit)}
                                        {commentItemErrors[c.id] && <p className="error comment-item-error">{commentItemErrors[c.id]}</p>}
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
            {!deletedTask && (
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
            )}
        </div>
    );
}

export default TaskCommentsComponent;