export default {
  methods: {
    getColorByCategory(categoryName) {
      switch (categoryName) {
        case 'Козачка': return '#9b5619'
        case 'Плюшки': return '#007037'
        case 'Питание': return '#6c26b0'
        case 'Авто/Бензин': return '#6D4C41'
        case 'Тинькофф': return '#1c2833'
        default: return '#242424'
      }
    }
  }
}
