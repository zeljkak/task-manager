import api from "../api/axios";

export const deleteAttachment = (attachmentId) => {
  return api.delete(
    `/attachments/${attachmentId}`
  );
};