'use strict';

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
        };
        this.handleChange = this.handleChange.bind(this);
    }

    render() {
        let classes = {
            count: '',
            input: 'form-control',
        }
        if (this.state.response.length >= this.state.maxChars) {
            classes.count = 'text-danger';
            classes.input += ' charLimit';
        }
        return (
            <div class="container postRow">
                <h4 class="bold-text">New Post</h4>
                <textarea onChange={this.handleChange} rows="4" cols="50" class={classes.input} maxlength="250" value={this.state.response}></textarea>
                <p id="charCount" class={classes.count}>{this.state.response.length}/{this.state.maxChars}</p>
                <button id="newPostButton" type="submit" class="btn btn-primary">Post</button>
            </div>
        );
    }

    handleChange(event) {
        this.setState({response: event.target.value});
    }
}

function App() {
    return (
        <div>
            <h1>All Posts</h1>
            <div id="newPost">
                <NewPost />
            </div>
            <div>
                <Post />
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('app-container'));