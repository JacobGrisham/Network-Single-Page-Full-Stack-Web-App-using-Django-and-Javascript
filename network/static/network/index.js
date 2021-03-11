document.onreadystatechange = () => {
  if (document.readyState !== "complete") {
    document.querySelector("body").style.visibility = "hidden";
    document.querySelector("#loader").style.visibility = "visible";
  } else {
    document.querySelector("#loader").style.display = "none";
    document.querySelector("body").style.visibility = "visible";

    // By default, load the public view
    loadPosts('public', 0, 0);
    pageNavigation('public', 0, 0);

    // Check if #username exists by returning boolean value
    var profile = !!document.querySelector('#username')

    // If user is logged in add event listeners to additional nav items
    if (profile) {

      // // Main menu icon animation
      // nav = document.querySelector('#main-menu')
      // buttons = nav.children
      // for (let i = 0; i < buttons.length; i++) {
      //   buttons[i].onclick = function (event) {
      //     //remove all active class
      //     for (let j = 0; j < buttons.length; j++) {
      //       buttons[j].classList.remove('icon-background-active');
      //       buttons[j].firstChild.remove("fa-2x");
      //     }
      //     if (event.target.innerHTML === this.innerHTML) {
      //         this.classList.add("icon-background-active");
      //         this.firstChild.classList.add("fa-2x");
      //     }
      //   }
      // }

      // Set the default route using my_id
      var my_id = document.querySelector('#my-id').innerHTML;

      // Allow access to user's own profile
      document.querySelector('#username').addEventListener('click', () => {
        loadPosts('profile', my_id, 0);
        loadProfile(my_id);
        pageNavigation('profile', my_id, 0);
        document.querySelector('#page-navigation').style.display = 'block';
        });

      // Use nav items to toggle between views
      document.querySelector('#nav-public').addEventListener('click', () => {
        loadPosts('public', my_id, 0);
        pageNavigation('public', 0);
        document.querySelector('#page-navigation').style.display = 'block';
      });
      document.querySelector('#nav-following').addEventListener('click', () => {
        loadPosts('following', my_id, 0);
        pageNavigation('following', my_id, 0);
        document.querySelector('#page-navigation').style.display = 'block';
      });
      document.querySelector('#nav-chirp').addEventListener('click', () => {
        loadChirp();
        document.querySelector('#page-navigation').style.display = 'none';
      });
    } else {
      document.querySelector('#chirp-view').style.display = 'none';
    }
  } 
}

function loadPosts(view, user_id, page) {

  // Assign variables to querySelectors
  public_view = document.querySelector('#public-view');
  profile_view = document.querySelector('#profile-view');
  following_view = document.querySelector('#following-view');
  chirp_view = document.querySelector('#chirp-view');

  document.querySelector('#posts').style.display = 'block';

  // Change view based on view selection
  if (view == 'public') {
    // Show public view and hide other views
    public_view.style.display = 'block';
    profile_view.style.display = 'none';
    following_view.style.display = 'none';
    chirp_view.style.display = 'none';
  }
  else if (view == 'profile') {
    // Show profile view and hide other views
    public_view.style.display = 'none';
    profile_view.style.display = 'block';
    following_view.style.display = 'none';
    chirp_view.style.display = 'none';
  }
  else if (view == 'following') {
    // Show following view and hide other views
    public_view.style.display = 'none';
    profile_view.style.display = 'none';
    following_view.style.display = 'block';
    chirp_view.style.display = 'none';
  }

  // Fetch posts based on view selection
  fetch("posts/" + view + "/" + user_id + "/" + page)
  .then(response => response.json())
  .then(posts => {

    var postsView = document.querySelector("#posts");

    // Reset postsView each time function is called
    postsView.innerHTML = '';

    for (let i = 0; i < posts.length; i++) {

      // Fetch post data and insert it into each post
      // Create HTML for the structure of each post
      var list_item = document.createElement('div');
      list_item.classList.add("list-group-item");

      var post_id = posts[i].post_id;
      list_item.setAttribute("id", "post-id-" + post_id);

      var user = document.createElement('strong');
      user.innerHTML = posts[i].author;
      author_id = posts[i].author_id;
      user.classList.add("user-id-" + author_id, "mr-2", "mb-2", "user-link");

      // Use closure to add event listener for accessing author's profile
      (function(index){
        user.addEventListener("click", () => {
          loadProfile(posts[index].author_id);
          loadPosts('profile', posts[index].author_id, 0);
        })
      })(i)

      var timestamp = document.createElement('small');
      timestamp.innerHTML = posts[i].timestamp;
      timestamp.classList.add("text-muted");

      var content = document.createElement('p');
      content.innerHTML = posts[i].content;
      content.classList.add("content")

      // Append post data to each post
      // Append HTML for the structure of each post
      list_item.appendChild(user);
      list_item.appendChild(timestamp);
      list_item.appendChild(content);

      // Create bottom row for each post
      var bottom_row = document.createElement('div');
      bottom_row.classList.add("d-flex", "justify-content-around", "post-interactions");

      // Check if #username exists by returning boolean value
      var profile = !!document.querySelector('#username');
      // Only display the bottom row if user is logged in
      if (profile){
        var conditional = document.createElement('i');

        // If post author is the same as the logged-in user, allow editing
        if (posts[i].author == document.querySelector('#username').innerHTML) {
          conditional.classList.add('fas', 'fa-edit');

          // Use closure to add event listener for editing posts
          (function(index){
            conditional.addEventListener("click", () => {
              edit(posts[index].post_id);
            })
          })(i)
        }
        else {
          conditional.classList.add('fas', 'fa-retweet');
        }

        var comment = document.createElement('i');
        comment.classList.add('fas', 'fa-comment');

        var like = document.createElement('i');
        like.classList.add('fas', 'fa-heart');
        like.setAttribute("id", "like-id-" + post_id);

        // Use closure to add event listener for liking and unliking posts
        (function(index){
          like.addEventListener("click", () => {
            likePost(posts[index].post_id);
          })
        })(i)

        loadLikes(post_id);

        var share = document.createElement('i');
        share.classList.add('fas', 'fa-share-square');

        // Append HTML for the structure of the bottom row
        bottom_row.appendChild(conditional);
        bottom_row.appendChild(comment);
        bottom_row.appendChild(like);
        bottom_row.appendChild(share);
        list_item.appendChild(bottom_row);
      }  

      // Append each complete post to the post view
      postsView.append(list_item);
    }
  })
  .catch(error => {
    console.error('Ooops! There was an error during the fetch operation:', error);
  })

}

function pageNavigation(view, user_id, page) {
  var previous =  document.querySelector('#previous');
  if (page == 0) {
    previous.setAttribute("disabled", "disabled");
    previous.parentNode.classList.add('disabled');
  }
  previous.addEventListener('click', () => {
    if (page == 0) {
      previous.setAttribute("disabled", "disabled");
      previous.parentNode.classList.add('disabled');
    }
    else if (page > 0) {
      page = page - 1
    }
    loadPosts(view, user_id, page)
  });
  document.querySelector('#next').addEventListener('click', () => {
    previous.removeAttribute("disabled");
    previous.parentNode.classList.remove('disabled');
    page = page + 1
    loadPosts(view, user_id, page)
  });

}

function loadProfile(user_id) {

  // Fetch profile statistics based on user_id
  fetch("profile/" + user_id)
  .then(response => response.json())
  .then(profile => {

    var profile_info = document.querySelector('#profile-info');

    // Reset postsView each time function is called
    profile_info.innerHTML = "";

    // Fetch profile statistics data and insert it into the profile
    // Create HTML for the structure of each statistic
    var user = document.createElement('h3');
    user.innerHTML = profile.username;

    var following =  document.createElement('div');
    following.innerHTML = "Following: " + profile.following;
    following.setAttribute("id", "following");

    var followers = document.createElement('div');
    followers.innerHTML = "Followers: " + profile.followers;
    followers.setAttribute("id", "followers");

    // Append each statistic to the profile statistics view
    profile_info.appendChild(user);
    profile_info.appendChild(following);
    profile_info.appendChild(followers);

    // Prevent users from following themselves
    if (user_id != document.querySelector('#my-id').innerHTML) {
      // Toggle between Follow and Unfollow
      var followView = document.querySelector('#toggle-follow');
      var toggle_button =  document.createElement('div');
      toggle_button.setAttribute("id", "toggle-button")

      profile.currently_following ? toggle_button.innerHTML = "Unfollow" : toggle_button.innerHTML = "Follow";

      toggle_button.classList.add("btn", "btn-blue", "text-white");

      followView.appendChild(toggle_button);
      profile_info.appendChild(followView);
      followView.addEventListener('click', () => {
        follow(user_id);
      })
    }

  })
  .catch(error => {
    console.error('Ooops! There was an error during the fetch operation:', error);
  })
}

function loadChirp() {

  // Show chirp view and hide other views
  document.querySelector('#public-view').style.display = 'none';
  document.querySelector('#profile-view').style.display = 'none';
  document.querySelector('#following-view').style.display = 'none';
  document.querySelector('#chirp-view').style.display = 'block';
  document.querySelector('#posts').style.display = 'none';

  var chirp_textarea = document.querySelector('#chirp-textarea');
  var chirp_button = document.querySelector('#chirp-button');

  
  // // Remove the disabled class and attribute once user begins to type
  // chirp_textarea.addEventListener('compositionstart', () => {

  //   // Toggle the disabled class and attribute based on empty vs non-empty textarea
  //   if (chirp_textarea.value == '') {
  //     chirp_button.classList.add("disabled");
  //     chirp_button.setAttribute("disabled");
  //   } else {
  //     chirp_button.classList.remove("disabled");
  //     chirp_button.removeAttribute("disabled");
  //   }
  // });
  

  chirp_button.addEventListener('click', function post() {

    fetch("post/add", {
      method: "POST",
      body: JSON.stringify({
        content: document.querySelector('#chirp-textarea').value
      })
    })
    .then(response => response.json())
    .catch(error => {
      console.error('Ooops! There was an error during the fetch operation:', error);
    })
  });
}

function edit(post_id) {

  var post_content = document.querySelector('#post-id-' + post_id).children[2];

  var content = post_content.innerHTML;

  // Create form parent
  var form = document.createElement('form');
  form.classList.add('form-group');

  // Replace <p> tag with <textarea> tag to allow user to edit thier post
  var textarea = document.createElement('textarea');
  textarea.innerHTML = content;
  textarea.classList.add('form-control', 'mt-1');
  textarea.setAttribute('value', content);
  textarea.setAttribute('id', 'edit');

  // Create save/submit button
  var save = document.createElement('div');
  save.innerHTML = 'Save';
  save.classList.add('btn', 'btn-blue', 'text-white', 'mr-3');
  save.setAttribute('id', 'save');

  // Create cancel button
  var cancel = document.createElement('div');
  cancel.innerHTML = 'Cancel';
  cancel.classList.add('btn', 'btn-outline-blue');
  cancel.setAttribute('id', 'cancel');

  // Create container for buttons
  var bottom = document.createElement('div');
  bottom.classList.add('mt-1');

  // Put the html form together
  bottom.appendChild(save)
  bottom.appendChild(cancel)
  form.appendChild(textarea);
  form.appendChild(bottom);

  post_content.parentNode.replaceChild(form, post_content);

  document.querySelector('#save').addEventListener('click', () => {

    edited_content = document.querySelector('#edit').value;

    fetch("post/" + (post_id), {
      method: "POST",
      body: JSON.stringify({
        content: edited_content
      })
    })
    .catch(error => {
      console.error('Ooops! There was an error during the fetch operation:', error);
    });


    var content = document.createElement('p');
    content.innerHTML = edited_content;
    content.classList.add("content");
    document.querySelector('#post-id-' + post_id).children[2].parentNode.replaceChild(content, form);

  });

  document.querySelector('#cancel').addEventListener('click', () => {
    var old_content = document.createElement('p');
    old_content.innerHTML = content;
    old_content.classList.add("content");

    document.querySelector('#post-id-' + post_id).children[2].replaceChild(old_content, form);
  });

}

function likePost(post_id) {
  fetch("like/" + post_id, {
    method: "POST"
  })
  .catch(error => {
    console.error('Ooops! There was an error during the fetch operation:', error);
  });

  setTimeout(() => {
    // Update total like count and color of like icon
    loadLikes(post_id);
  }, 10);
}

function loadLikes(post_id) {
  fetch("like/" + post_id)
  .then(response => response.json())
  .then(likes => {
    document.querySelector('#like-id-' + post_id).innerHTML = likes.total_likes

    if (likes.user_liked == true) {
      document.querySelector('#like-id-' + post_id).classList.add('liked');
    } else {
      document.querySelector('#like-id-' + post_id).classList.remove('liked');
    }

  })
  .catch(error => {
    console.error('Ooops! There was an error during the fetch operation:', error);
  });
}

function follow(follower_id) {
  fetch("follow/" + follower_id, {
    method: "POST",
    body: JSON.stringify({
      follower_id: follower_id
    })
  })
  .catch(error => {
    console.error('Ooops! There was an error during the fetch operation:', error);
  })

  setTimeout(() => {
    // Update number of followers and follow/unfollow button
    reloadProfile(follower_id)
  }, 10);
}

function reloadProfile(user_id) {
  fetch("profile/" + user_id)
  .then(response => response.json())
  .then(profile => {
    following = document.querySelector('#following');
    following.innerHTML = "Following: " + profile.following;

    followers = document.querySelector('#followers');
    followers.innerHTML = "Followers: " + profile.followers;

    toggle_button = document.querySelector('#toggle-button');
    profile.currently_following ? toggle_button.innerHTML = "Unfollow" : toggle_button.innerHTML = "Follow";

  })
  .catch(error => {
    console.error('Ooops! There was an error during the fetch operation:', error);
  });
}
