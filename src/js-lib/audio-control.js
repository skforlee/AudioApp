let currentVolume = parseFloat(query("#volume-control").value);
let allAudiosBeingPlayed = [];

function onAudioEnd(audioBeingPlayed) {
  allAudiosBeingPlayed = allAudiosBeingPlayed.filter(
    (a) => a.audio.currentTime > 0
  );
}
function playAudioFromLibrary(audioName, callbackOnEnd, button = null) {
  const audio = NodeCB.createAudio(audioName);
  console.log({ audio });
  const audioBeingPlayed = {
    audioName: audioName,
    audio: audio,
    Button: button,
  };

  allAudiosBeingPlayed.push(audioBeingPlayed);

  //   console.log(allAudiosBeingPlayed);

  audio.volume = currentVolume;
  audio.play();
  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    onAudioEnd(audioBeingPlayed);
    if (callbackOnEnd != null) callbackOnEnd();
  });
}
function stopAudio(audioName, button = null) {
  const audiosMatchingName = allAudiosBeingPlayed.filter(
    (a) => a.audioName == audioName && a.Button == button
  );
  if (audiosMatchingName.length == 0) return;

  const audioBeingPlayed = audiosMatchingName[0];
  audioBeingPlayed.audio.pause();
  audioBeingPlayed.audio.currentTime = 0;
  onAudioEnd(audioBeingPlayed);
}

function changeVolume(newVolume) {
  currentVolume = parseFloat(newVolume);
  for (const audioBeingPlayed of allAudiosBeingPlayed) {
    audioBeingPlayed.audio.volume = currentVolume;
  }
}
