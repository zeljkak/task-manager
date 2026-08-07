import api from "../api/axios.js";

export const updateComment = (commentId, comment) => {
  return api.patch(
    `/comments/${commentId}`, comment
  );
};

export const deleteComment = (commentId) => {
  return api.delete(
    `/comments/${commentId}`
  );
};

export const createCommentAttachment = (commentId, files) => {
  return api.post(
    `/comments/${commentId}/attachments`, files
  );
};