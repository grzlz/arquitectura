export const diagram = createDiagram();

function createDiagram() {
	let code = $state('');
	let error = $state('');
	let currentName = $state('');
	let currentExampleIndex = $state(0);

	return {
		get code() {
			return code;
		},
		get error() {
			return error;
		},
		get currentName() {
			return currentName;
		},
		get currentExampleIndex() {
			return currentExampleIndex;
		},
		setCode(newCode) {
			code = newCode;
			error = '';
		},
		setError(message) {
			error = message;
		},
		cleanError() {
			error = '';
		},
		setName(name) {
			currentName = name;
		},
		nextExample(total) {
			currentExampleIndex = (currentExampleIndex + 1) % total;
		}
	};
}
