// Get posts (with optional filters)
async function getPosts(userId = null, title = null) {
    let url = 'https://localhost:5000/posts?';

    if (userId) url += `userId=${userId}&`;
    if (title) url += `title=${title}&`;

    // Removing the trailing '&' if any
    url = url.slice(0, -1);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Posts:', data);
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

// Create a new post
async function createPost(postData) {
    try {
        const response = await fetch('https://localhost:5000/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });
        if (!response.ok) {
            throw new Error('Failed to create post');
        }
        const data = await response.json();
        console.log('Created Post:', data);
    } catch (error) {
        console.error('Error creating post:', error);
    }
}

// Get a post by ID
async function getPostById(postId) {
    try {
        const response = await fetch(`https://localhost:5000/posts/${postId}`);
        if (!response.ok) {
            throw new Error('Post not found');
        }
        const data = await response.json();
        console.log('Post:', data);
    } catch (error) {
        console.error('Error fetching post:', error);
    }
}


async function delete_temp_post(postID){
  try{
    const response = await fetch(`https://localhost:5000/demo_posts//${demo_postID}`,{}\
        method:'DELETE',
  );

  if(!response.ok){
        throw new error('failed to delete post');
  }
  console.log('post deleted');
  } catch(error){
    console.error('error deleting post:', error);
  }
} 






// Update a post
async function updatePost(postId, postData) {
    try {
        const response = await fetch(`https://localhost:5000/posts/${postId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });
        if (!response.ok) {
            throw new Error('Failed to update post');
        }
        const data = await response.json();
        console.log('Updated Post:', data);
    } catch (error) {
        console.error('Error updating post:', error);
    }
}

// Delete a post
async function deletePost(postId) {
    try {
        const response = await fetch(`https://localhost:5000/posts/${postId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete post');
        }
        console.log('Post deleted');
    } catch (error) {
        console.error('Error deleting post:', error);
    }
}

// Example usage:

// Get all posts
getPosts();

// Create a new post
createPost({
    userId: 1,
    title: 'New Post Title',
    body: 'This is the body of the new post.',
});

// Get a post by ID
getPostById(1);

// Update a post by ID
updatePost(1, {
    userId: 1,
    title: 'Updated Post Title',
    body: 'This is the updated body of the post.',
});

// Delete a post by ID
deletePost(1);
