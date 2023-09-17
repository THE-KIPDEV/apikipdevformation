export function findPreviousBarToGroupMessage(messagesJson, currentMessage) {
  const barToGroupMessages = messagesJson.filter(function (msg) {
    return msg.from === 'bar' && msg.to === 'group';
  });

  for (let i = barToGroupMessages.length - 1; i >= 0; i--) {
    if (barToGroupMessages[i].date < currentMessage.date) {
      return barToGroupMessages[i];
    }
  }

  return null;
}

export function findPreviousGroupToBarMessage(messagesJson, currentMessage) {
  const groupToBarMessages = messagesJson.filter(function (msg) {
    return msg.from === 'group' && msg.to === 'bar';
  });

  for (let i = groupToBarMessages.length - 1; i >= 0; i--) {
    if (groupToBarMessages[i].date < currentMessage.date) {
      return groupToBarMessages[i];
    }
  }

  return null;
}
