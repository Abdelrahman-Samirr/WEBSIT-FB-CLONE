const token = localStorage.getItem("token")

if(!token){
  window.location.href = "/index.html"
}


console.log(token)
const decoded = jwtDecode(token);

console.log(decoded);



// const storedName = localStorage.getItem("profileName");
// const profileName = document.querySelector('.profile-name');

// if (storedName && profileName) {
//   profileName.textContent = storedName;
// }
////////////////////////////////////////////////////////

const openPost = document.querySelector('.header__post__btn')
const postModal = document.querySelector('.post-overlay')
const openningPost = document.querySelector('.post-btn-modal')
const cancelPostBtn = document.querySelector('.cancel-icon')
const createPost = document.querySelector('.post-input')
const postBtn = document.querySelector('.post-btn')
const posts = document.querySelector('.posts')
const users = document.querySelector('.users')
const profilePicElements = document.querySelectorAll('.profile')
const uploadPicInput = document.getElementById('profile-file-upload')
const modal = document.querySelector('.modal')
const modalCard = document.querySelector('.modal-card')
const modalComments = document.querySelector('.modal-comments')
const picBtn = document.querySelector('#post-pic-input')
const headerPost = document.querySelector('.header__post')
const userNameElement = document.querySelector('.profile-name')
const openChatBtn = document.querySelector('.chat-btn')
const chatCard = document.querySelector('.chat-bot')
const escChat = document.querySelector('.esc-chat')
const logoutBtn = document.querySelector('.logout-btn')

const DEFAULT_IMG = `https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png`

let currentUser = null
let uploadedPostPic = null
let perviewElement

async function init() {
  await getCurrentUser()
  await getPosts()
  await getUsers()
}
init()


// chat bot part 

const chatBotInput = document.querySelector(".chatInput");
const userMessage = document.querySelector(".my-message");
const botMessage = document.querySelector(".chat-message");
const chatBody = document.querySelector(".chat-body")
const sendButton = document.querySelector(".chat-footer a");
const chatAiBtn = document.querySelector ('.chat-ai')

const apiKey = "AIzaSyDSO5zZr2uQUrLmzynzxXkuC6dKtt7ylYs";

const chatHistory = [];

openChatBtn.addEventListener('click', function () {
  if (chatCard.style.display === 'none') {
    chatCard.style.display = 'block'
    chatAiBtn.style.display = 'none'
  } else {
    chatCard.style.display = 'none'
    chatAiBtn.style.display = 'block'
  }
})

chatAiBtn.addEventListener('click',function(){
  chatCard.style.display = 'block'
  chatAiBtn.style.display = 'none'
})

escChat.addEventListener('click', function () {
  chatCard.style.display = 'none'
  chatAiBtn.style.display = 'block'
  chatBotInput.value = ""
})

async function generateResponse(userMessage) {

  const userMessageObject = {
    role: "user",
    parts: [{ text: userMessage }]
  }
  chatHistory.push(userMessageObject)
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: chatHistory   // here i send it as array has all previous messages to make bot keep up with me
      })
    });

    if (!response.ok) { throw new Error('Failed to find response') }

    const data = await response.json();
    console.log(data)

    const chatBotReplay = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1") || "No response";

    const chatMessageObject = {
      role: "model",
      parts: [{ text: chatBotReplay }]
    };

    chatHistory.push(chatMessageObject)

    return chatBotReplay;

  } catch (error) {
    console.error("Error to find response:", error);
  }
}


sendButton.addEventListener("click", async function (e) {
  e.preventDefault();
  const userInput = chatBotInput.value.trim();
  if (!userInput) return;

  chatBody.insertAdjacentHTML(
    "beforeend",
    `<p class="message my-message">${userInput}</p>`
  );

  chatBotInput.value = "";

  chatBody.insertAdjacentHTML(
    "beforeend",
    `<p class="message chat-message">Typing...</p>`
  );

  const botReply = await generateResponse(userInput);

  const lastBotMsg = document.querySelector(".chat-message:last-child");

  lastBotMsg.textContent = botReply;

  chatBody.scrollTop = chatBody.scrollHeight;   // using scrollHeight to scrollTop tell browser to scroll to bottom of dom element
  
});


openPost.addEventListener('click', function () {
  postModal.style.display = 'block'
  userNameElement.textContent = currentUser.name
})

openningPost.addEventListener('click', function () {
  postModal.style.display = 'block'
  userNameElement.textContent = currentUser.name
})

cancelPostBtn.addEventListener('click', function () {
  postModal.style.display = 'none'
  if (perviewElement) { perviewElement.remove() }
  createPost.value = ''

})

modal.addEventListener('click', function () {
  modal.style.display = 'none'
})

modalCard.addEventListener('click', function (e) {
  e.stopPropagation()
})

picBtn.addEventListener('change', async function (e) {
  const picPost = e.target.files[0]
  await uploadPostPic(picPost)

  perviewElement = document.createElement('div')
  perviewElement.innerHTML = `<div class="cancel-perview delete-icon">
                  <img src="assets/images/delete.png" alt="esc icon">
                </div>
  <img src="https://fb-clone-production.up.railway.app/${uploadedPostPic}" id='image-preview' alt="">`

  createPost.insertAdjacentElement('afterend', perviewElement)

  const cancelPerview = document.querySelector('.cancel-perview')

  cancelPerview.addEventListener('click', function () {
    perviewElement.remove()
  })

})

function displayComments(comments, postId) {
  modalComments.innerHTML = ''

  if (!comments.length) {
    const commentHTML = `<div class="comment-container">
            <p>No comments for this post</p>
            </div>`
    modalComments.insertAdjacentHTML('beforeend', commentHTML)
  }

  const formElement = document.querySelector('.form-Comment')
  console.log(formElement)
  if (formElement) {
    modalCard.removeChild(formElement)
  }

  comments.forEach(comment => {
    const userPic = comment.user.profilePic ? `https://fb-clone-production.up.railway.app/${comment.user.profilePic}` : DEFAULT_IMG
    const commentHTML = `<div class="comment-container">
              <img src="${userPic}" alt="">
              <div class="comment-item">
                <p class="user-name">${comment.user.name}</p>
                <p class="comment-item__content">${comment.content}</p>
              </div>
            </div>`
    modalComments.insertAdjacentHTML('beforeend', commentHTML)

  })

  const form = `<form class = "form-Comment" data-post-id="${postId}">
              <input class="create-comment" type="text" placeholder="write your comment here">
              <button type="submit">comment</button>
            </form>`

  modalCard.insertAdjacentHTML('beforeend', form)

  const commentForm = document.querySelector('.form-Comment')

  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const createComment = document.querySelector('.create-comment')

    if (createComment.value.trim() === '') return

    const commentData =
    {
      "content": createComment.value,
    }

    try {
      const response = await fetch(`https://fb-clone-production.up.railway.app/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(commentData)
      })

      if (!response.ok) throw new Error("Failed to create post");

      const data = await response.json();
      console.log("Post created:", data);

      createComment.value = ""

      const allPostsResponse = await fetch("https://fb-clone-production.up.railway.app/posts", {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const allPosts = await allPostsResponse.json();

      const updatedPost = allPosts.find(post => post.id === postId);

      displayComments(updatedPost.comments, postId);

    } catch (error) {
      console.error("Error to create post:", error);
    }

  })
}

async function getPosts() {
  try {
    const response = await fetch("https://fb-clone-production.up.railway.app/posts", {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    })

    if (!response.ok) throw new Error("Failed to find posts");

    const data = await response.json();
    console.log("find posts:", data);

    posts.innerHTML = ""
    data.forEach(post => {

      let profileImg = post.author.profilePic
      if (!profileImg) {
        profileImg = DEFAULT_IMG
      } else {
        profileImg = `https://fb-clone-production.up.railway.app/${post.author.profilePic}`
      }
      const postImg = post.imageUrl ? `<div class="post-img"><img class="post-image" src="https://fb-clone-production.up.railway.app/${post.imageUrl}" alt="" /></div>` : ""
      const postHTML = `<div class="post" id="${post.id}">
              <div class="post-header">
                <div class="user-info">
                  <img src="${profileImg}" alt="User" />
                    <span class="profile-name">${post.author.name}</span>
                </div>
                <div class="post-header__right delete-icon">
                  <img src="assets/images/delete.png" alt="esc icon">
                </div>
              </div>

              <div class="post-content">
                <p>${post.content}</p>
                ${postImg}
              </div>
              <div class="post-counts">
                <span class="like-count">${post.likes.length} Likes</span>
                <span class="comment-count">${post.comments.length} Comments</span>
              </div>
              <div class="post-actions">
                <button class="post-actions__like">Like</button>
                <button class="post-actions__comment">Comment</button>
                <button class="post-actions__share">Share</button>
              </div>
              <div class="modal-delete">
                <div class="delete-card">
                  <div class="delete-card__header">
                    <p>Are you sure you want to delete post ?</p>
                  </div>
                  <div class="delete-card__buttons">
                    <button class="cancel"> Cancel</button>
                    <button class="delete">Delete</button>
                  </div>
                </div>
              </div>
            </div>`

      posts.insertAdjacentHTML('beforeend', postHTML)

      // here i use  postElement to catch the element and start to manipulate it's data
      const postElement = document.getElementById(post.id)
      const commentBtn = postElement.querySelector('.post-actions__comment')
      const likeBtn = postElement.querySelector('.post-actions__like')

      // like part 
      const likeData = post.likes.find(like => like.userId === currentUser.id)
      console.log(likeData)
      if (likeData) {
        likeBtn.classList.add('likeBtn-blue')
      }
      likeBtn.addEventListener('click', async function () {

        try {
          const response = await fetch(`https://fb-clone-production.up.railway.app/posts/${post.id}/like`, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
          });

          if (!response.ok) throw new Error("Failed to update likes");
          getPosts()

        } catch (error) {
          console.error("Failed to refresh likes:", error);
        }
      })

      // comment part 
      commentBtn.addEventListener('click', async function () {
        console.log("boda")
        if (modal.style.display === 'block') {
          modal.style.display = 'none'
        } else {
          modal.style.display = 'block'

          try {
            const response = await fetch("https://fb-clone-production.up.railway.app/posts", {
              method: 'GET',
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
            });

            if (!response.ok) throw new Error("Failed to fetch posts");

            const allPosts = await response.json();
            const updatedPost = allPosts.find(p => p.id === post.id);

            displayComments(updatedPost.comments, updatedPost.id);


          } catch (error) {
            console.error("Failed to refresh comments:", error);
          }
        }
      })

      // delete part
      const escIconBtn = postElement.querySelector('.delete-icon')
      const deleteBtn = postElement.querySelector('.delete')
      const modalDelete = postElement.querySelector('.modal-delete')
      const cancelBtn = postElement.querySelector('.cancel')

      escIconBtn.addEventListener('click', function () {
        modalDelete.style.display = 'block'
        console.log("hello")
      })
      cancelBtn.addEventListener('click', function () {
        modalDelete.style.display = 'none'
      })

      deleteBtn.addEventListener('click', async function () {
        try {
          const response = await fetch(`https://fb-clone-production.up.railway.app/posts/${post.id}`, {
            method: 'DELETE',
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
          });

          if (!response.ok) throw new Error("Failed to delete post");
          getPosts()

        } catch (error) {
          console.error("Failed to deleting post:", error);
        }
      })


    });

  } catch (error) {
    console.error("Error to find posts:", error);
  }
}

uploadPicInput.addEventListener('change', async (e) => {
  const file = e.target.files[0]
  await uploadFiles(file)
  getCurrentUser()
  getPosts()
  getUsers()
})

postBtn.addEventListener('click', async () => {
  const postData =
  {
    "content": createPost.value,
    "image": uploadedPostPic
  }
  if (!createPost.value && !uploadedPostPic && !perviewElement) return
  try {
    const response = await fetch("https://fb-clone-production.up.railway.app/posts", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    })

    if (!response.ok) throw new Error("Failed to create post");
    await getPosts()

    const data = await response.json();
    console.log("Post created:", data);

    createPost.value = ""
    document.getElementById("image-preview").remove()
    uploadedPostPic = null

  } catch (error) {
    console.error("Error to create post:", error);
  }
  postModal.style.display = 'none'
})

async function getUsers() {

  try {
    const response = await fetch("https://fb-clone-production.up.railway.app/users", {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    })


    if (!response.ok) throw new Error("Failed to find users");

    const data = await response.json();
    console.log("find users:", data);

    users.innerHTML = ""

    data.forEach(user => {

      let profileImg = user.profilePic
      if (!profileImg) {
        profileImg = DEFAULT_IMG
      } else {
        profileImg = `https://fb-clone-production.up.railway.app/${user.profilePic}`
      }
      const userHTML = `<div class="users__item">
              <img src="${profileImg}" alt="">
              <span>${user.name}</span>
            </div>`
      users.insertAdjacentHTML('beforeend', userHTML)

    });

  } catch (error) {
    console.error("Error to find users:", error);
  }
}

async function getCurrentUser() {
  console.log(decoded.userId)
  try {
    const response = await fetch(`https://fb-clone-production.up.railway.app/users/${decoded.userId}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    })

    if (!response.ok) throw new Error("Failed to find user");

    const data = await response.json();
    console.log("find user:", data);
    currentUser = data
    createPost.placeholder = `What's on your mind, ${currentUser.name}?`
    openPost.querySelector('span').textContent = `What's on your mind, ${currentUser.name}?`

    profilePicElements.forEach(element => {
      element.src = data.profilePic ? `https://fb-clone-production.up.railway.app/${data.profilePic}` : DEFAULT_IMG
    })

  } catch (error) {
    console.error("Error to find user:", error);
  }

}

async function uploadFiles(file) {
  const formData = new FormData
  formData.append('image', file)
  try {
    const response = await fetch("https://fb-clone-production.up.railway.app/upload/assets", {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) throw new Error("Failed to upload assets");

    const data = await response.json();
    console.log("upload assets:", data);

    updateProfile(data.path)

  } catch (error) {
    console.error("Error to upload assets:", error);
  }
}

async function uploadPostPic(file) {
  const formData = new FormData
  formData.append('image', file)
  try {
    const response = await fetch("https://fb-clone-production.up.railway.app/upload/assets", {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) throw new Error("Failed to upload assets");

    const data = await response.json();
    console.log("upload assets:", data);

    uploadedPostPic = data.path

  } catch (error) {
    console.error("Error to upload assets:", error);
  }
}

async function updateProfile(path) {

  try {
    const updateData =
    {
      "name": currentUser.name,
      "profilePic": path
    }

    const response = await fetch("https://fb-clone-production.up.railway.app/users", {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) throw new Error("Failed to upload assets");

    const data = await response.json();
    console.log("upload assets:", data);

  } catch (error) {
    console.error("Error to upload assets:", error);
  }
}

// logout 

logoutBtn.addEventListener('click',function(){
  localStorage.removeItem("token")
  window.location.href = "/index.html"
})


