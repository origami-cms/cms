export const copy = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.style.opacity = '0';
  textArea.style.width = '0';
  textArea.style.height = '0';
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  const copied = document.execCommand('copy');
  textArea.remove();
  return copied;
};
