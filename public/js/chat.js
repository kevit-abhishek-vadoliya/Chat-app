const socket = io()

//elements
const $messageForm = document.getElementById('messageForm')
const $messageinput = document.getElementById('message')
const $submitBtn = document.getElementById('button')
const $sendlocbtn = document.getElementById('send-loc')
const $messages = document.getElementById('messages')

//templates
const messageTemplate = document.getElementById('message-template').innerHTML 
const locationTemplate = document.getElementById('location-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = ()=>{
    //new message
    const $newMessage = $messages.lastElementChild

    //height of the new message
    const newMEssageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMEssageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible Height
    const visiblHeight = $messages.offsetHeight

    //height of message Container
    const containerHeight = $messages.scrollHeight

    //how far I have scrolled
    const scrollOffset = $messages.scrollTop + visiblHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight        
    }


    console.log(newMessageMargin)


}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html) 
    autoscroll()
})

socket.on('locationMessage', (url)=>{
    const html = Mustache.render(locationTemplate,{
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()    
})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.getElementById('sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $submitBtn.setAttribute('disabled', 'disabled')
    const message = $messageinput.value

    socket.emit('sendMessage', message, (error) => {
        $submitBtn.removeAttribute('disabled')
        $messageinput.value = ''
        $messageForm.focus()
        if (error) {
            return console.log(error)
        }
        console.log('The message was delivered')
    })

})
$sendlocbtn.addEventListener('click', (e) => {
    e.preventDefault()

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    $sendlocbtn.setAttribute('disabled', 'disabled')
     
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude
        const long = position.coords.longitude

        socket.emit('sendLocation', { lat, long }, () => {
            $sendlocbtn.removeAttribute('disabled')
            return console.log('Location Shared!')
        })
    })
})

socket.emit('join', { username, room }, (error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})
