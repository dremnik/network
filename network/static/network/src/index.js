'use strict';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isAuthenticated: false,
        }
    }

    componentDidMount() {
        fetch("/authenticated/")
            .then(res => res.json())
            .then(
                (data) => {
                    this.setState({
                        isAuthenticated: data.auth,
                    });
                },
                (error) => {
                    this.setState({
                        isAuthenticated: false,
                        error
                    });
                }
            );
    }

    render() {
        const { error, isAuthenticated } = this.state;
        if (error) {
            return <div>Error: {error.message} </div>;
        } 
        return(
            <div>
                <h1>All Posts</h1>
                {isAuthenticated && <div id="newPost"><NewPost /></div>}
                <div>
                    <Post />
                </div>
            </div>
        )
    }
}

class Post extends React.Component {
    render() {
        return (
            <div class="container postRow">
                <h5 class="bold-text">Foo</h5>
                <a href="#">Edit</a>
                <p class="postContent">Hello!</p>
                <p class="timestamp text-muted">Timestamp: TODO</p>
                <p class="text-muted"># likes: TODO</p>
                <p class="text-muted">Comment?</p>
            </div>
        );
    }
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
                <textarea onChange={this.handleChange} rows="4" cols="50" class={classes.input} maxlength="250" value={this.state.response}></textarea>
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
            // TODO: this could be broken into a new function. (makePost)
            const csrftoken = getCookie('csrftoken'); // Need this in order to send a post request to Django
            const options = {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'X-CSRFToken': csrftoken},
                body: JSON.stringify({ content: input })
            }
            fetch("/new_post/", options)
                .then(res => res.json())
                .then(
                    (data) => {
                        if (data.success) {
                            // TODO
                            // Need to do an async reload at this point
                            console.log("the fetch was successful");
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
            // Make this a function
        }
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