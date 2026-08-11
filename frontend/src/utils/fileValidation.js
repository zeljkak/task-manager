export const ALLOWED_EXTENSIONS = [
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp',
  'pdf', 'docx', 'txt', 'csv', 'xlsx', 'xls', 'pptx'
];

export const isFileAllowed = (file) => {
  if (!file || !file.name) return false;
  const extension = file.name.split('.').pop().toLowerCase();
  return ALLOWED_EXTENSIONS.includes(extension);
};