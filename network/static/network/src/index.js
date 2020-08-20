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
			<Post user={this.state.user} key={post.pk} id={post.pk} post={post.fields}/>
		);
        return(
            <div>
                <h1>All Posts</h1>
                {isAuthenticated && <div id="newPost"><NewPost onMakePost={this.handleMakePost}/></div>}
                <div>
					{posts}
                </div>
            </div>
        )
    }

	handleMakePost() {
		this.setState({page: 1}, this.loadPosts());
	}

	// Load new page of posts.
	loadPosts() {
		const page = this.state.page; 
		fetch(`posts/list/?page=${page}`)
            .then(res => res.json())
			.then(data => {
				const new_posts = data;
				this.setState({
					posts: new_posts,
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
			likedByMe: likedByMe
		}
		this.handleLikeClick = this.handleLikeClick.bind(this);
		// this.handleEditClick = this.handleEditClick.bind(this);
	}

	render() {
		const authorIsMe = this.state.author === this.state.current_user;
		let heartClass = "likeHeart";
		if (this.state.current_user != null)
			heartClass = "likeHeartAuth"; // enabling cursor pointer

		return (
			<div class="container postRow">
				<h5 class="bold-text">{this.state.author}</h5>
				{authorIsMe // only render edit if author is me
					? <a href="#">Edit</a>
					: <div></div>
				}
				<p class="postContent">{this.state.content}</p>
				<p class="timestamp text-muted">{this.state.timestamp}</p>
				<span>
					{this.state.likedByMe // render red heart if post has likes
						? <img onClick={this.handleLikeClick} class={heartClass} src="static/network/assets/red-heart-icon.png"/>
						: <img onClick={this.handleLikeClick} class={heartClass} src="static/network/assets/heart-icon-sm.png"/>
					}
					<p class="text-muted likeCount">{this.state.likeCount}</p>
				</span>
				<p class="text-muted">Comment?</p>
			</div>
		);
	}

	handleLikeClick() {
		// if no user is logged in
		if (this.state.current_user === null)
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
				if (!data.success)
					console.log(data.error);
			})
			.catch(error => { 
				console.log("could not create/destroy like", error);
			});
	}

	// handleEditClick() {
	// 	// TODO
	// 	return false;
	// }
}

class NewPost extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            response: "",
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
            <div class="container postRow">
				<h4 class="bold-text">New Post</h4>
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
		fetch("/posts/create/", options)
			.then(res => res.json())
			.then(
				(data) => {
					if (data.success) {
						this.props.onMakePost(); // notify parent element
						this.setState({
							response: ""
						});
					} else {
						// No error in the fetch, but server returned error response.
						this.setState({
							error: data.error
						});
					}
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
