//Where server is hosting --> Location
const socket = io("http://54.219.81.12:8080", { transports : ['websocket'] });

const messageContainer = document.getElementById("messageContainer")
const messageForm = document.getElementById("sendMessage");
const messageInput = document.getElementById("messageInput");

const name = prompt('What is your name?');
appendMessage('You have joined the chat!');
socket.emit('newUser', name);

socket.on('chatMessage', data => {
    appendMessage(`${data.name}: ${data.message}`);
})

socket.on('userConnected', name => {
    appendMessage(`${name} has connected!`);
})

socket.on('userDisconnected', name => {
    appendMessage(`${name} has disconnected!`);
})


messageForm.addEventListener('submit', e =>{
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(`You: ${message}`)
    socket.emit('sendChatMessage', message);
    messageInput.value = '';
})

function appendMessage(message){
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageContainer.appendChild(messageElement);
}