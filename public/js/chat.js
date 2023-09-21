const socket = io()

//Elements
const $messageForm =document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $locations = document.querySelector('#locations')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sideBarTemplate = document.querySelector('#side-bar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true})


const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    console.log(newMessageMargin)

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight

    }
}
//Receive admin messages from the server
socket.on('adminMessage',({username,text,createdAt})=>{
    const isAdminMessage = true
    const html = Mustache.render(messageTemplate,{
        username,
        isAdminMessage,
        message : text,
        createdAt : moment(createdAt).format('HH:mmA') 
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

//Receive room messages from the server
socket.on('message',({username,id,text,createdAt})=>{
    console.log(text)
    let isMyMessage = false
    let isClientMessage = false
    if(socket.id === id){
        isMyMessage = true
        isClientMessage = false
    }else{
        isMyMessage = false
        isClientMessage = true
    }
    console.log(isMyMessage)
    const html = Mustache.render(messageTemplate,{
        username,
        isMyMessage,
        isClientMessage,
        message : text,
        createdAt : moment(createdAt).format('HH:mmA') 
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})
//Receive location message from the server
socket.on('locationMessage',({username,id,urlLocation,createdAt})=>{
    console.log(urlLocation)
    let isMyLocation = false
    let isClientLocation = false
    if(socket.id === id){
        isMyLocation = true
        isClientLocation = false
    }
    else{
        isMyLocation = false
        isClientLocation = true
    }
    const html = Mustache.render(locationTemplate,{
        username,
        isMyLocation,
        isClientLocation,
        urlLocation,
        createdAt : moment(createdAt).format('HH:mmA') 
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
    
})
socket.on('roomData',({room, users})=>{
    const html = Mustache.render(sideBarTemplate,{
        room,
        users
    })
    document.querySelector('#side-bar').innerHTML = html
    
})

//Sending message to server
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disable send message button
    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        //re-enable send messgae button
        $messageFormButton.removeAttribute('disabled')
        //empty input and focus back to input tag
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }else{
            console.log('Message was delivered!')
        }
    })
})



//Sending location to server
$sendLocationButton.addEventListener('click',(e)=>{
    e.preventDefault()
    //disable Share Location button
    $sendLocationButton.setAttribute('disabled','disabled')

    if(!navigator.geolocation){
        return alert('Geolocation is not support by your browswer.')
    }else{
        navigator.geolocation.getCurrentPosition((position)=>{
            socket.emit('sendLocation',{
                lattitude : position.coords.latitude,
                longitude : position.coords.longitude
            },()=>{
                //re-enable Share Location button
                $sendLocationButton.removeAttribute('disabled')
                console.log('Location Shared!')
            })

        })
    }
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }

})