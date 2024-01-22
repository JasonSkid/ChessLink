//#region utilities
const retrievesDataFromChromeStorage = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      [
        'extensionActive',
        'depthValue',
        'maxWaitTime',
        'newgame',
        'automove',
        // 'safe',
        'autoPlayNewGame',
        'bongcloud',
        'voice',
      ],
      (result) => resolve(result)
    );
  });
};

const sendMessageToActiveTab = (message) => {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, message);
  });
};

const bindInputRangeOnChangeEvent = (input, localStorageKey) => {
  input.addEventListener('input', (event) => {
    chrome.storage.local.set({
      [localStorageKey]: event.target.value,
    });
  });
};

const bindInputToggleOnChangeEvent = (input, localStorageKey) => {
  input.addEventListener('input', (event) => {
    chrome.storage.local.set({
      [localStorageKey]: event.target.checked,
    });
  });
};

const extensionToggle = document.getElementById('extension-toggle');
const depthRange = document.getElementById('depth-range');
const waitTimeRange = document.getElementById('wait-time-range');
const automoveToggle = document.getElementById('automove-toggle');
// const safeModeToggle = document.getElementById('safe-mode-toggle');
const autoPlayNewGameToggle = document.getElementById('auto-play-new-game-toggle');
const bongcloudToggle = document.getElementById('bongcloud-toggle');
const voiceToggle = document.getElementById('voice-toggle');

const depthLabel = document.getElementById('depth-label');
const waitTimeLabel = document.getElementById('wait-time-label');
const voiceRepeat = document.getElementById('voice-repeat');

bindInputToggleOnChangeEvent(extensionToggle, 'extensionActive');
bindInputRangeOnChangeEvent(depthRange, 'depthValue');
bindInputRangeOnChangeEvent(waitTimeRange, 'maxWaitTime');
bindInputToggleOnChangeEvent(automoveToggle, 'automove');
// bindInputToggleOnChangeEvent(safeModeToggle, 'safe');
bindInputToggleOnChangeEvent(autoPlayNewGameToggle, 'autoPlayNewGame');
bindInputToggleOnChangeEvent(bongcloudToggle, 'bongcloud');
bindInputToggleOnChangeEvent(voiceToggle, 'voice');

automoveToggle.addEventListener('input', (event) => {
  const autoMoveActive = event.target.checked;
  sendMessageToActiveTab({ type: autoMoveActive ? 'start' : 'pause' });
});

const main = async () => {
  const {
    extensionActive,
    automove,
    // safe,
    depthValue,
    maxWaitTime,
    autoPlayNewGame,
    bongcloud,
    voice,
  } = await retrievesDataFromChromeStorage();

  extensionToggle.checked = extensionActive;
  depthRange.value = depthValue;
  waitTimeRange.value = maxWaitTime;
  automoveToggle.checked = automove;
  // safeModeToggle.checked = safe;
  autoPlayNewGameToggle.checked = autoPlayNewGame;
  bongcloudToggle.checked = bongcloud;
  voiceToggle.checked = voice;
  if (!voice) {
    voiceRepeat.style.display = 'none';
  }

  depthLabel.textContent = `Depth ${depthValue}`;
  waitTimeLabel.textContent = `Max wait time: ${maxWaitTime}ms`;

  depthRange.addEventListener('input', (event) => {
    depthLabel.textContent = `Depth: ${event.target.value}`;
  });

  waitTimeRange.addEventListener('input', (event) => {
    waitTimeLabel.textContent = `Max wait time: ${event.target.value}ms`;
  });

  voiceToggle.addEventListener('input', (event) => {
    if (event.target.checked) {
      voiceRepeat.style.display = 'inline';
    } else {
      voiceRepeat.style.display = 'none';
    }
  });

  voiceRepeat.addEventListener('click', (event) => {
    chrome.storage.local.get(['voiceMessage'], function (res) {
      const instruction = res.voiceMessage;
      const msg = new SpeechSynthesisUtterance(instruction);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(msg);
    });
  });
};

main();
