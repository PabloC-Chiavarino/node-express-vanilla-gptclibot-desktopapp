lottie.loadAnimation({
  container: document.getElementById('robot'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: '/assets/animations/robot.json'
});

lottie.loadAnimation({
  container: document.getElementById('blob'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: '/assets/animations/blob.json'
});

const inputContainer = document.getElementById('input-container');
const input = document.getElementById('user-input');
const blob = document.getElementById('blob');
const robot = document.getElementById('robot');
const appWrapper = document.getElementById('app-wrapper');

robot.addEventListener('click', () => {
  inputContainer.classList.remove('hidden');
  input.focus();
});


input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (input.value.trim()) {
      sendMessage();
      blob.classList.remove('hidden');
    }
  }
});

document.addEventListener('click', (e) => {
  const isOutsideAppWrapper = !appWrapper.contains(e.target);

  if (isOutsideAppWrapper) {
    inputContainer.classList.add('hidden');
    blob.classList.add('hidden');
  }
});

function triggerBlobReflow() {
  blob.classList.add('hidden');
  void blob.offsetWidth;
  blob.classList.remove('hidden');
}

async function sendMessage() {

    triggerBlobReflow();
    
    const responseBox = document.getElementById('response');
    responseBox.textContent = '...';
    
    const res = await fetch('/api/gpt-cli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.value })
    });
    
    const data = await res.json();
    responseBox.textContent = data.reply || data.error;
    input.value = '';
}
