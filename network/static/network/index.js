'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Post = function (_React$Component) {
    _inherits(Post, _React$Component);

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

var NewPost = function (_React$Component2) {
    _inherits(NewPost, _React$Component2);

    function NewPost(props) {
        _classCallCheck(this, NewPost);

        var _this2 = _possibleConstructorReturn(this, (NewPost.__proto__ || Object.getPrototypeOf(NewPost)).call(this, props));

        _this2.state = {
            response: "",
            maxChars: 250,
            error: null
        };
        _this2.handleChange = _this2.handleChange.bind(_this2);
        _this2.handleClick = _this2.handleClick.bind(_this2);
        return _this2;
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
                React.createElement("textarea", { onChange: this.handleChange, rows: "4", cols: "50", "class": classes.input, maxlength: "250", value: this.state.response }),
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
            if (this.state.error) {
                this.setState({ error: null });
            }
            var input = this.state.response.trim();
            if (input.length <= 0) {
                this.setState({ error: "Post cannot be empty." });
            }
        }
    }]);

    return NewPost;
}(React.Component);

var App = function (_React$Component3) {
    _inherits(App, _React$Component3);

    function App(props) {
        _classCallCheck(this, App);

        var _this3 = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

        _this3.state = {
            error: null,
            isAuthenticated: false
        };
        return _this3;
    }

    _createClass(App, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this4 = this;

            fetch("/authenticated/").then(function (res) {
                return res.json();
            }).then(function (data) {
                _this4.setState({
                    isAuthenticated: data.auth
                });
            }, function (error) {
                _this4.setState({
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

ReactDOM.render(React.createElement(App, null), document.getElementById('app-container'));