export const isCharacter = function () {
  return this.type === 'character';
};
export const isCorporation = function () {
  return this.type === 'corporation';
};
export const isAlliance = function () {
  return this.type === 'alliance';
};

export const defaultProfileImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';