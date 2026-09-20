// Escapes % and _ so user text is matched literally inside LIKE '%...%'
export const like = (text) => `%${String(text).replace(/[\\%_]/g, '\\$&')}%`;
export const likeStart = (text) => `${String(text).replace(/[\\%_]/g, '\\$&')}%`;
