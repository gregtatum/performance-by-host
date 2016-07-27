const parseProfile = require('./parse-profile')
const pieChart = require('./pie-chart')

function startDrag () {
  const dragEl = document.querySelector('.drag')
  const dragMessageEl = dragEl.querySelector('.drag-message')
  const errorContainer = document.querySelector('.drag-error')
  const errorMessage = document.querySelector('.drag-error-message')
  const showError = showErrorFn(errorContainer, errorMessage)

  let destroyPreviousChart = () => {}

  function handleNewData (data) {
    dragEl.classList.remove('dragging')
    dragEl.classList.add('has-chart')
    destroyPreviousChart()
    destroyPreviousChart = pieChart('.chart-pie', data)
  }

  if (localStorage.getItem('performance-data')) {
    try {
      const data = JSON.parse(localStorage.getItem('performance-data'))
      handleNewData(data)
    } catch(e) {}
  }

  dragEl.addEventListener('dragenter', (e) => {
    dragEl.classList.add('dragging')
    errorContainer.classList.remove('show')
  }, true)

  // dragEl.addEventListener('dragleave', (e) => {
  //   dragEl.classList.remove('dragging')
  //   console.log('remove dragging')
  // }, true)

  dragEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    // Set the dropEffect to move
    e.dataTransfer.dropEffect = "move"
  }, true)

  dragEl.addEventListener('drop', (e) => {
    e.preventDefault()
    var reader = new FileReader()

    reader.addEventListener('loadend', function() {
      try {
        var profile = JSON.parse(this.result)
      } catch (e) {
        return showError(e, "That file does not appear to be valid JSON.")
      }

      try {
        var data = parseProfile(profile)
      } catch (e) {
        return showError(e, "That JSON does not appear to be in the correct format.")
      }

      localStorage.setItem('performance-data', JSON.stringify(data))
      handleNewData(data)
    })



    function handleError (e) {
      showError(e, 'Your browser is unable to load that file.')
    }
    reader.addEventListener('error', handleError)
    reader.addEventListener('abort', handleError)

    reader.readAsText(e.dataTransfer.files[0])
  }, true)
}

function showErrorFn (errorMessage, errorContainer) {
  return function showError (error, message) {
    errorMessage.innerText = message
    errorContainer.classList.add('show')
    console.log(error)
  }
}

module.exports = startDrag
