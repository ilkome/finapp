<template lang="pug">
.colorSelector
  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#d32f2f')" style="background-color: #d32f2f", data-hex="#d32f2f", data-rgb="211, 47, 47", data-hsl="0, 65%, 51%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#c62828')" style="background-color: #c62828", data-hex="#c62828", data-rgb="198, 40, 40", data-hsl="0, 66%, 47%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#b71c1c')" style="background-color: #b71c1c", data-hex="#b71c1c", data-rgb="183, 28, 28", data-hsl="0, 73%, 41%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#c2185b')" style="background-color: #c2185b", data-hex="#c2185b", data-rgb="194, 24, 91", data-hsl="336, 78%, 43%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#ad1457')" style="background-color: #ad1457", data-hex="#ad1457", data-rgb="173, 20, 87", data-hsl="334, 79%, 38%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#880e4f')" style="background-color: #880e4f", data-hex="#880e4f", data-rgb="136, 14, 79", data-hsl="328, 81%, 29%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#7b1fa2')" style="background-color: #7b1fa2", data-hex="#7b1fa2", data-rgb="123, 31, 162", data-hsl="282, 68%, 38%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#6a1b9a')" style="background-color: #6a1b9a", data-hex="#6a1b9a", data-rgb="106, 27, 154", data-hsl="277, 70%, 35%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#4a148c')" style="background-color: #4a148c", data-hex="#4a148c", data-rgb="74, 20, 140", data-hsl="267, 75%, 31%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#512da8')" style="background-color: #512da8", data-hex="#512da8", data-rgb="81, 45, 168", data-hsl="258, 58%, 42%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#4527a0')" style="background-color: #4527a0", data-hex="#4527a0", data-rgb="69, 39, 160", data-hsl="255, 61%, 39%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#311b92')" style="background-color: #311b92", data-hex="#311b92", data-rgb="49, 27, 146", data-hsl="251, 69%, 34%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#303f9f')" style="background-color: #303f9f", data-hex="#303f9f", data-rgb="48, 63, 159", data-hsl="232, 54%, 41%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#283593')" style="background-color: #283593", data-hex="#283593", data-rgb="40, 53, 147", data-hsl="233, 57%, 37%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#1a237e')" style="background-color: #1a237e", data-hex="#1a237e", data-rgb="26, 35, 126", data-hsl="235, 66%, 30%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#1976d2')" style="background-color: #1976d2", data-hex="#1976d2", data-rgb="25, 118, 210", data-hsl="210, 79%, 46%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#1565c0')" style="background-color: #1565c0", data-hex="#1565c0", data-rgb="21, 101, 192", data-hsl="212, 80%, 42%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#0d47a1')" style="background-color: #0d47a1", data-hex="#0d47a1", data-rgb="13, 71, 161", data-hsl="216, 85%, 34%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#0288d1')" style="background-color: #0288d1", data-hex="#0288d1", data-rgb="2, 136, 209", data-hsl="201, 98%, 41%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#0277bd')" style="background-color: #0277bd", data-hex="#0277bd", data-rgb="2, 119, 189", data-hsl="202, 98%, 37%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#01579b')" style="background-color: #01579b", data-hex="#01579b", data-rgb="1, 87, 155", data-hsl="206, 99%, 31%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#0097a7')" style="background-color: #0097a7", data-hex="#0097a7", data-rgb="0, 151, 167", data-hsl="186, 100%, 33%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#00838f')" style="background-color: #00838f", data-hex="#00838f", data-rgb="0, 131, 143", data-hsl="185, 100%, 28%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#006064')" style="background-color: #006064", data-hex="#006064", data-rgb="0, 96, 100", data-hsl="182, 100%, 20%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#00796b')" style="background-color: #00796b", data-hex="#00796b", data-rgb="0, 121, 107", data-hsl="173, 100%, 24%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#00695c')" style="background-color: #00695c", data-hex="#00695c", data-rgb="0, 105, 92", data-hsl="173, 100%, 21%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#004d40')" style="background-color: #004d40", data-hex="#004d40", data-rgb="0, 77, 64", data-hsl="170, 100%, 15%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#388e3c')" style="background-color: #388e3c", data-hex="#388e3c", data-rgb="56, 142, 60", data-hsl="123, 43%, 39%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#2e7d32')" style="background-color: #2e7d32", data-hex="#2e7d32", data-rgb="46, 125, 50", data-hsl="123, 46%, 34%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#1b5e20')" style="background-color: #1b5e20", data-hex="#1b5e20", data-rgb="27, 94, 32", data-hsl="124, 55%, 24%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#689f38')" style="background-color: #689f38", data-hex="#689f38", data-rgb="104, 159, 56", data-hsl="92, 48%, 42%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#558b2f')" style="background-color: #558b2f", data-hex="#558b2f", data-rgb="85, 139, 47", data-hsl="95, 49%, 36%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#33691e')" style="background-color: #33691e", data-hex="#33691e", data-rgb="51, 105, 30", data-hsl="103, 56%, 26%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#afb42b')" style="background-color: #afb42b", data-hex="#afb42b", data-rgb="175, 180, 43", data-hsl="62, 61%, 44%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#9e9d24')" style="background-color: #9e9d24", data-hex="#9e9d24", data-rgb="158, 157, 36", data-hsl="60, 63%, 38%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#827717')" style="background-color: #827717", data-hex="#827717", data-rgb="130, 119, 23", data-hsl="54, 70%, 30%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#fbc02d')" style="background-color: #fbc02d", data-hex="#fbc02d", data-rgb="251, 192, 45", data-hsl="43, 96%, 58%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#f9a825')" style="background-color: #f9a825", data-hex="#f9a825", data-rgb="249, 168, 37", data-hsl="37, 95%, 56%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#f57f17')" style="background-color: #f57f17", data-hex="#f57f17", data-rgb="245, 127, 23", data-hsl="28, 92%, 53%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#ffa000')" style="background-color: #ffa000", data-hex="#ffa000", data-rgb="255, 160, 0", data-hsl="38, 100%, 50%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#ff8f00')" style="background-color: #ff8f00", data-hex="#ff8f00", data-rgb="255, 143, 0", data-hsl="34, 100%, 50%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#ff6f00')" style="background-color: #ff6f00", data-hex="#ff6f00", data-rgb="255, 111, 0", data-hsl="26, 100%, 50%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#f57c00')" style="background-color: #f57c00", data-hex="#f57c00", data-rgb="245, 124, 0", data-hsl="30, 100%, 48%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#ef6c00')" style="background-color: #ef6c00", data-hex="#ef6c00", data-rgb="239, 108, 0", data-hsl="27, 100%, 47%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#e65100')" style="background-color: #e65100", data-hex="#e65100", data-rgb="230, 81, 0", data-hsl="21, 100%, 45%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#e64a19')" style="background-color: #e64a19", data-hex="#e64a19", data-rgb="230, 74, 25", data-hsl="14, 80%, 50%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#d84315')" style="background-color: #d84315", data-hex="#d84315", data-rgb="216, 67, 21", data-hsl="14, 82%, 46%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#bf360c')" style="background-color: #bf360c", data-hex="#bf360c", data-rgb="191, 54, 12", data-hsl="14, 88%, 40%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#5d4037')" style="background-color: #5d4037", data-hex="#5d4037", data-rgb="93, 64, 55", data-hsl="14, 26%, 29%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#4e342e')" style="background-color: #4e342e", data-hex="#4e342e", data-rgb="78, 52, 46", data-hsl="11, 26%, 24%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#3e2723')" style="background-color: #3e2723", data-hex="#3e2723", data-rgb="62, 39, 35", data-hsl="9, 28%, 19%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#616161')" style="background-color: #616161", data-hex="#616161", data-rgb="97, 97, 97", data-hsl="0, 0%, 38%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#424242')" style="background-color: #424242", data-hex="#424242", data-rgb="66, 66, 66", data-hsl="0, 0%, 26%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#212121')" style="background-color: #212121", data-hex="#212121", data-rgb="33, 33, 33", data-hsl="0, 0%, 13%")

  .colorSelector__group
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#455a64')" style="background-color: #455a64", data-hex="#455a64", data-rgb="69, 90, 100", data-hsl="199, 18%, 33%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#37474f')" style="background-color: #37474f", data-hex="#37474f", data-rgb="55, 71, 79", data-hsl="200, 18%, 26%")
    .colorSelector__block
      .colorSelector__item(@click.prevent="setColor('#263238')" style="background-color: #263238", data-hex="#263238", data-rgb="38, 50, 56", data-hsl="200, 19%, 18%")
</template>

<script>
export default {
  methods: {
    setColor(color) {
      this.$emit('setColor', color)
    }
  }
}
</script>
