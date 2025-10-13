export const diagram = createDiagram()

function createDiagram() {
  let code = $state('')
  let error = $state('')
  let currentName = $state('')
  let currentExampleIndex = $state('')
 
  return {
    setCode(newCode) {
      code = newCode
      error = ''
    },
    setError(message) {
      error = message
    },
    cleanError() {
      error = ''
    }, 
    nextExample() {
      currentExampleIndex = index
    }
  }
}
