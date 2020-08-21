'use strict';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isAuthenticated: false,
			user: "",
			page: 1,
			posts: [],
        }
		this.loadPosts = this.loadPosts.bind(this);
		this.handleMakePost = this.handleMakePost.bind(this);
    }

    componentDidMount() {
        fetch("/authenticated/")
            .then(res => res.json())
            .then(
                (data) => {
                    this.setState({
                        isAuthenticated: data.auth,
						user: data.user,
                    });
                },
                (error) => {
                    this.setState({
                        isAuthenticated: false,
                        error
                    });
                }
            );
		// Load initial posts.
		this.loadPosts(this.state.page);
    }

    render() {
        const { error, isAuthenticated } = this.state;
        if (error) {
            return <div>Error: {error.message} </div>;
        } 
		const posts = this.state.posts.map(post => 
			<Post onMakePost={this.handleMakePost} user={this.state.user} key={post.pk} id={post.pk} post={post.fields}/>
		);
        return(
            <div>
                <h1>All Posts</h1>
                {isAuthenticated && 
					<div id="newPost">
						<div class="container postRow">
							<h4 class="bold-text">New Post</h4>
							<NewPost isNew={true} text={""} onMakePost={this.handleMakePost}/>
						</div>
					</div>
				}
                <div>
					{posts}
                </div>
            </div>
        )
    }

	handleMakePost(isNew, content) {
		let page = this.state.page;
		if (isNew)
			page = 1

		this.setState({page: page}, this.loadPosts());
	}

	// Load new page of posts.
	loadPosts() {
		const page = this.state.page; 
		fetch(`posts/list/?page=${page}`)
            .then(res => res.json())
			.then(data => {
				this.setState({
					posts: data,
				});
			})
			.catch(error => {
				console.log("could not retrieve posts: ", error);
			});
	}

}

class Post extends React.Component {
	constructor(props) {
		super(props);

		const date = new Date(props.post.timestamp); // converting ISO timestamp to human readable
		const timestamp = date.toDateString() + ', ' + date.toLocaleTimeString();
		const likedByMe = props.post.liked_by.includes(props.user); // was post liked by current user?
		this.state = {
			current_user: props.user,
			id: props.id,
			author: props.post.author,
			content: props.post.content,
			likeCount: props.post.liked_by.length,
			timestamp: timestamp,
			likedByMe: likedByMe,
			editing: false
		}
		this.handleLikeClick = this.handleLikeClick.bind(this);
		this.handleEditClick = this.handleEditClick.bind(this);
		this.handleUpdatePost = this.handleUpdatePost.bind(this);
		this.handleProfileClick = this.handleProfileClick.bind(this);
	}

	render() {
		const authorIsMe = this.state.author === this.state.current_user;
		let heartClass = "likeHeart";
		if (this.state.current_user != null)
			heartClass += " clickable"; // enabling cursor pointer

		return (
			<div class="container postRow">
				<div class="profile-info">
					<img onClick={this.handleProfileClick} class="profile-pic clickable" src="static/network/assets/profile_pic.jpg"/>
					<h5 class="bold-text inline-text">{this.state.author}</h5>
				</div>
				{authorIsMe && !this.state.editing // only render edit if author is me and not editing
					? <a onClick={this.handleEditClick} href="#">Edit</a>
					: <div></div>
				}
				{this.state.editing
					? <NewPost isNew={false} editId={this.state.id} text={this.state.content} onMakePost={this.handleUpdatePost}/>
					: <p class="postContent">{this.state.content}</p>
				}
				
				<p class="timestamp text-muted">{this.state.timestamp}</p>
				<span>
					{this.state.likedByMe // render red heart current user has liked post.
						? <img onClick={this.handleLikeClick} class={heartClass} src="static/network/assets/red-heart-icon.png"/>
						: <img onClick={this.handleLikeClick} class={heartClass} src="static/network/assets/heart-icon-sm.png"/>
					}
					<p class="text-muted inline-text">{this.state.likeCount}</p>
				</span>
				<p class="text-muted">Comment?</p>
			</div>
		);
	}

	handleLikeClick() {
		// if no user is logged in
		if (this.state.current_user == null)
			return false;
		
		let url = "";
		// if current user hasn't liked post
		if (!this.state.likedByMe) { 
			this.setState((state) => ({
				likeCount: state.likeCount + 1,
				likedByMe: true
			}));
			url = `/likes/create/${this.state.id}/`;
		} else { // if current user has liked post 
			this.setState((state) => ({ 
				likeCount: state.likeCount - 1,
				likedByMe: false
			}));
			url = `/likes/destroy/${this.state.id}/`;
		}
		const csrftoken = getCookie('csrftoken'); // needed for Django POST
		const options = {
			method: 'POST',
			headers: {'Content-Type': 'application/json', 'X-CSRFToken': csrftoken},
		}
		// Note that the URL is dependent on whether user has liked post already or not.
		fetch(url, options)
			.then(res => res.json())
			.then(data => {
				if (data.error) // server returned error message
					console.log(data.error);
			})
			.catch(error => { 
				console.log("could not create/destroy like", error);
			});
	}

	handleEditClick() {
		this.setState({editing: true});
	}
	handleUpdatePost(isNew, newContent) {
		// isNew will be always be false, as this is an edited post. bit of a poor design choice.
		this.setState({
			editing: false,
			content: newContent // manually setting content to force render
		});
		this.props.onMakePost(false, null); // notify parent element
	}

	handleProfileClick() {
		// TODO
		return false;
	}
}

// NewPost represents the necessary components to create or edit a post.
class NewPost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
			isNew: this.props.isNew,
			editId: this.props.editId,
            response: this.props.text,
            maxChars: 250,
            error: null,
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.makePost = this.makePost.bind(this);
    }

    render() {
        let classes = {
            count: 'text-right',
            input: 'form-control',
        }
        if (this.state.response.length >= this.state.maxChars) {
            classes.count += ' text-danger';
            classes.input += ' fieldError';
        } else if (this.state.error) {
            classes.input += ' fieldError';
        }
        return (
            <div>
                <textarea id="newPostField" onChange={this.handleChange} rows="4" cols="50" class={classes.input} maxlength="250" value={this.state.response}></textarea>
                {this.state.error && <div><p id="newPostError" class="text-danger text-right">{this.state.error}</p></div> /* handling for errors */} 
                <p id="charCount" class={classes.count}>{this.state.response.length}/{this.state.maxChars}</p>
                <button onClick={this.handleClick} id="newPostButton" type="submit" class="btn btn-primary">Post</button>
            </div>
        );
    }

    // Handling when user types in the new post textarea
    handleChange(event) {
        this.setState({response: event.target.value});
    }

    // Handling for new posts
    handleClick() {
        this.setState({error: null}); // Initialize error to null by default so it disappears on next submit

        const input = this.state.response.trim();
        if (input.length <= 0) {
            this.setState({error: "Post cannot be empty."});
        } else {
			this.makePost(input);
        }
    }

	// Handler for user creating posts.
	makePost(content) {
		const csrftoken = getCookie('csrftoken'); // Need this in order to send a post request to Django
		const options = {
			method: 'POST',
			headers: {'Content-Type': 'application/json', 'X-CSRFToken': csrftoken},
			body: JSON.stringify({ content: content })
		}
		let url = `/posts/create/`;
		if (!this.state.isNew) // this means it is a post being edited
			url = `/posts/update/${this.state.editId}/`;

		fetch(url, options)
			.then(res => res.json())
			.then(
				(data) => {
					if (data.error) {
						// No error in the fetch, but server returned error response.
						this.setState({
							error: data.error
						});
					}
					this.props.onMakePost(this.state.isNew, content); // notify parent element
					this.setState({
						response: ""
					});
				},
				// An error occurred in the fetch itself.
				(error) => {
					console.log(error.message);
				}
			);
	}

}

// Helper function for retrieving cookies.
// Source: Django docs - in order to use csrf token in AJAX requests.
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

ReactDOM.render(<App />, document.getElementById('app-container'));
