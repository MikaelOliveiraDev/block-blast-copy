const combo = {
  value: 0,
  max: 8, // the number of clear sounds
  clearSounds: [],
  increase: function () {
    this.value++;
    if (this.value > this.max) this.clear();
  },
  clear: function () {
    this.value = 0;
  },
  play: function () {
    this.clearSounds[this.value].play();
  },
};

for (let i = 0; i < combo.max; i++) {
  const sound = new Sound(`./assets/clear-${i}.mp3`, 1);
  combo.clearSounds.push(sound);
}
