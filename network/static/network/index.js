'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
    _inherits(App, _React$Component);

    function App(props) {
        _classCallCheck(this, App);

        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

        _this.state = {
            error: null,
            isAuthenticated: false
        };
        return _this;
    }

    _createClass(App, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            fetch("/authenticated/").then(function (res) {
                return res.json();
            }).then(function (data) {
                _this2.setState({
                    isAuthenticated: data.auth
                });
            }, function (error) {
                _this2.setState({
                    isAuthenticated: false,
                    error: error
                });
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _state = this.state,
                error = _state.error,
                isAuthenticated = _state.isAuthenticated;

            if (error) {
                return React.createElement(
                    "div",
                    null,
                    "Error: ",
                    error.message,
                    " "
                );
            }
            return React.createElement(
                "div",
                null,
                React.createElement(
                    "h1",
                    null,
                    "All Posts"
                ),
                isAuthenticated && React.createElement(
                    "div",
                    { id: "newPost" },
                    React.createElement(NewPost, null)
                ),
                React.createElement(
                    "div",
                    null,
                    React.createElement(Post, null)
                )
            );
        }
    }]);

    return App;
}(React.Component);

var Post = function (_React$Component2) {
    _inherits(Post, _React$Component2);

    function Post() {
        _classCallCheck(this, Post);

        return _possibleConstructorReturn(this, (Post.__proto__ || Object.getPrototypeOf(Post)).apply(this, arguments));
    }

    _createClass(Post, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { "class": "container postRow" },
                React.createElement(
                    "h5",
                    { "class": "bold-text" },
                    "Foo"
                ),
                React.createElement(
                    "a",
                    { href: "#" },
                    "Edit"
                ),
                React.createElement(
                    "p",
                    { "class": "postContent" },
                    "Hello!"
                ),
                React.createElement(
                    "p",
                    { "class": "timestamp text-muted" },
                    "Timestamp: TODO"
                ),
                React.createElement(
                    "p",
                    { "class": "text-muted" },
                    "# likes: TODO"
                ),
                React.createElement(
                    "p",
                    { "class": "text-muted" },
                    "Comment?"
                )
            );
        }
    }]);

    return Post;
}(React.Component);

var NewPost = function (_React$Component3) {
    _inherits(NewPost, _React$Component3);

    function NewPost(props) {
        _classCallCheck(this, NewPost);

        var _this4 = _possibleConstructorReturn(this, (NewPost.__proto__ || Object.getPrototypeOf(NewPost)).call(this, props));

        _this4.state = {
            response: "",
            maxChars: 250,
            error: null
        };
        _this4.handleChange = _this4.handleChange.bind(_this4);
        _this4.handleClick = _this4.handleClick.bind(_this4);
        return _this4;
    }

    _createClass(NewPost, [{
        key: "render",
        value: function render() {
            var classes = {
                count: 'text-right',
                input: 'form-control'
            };
            if (this.state.response.length >= this.state.maxChars) {
                classes.count += ' text-danger';
                classes.input += ' fieldError';
            } else if (this.state.error) {
                classes.input += ' fieldError';
            }
            return React.createElement(
                "div",
                { "class": "container postRow" },
                React.createElement(
                    "h4",
                    { "class": "bold-text" },
                    "New Post"
                ),
                React.createElement("textarea", { id: "newPostField", onChange: this.handleChange, rows: "4", cols: "50", "class": classes.input, maxlength: "250", value: this.state.response }),
                this.state.error && React.createElement(
                    "div",
                    null,
                    React.createElement(
                        "p",
                        { id: "newPostError", "class": "text-danger text-right" },
                        this.state.error
                    )
                ) /* handling for errors */,
                React.createElement(
                    "p",
                    { id: "charCount", "class": classes.count },
                    this.state.response.length,
                    "/",
                    this.state.maxChars
                ),
                React.createElement(
                    "button",
                    { onClick: this.handleClick, id: "newPostButton", type: "submit", "class": "btn btn-primary" },
                    "Post"
                )
            );
        }

        // Handling when user types in the new post textarea

    }, {
        key: "handleChange",
        value: function handleChange(event) {
            this.setState({ response: event.target.value });
        }

        // Handling for new posts

    }, {
        key: "handleClick",
        value: function handleClick() {
            var _this5 = this;

            this.setState({ error: null }); // Initialize error to null by default so it disappears on next submit

            var input = this.state.response.trim();
            if (input.length <= 0) {
                this.setState({ error: "Post cannot be empty." });
            } else {
                // TODO: this could be broken into a new function. (makePost)
                var csrftoken = getCookie('csrftoken'); // Need this in order to send a post request to Django
                var options = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                    body: JSON.stringify({ content: input })
                };
                fetch("/new_post/", options).then(function (res) {
                    return res.json();
                }).then(function (data) {
                    if (data.success) {
                        // TODO
                        // Need to do an async reload at this point
                        console.log("the fetch was successful");
                        _this5.setState({
                            response: ""
                        });
                    } else {
                        // No error in the fetch, but server returned error response.
                        _this5.setState({
                            error: data.error
                        });
                    }
                },
                // An error occurred in the fetch itself.
                function (error) {
                    console.log(error.message);
                });
                // Make this a function
            }
        }
    }]);

    return NewPost;
}(React.Component);

// Helper function for retrieving cookies.
// Source: Django docs - in order to use csrf token in AJAX requests.


function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === name + '=') {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

ReactDOM.render(React.createElement(App, null), document.getElementById('app-container'));