const BASE_URL = "http://localhost:3000/posts";
const postListDiv = document.getElementById("post-list");
const postDetailDiv = document.getElementById("post-detail");
const addNewPostTrigger = document.getElementById("add-new-post-btn");
const newPostSection = document.getElementById("new-post-section");
const newPostForm = document.getElementById("new-post-actual-form"); 
const editForm = document.getElementById("edit-post-form");
const editTitleInput = document.getElementById("edit-title");
const editContentInput = document.getElementById("edit-content");
let currentEditingPostId = null;

// Display all posts
function displayPosts() {
    fetch(BASE_URL)
        .then(res => res.json())
        .then(posts => {
            postListDiv.innerHTML = '';
            posts.forEach(renderPostSummary);
            if (posts.length > 0) {
                handlePostClick(posts[(posts.length > 0) ? 0 : null]?.id);
            } else {
                postDetailDiv.innerHTML = '<p>No posts available. Add a new one!</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
            postListDiv.innerHTML = '<li>Failed to load posts. Is json-server running?</li>';
        });
}

// Render single post summary in list
function renderPostSummary(post) {
    const li = document.createElement("li");
    li.dataset.id = post.id;

    li.innerHTML = `
        <img src="${post.image || 'https://via.placeholder.com/50/CCCCCC/FFFFFF?text=No+Img'}" alt="${post.title}">
        <span>${post.title}</span>
    `;

    li.addEventListener("click", () => {
        console.log("Post clicked! ID:", post.id);
        handlePostClick(post.id);
    });
    postListDiv.appendChild(li);
}

// Show full post details
function handlePostClick(id) {
    if (id === null || id === undefined) {
        postDetailDiv.innerHTML = '<p>Select a post from the left to see its details.</p>';
        return;
    }
    fetch(`${BASE_URL}/${id}`)
        .then(res => res.json())
        .then(post => {
            editForm.classList.add("hidden");
            postDetailDiv.classList.remove("hidden");

            postDetailDiv.innerHTML = `
                <h2>${post.title}</h2>
                <p><strong>Author:</strong> ${post.author}</p>
                <p>${post.content}</p>
                ${post.image ? `<img src="${post.image}" alt="${post.title}" style="max-width: 100%; height: auto; margin-top: 15px; border-radius: 5px;">` : ''}
                <div style="margin-top: 20px;">
                    <button id="edit-btn">Edit</button>
                    <button id="delete-btn">Delete</button>
                </div>
            `;

            document.getElementById("edit-btn").addEventListener("click", () => {
                editTitleInput.value = post.title;
                editContentInput.value = post.content;
                currentEditingPostId = post.id;
                postDetailDiv.classList.add("hidden");
                editForm.classList.remove("hidden");
            });

            document.getElementById("delete-btn").addEventListener("click", () => {
                deletePost(post.id);
            });
        })
        .catch(error => {
            console.error(`Error fetching post ${id}:`, error);
            postDetailDiv.innerHTML = '<p>Could not load post details.</p>';
        });
}

// 4. Add new post functionality
function addNewPostListener() {
    newPostForm.addEventListener("submit", e => { 
        e.preventDefault();

        const title = newPostForm.title.value;
        const author = newPostForm.author.value;
        const content = newPostForm.content.value;
        const image = document.getElementById('new-post-image').value;
        const finalImage = image || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=New+Post';

        fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ title, author, content, image: finalImage })
        })
            .then(res => res.json())
            .then(newPost => {
                renderPostSummary(newPost);
                newPostForm.reset();
                newPostSection.classList.add("hidden"); 
                handlePostClick(newPost.id);
            })
            .catch(error => {
                console.error('Error adding new post:', error);
                alert('Failed to add new post.');
            });
    });

    // Add event listener to the "Add New Post" button 
    addNewPostTrigger.addEventListener('click', () => {
        newPostSection.classList.toggle('hidden');
    });
}

// 5. Update existing post functionality
editForm.addEventListener("submit", e => {
    e.preventDefault();
    if (!currentEditingPostId) {
        console.warn("No post selected for editing.");
        return;
    }
    const updatedTitle = editTitleInput.value;
    const updatedContent = editContentInput.value;

    fetch(`${BASE_URL}/${currentEditingPostId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            title: updatedTitle,
            content: updatedContent
        })
    })
        .then(res => res.json())
        .then(() => {
            editForm.classList.add("hidden");
            displayPosts();
        })
        .catch(error => {
            console.error('Error updating post:', error);
            alert('Failed to update post.');
        });
});

// 6. Cancel edit functionality
document.getElementById("cancel-edit").addEventListener("click", () => {
    editForm.classList.add("hidden");
    if (currentEditingPostId) {
        handlePostClick(currentEditingPostId);
    } else {
        postDetailDiv.innerHTML = '<p>Select a post from the left to see its details.</p>';
    }
    currentEditingPostId = null;
});

// 7. Delete post functionality
function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    fetch(`${BASE_URL}/${id}`, {
        method: "DELETE"
    })
        .then(() => {
            displayPosts();
            postDetailDiv.innerHTML = '<p>Post deleted. Select another post or add a new one.</p>';
            editForm.classList.add("hidden");
            currentEditingPostId = null;
        })
        .catch(error => {
            console.error('Error deleting post:', error);
            alert('Failed to delete post.');
        });
}

// Start everything
function main() {
    displayPosts();
    addNewPostListener();
    
}

document.addEventListener("DOMContentLoaded", main);