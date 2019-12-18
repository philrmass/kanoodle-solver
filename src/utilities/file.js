export function saveData(data, fileName) {
  const dataString = formatData(data);
  const blob = new Blob([dataString], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(function() {
    URL.revokeObjectURL(url);
  }, 0);
}

function formatData(data) {
  let str = JSON.stringify(data);
  str = str.replace(/{/g, (s) => addNewline(s, 2));
  str = str.replace(/}/g, (s) => addNewline(s, 2));
  str = str.replace(/null/g, (s) => addNewline(s, 2));
  str = str.replace(/"level"/g, (s) => addNewline(s, 4));
  str = str.replace(/"start"/g, (s) => addNewline(s, 4));
  return str;
}

function addNewline(value, spaces) {
  return `\n${' '.repeat(spaces)}${value}`;
}
