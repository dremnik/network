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
			isAuthenticated: false,
			user: "",
			page: 1,
			posts: []
		};
		_this.loadPosts = _this.loadPosts.bind(_this);
		_this.handleMakePost = _this.handleMakePost.bind(_this);
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
					isAuthenticated: data.auth,
					user: data.user
				});
			}, function (error) {
				_this2.setState({
					isAuthenticated: false,
					error: error
				});
			});
			// Load initial posts.
			this.loadPosts(this.state.page);
		}
	}, {
		key: "render",
		value: function render() {
			var _this3 = this;

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
			var posts = this.state.posts.map(function (post) {
				return React.createElement(Post, { onMakePost: _this3.handleMakePost, user: _this3.state.user, key: post.pk, id: post.pk, post: post.fields });
			});
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
					React.createElement(
						"div",
						{ "class": "container postRow" },
						React.createElement(
							"h4",
							{ "class": "bold-text" },
							"New Post"
						),
						React.createElement(NewPost, { isNew: true, text: "", onMakePost: this.handleMakePost })
					)
				),
				React.createElement(
					"div",
					null,
					posts
				)
			);
		}
	}, {
		key: "handleMakePost",
		value: function handleMakePost(isNew, content) {
			var page = this.state.page;
			if (isNew) page = 1;

			this.setState({ page: page }, this.loadPosts());
		}

		// Load new page of posts.

	}, {
		key: "loadPosts",
		value: function loadPosts() {
			var _this4 = this;

			var page = this.state.page;
			fetch("posts/list/?page=" + page).then(function (res) {
				return res.json();
			}).then(function (data) {
				_this4.setState({
					posts: data
				});
			}).catch(function (error) {
				console.log("could not retrieve posts: ", error);
			});
		}
	}]);

	return App;
}(React.Component);

var Post = function (_React$Component2) {
	_inherits(Post, _React$Component2);

	function Post(props) {
		_classCallCheck(this, Post);

		var _this5 = _possibleConstructorReturn(this, (Post.__proto__ || Object.getPrototypeOf(Post)).call(this, props));

		var date = new Date(props.post.timestamp); // converting ISO timestamp to human readable
		var timestamp = date.toDateString() + ', ' + date.toLocaleTimeString();
		var likedByMe = props.post.liked_by.includes(props.user); // was post liked by current user?
		_this5.state = {
			current_user: props.user,
			id: props.id,
			author: props.post.author,
			content: props.post.content,
			likeCount: props.post.liked_by.length,
			timestamp: timestamp,
			likedByMe: likedByMe,
			editing: false
		};
		_this5.handleLikeClick = _this5.handleLikeClick.bind(_this5);
		_this5.handleEditClick = _this5.handleEditClick.bind(_this5);
		_this5.handleUpdatePost = _this5.handleUpdatePost.bind(_this5);
		_this5.handleProfileClick = _this5.handleProfileClick.bind(_this5);
		return _this5;
	}

	_createClass(Post, [{
		key: "render",
		value: function render() {
			var authorIsMe = this.state.author === this.state.current_user;
			var heartClass = "likeHeart";
			if (this.state.current_user != null) heartClass += " clickable"; // enabling cursor pointer

			return React.createElement(
				"div",
				{ "class": "container postRow" },
				React.createElement(
					"div",
					{ "class": "profile-info" },
					React.createElement("img", { onClick: this.handleProfileClick, "class": "profile-pic clickable", src: "static/network/assets/profile_pic.jpg" }),
					React.createElement(
						"h5",
						{ "class": "bold-text inline-text" },
						this.state.author
					)
				),
				authorIsMe && !this.state.editing // only render edit if author is me and not editing
				? React.createElement(
					"a",
					{ onClick: this.handleEditClick, href: "#" },
					"Edit"
				) : React.createElement("div", null),
				this.state.editing ? React.createElement(NewPost, { isNew: false, editId: this.state.id, text: this.state.content, onMakePost: this.handleUpdatePost }) : React.createElement(
					"p",
					{ "class": "postContent" },
					this.state.content
				),
				React.createElement(
					"p",
					{ "class": "timestamp text-muted" },
					this.state.timestamp
				),
				React.createElement(
					"span",
					null,
					this.state.likedByMe // render red heart current user has liked post.
					? React.createElement("img", { onClick: this.handleLikeClick, "class": heartClass, src: "static/network/assets/red-heart-icon.png" }) : React.createElement("img", { onClick: this.handleLikeClick, "class": heartClass, src: "static/network/assets/heart-icon-sm.png" }),
					React.createElement(
						"p",
						{ "class": "text-muted inline-text" },
						this.state.likeCount
					)
				),
				React.createElement(
					"p",
					{ "class": "text-muted" },
					"Comment?"
				)
			);
		}
	}, {
		key: "handleLikeClick",
		value: function handleLikeClick() {
			// if no user is logged in
			if (this.state.current_user == null) return false;

			var url = "";
			// if current user hasn't liked post
			if (!this.state.likedByMe) {
				this.setState(function (state) {
					return {
						likeCount: state.likeCount + 1,
						likedByMe: true
					};
				});
				url = "/likes/create/" + this.state.id + "/";
			} else {
				// if current user has liked post 
				this.setState(function (state) {
					return {
						likeCount: state.likeCount - 1,
						likedByMe: false
					};
				});
				url = "/likes/destroy/" + this.state.id + "/";
			}
			var csrftoken = getCookie('csrftoken'); // needed for Django POST
			var options = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken }
				// Note that the URL is dependent on whether user has liked post already or not.
			};fetch(url, options).then(function (res) {
				return res.json();
			}).then(function (data) {
				if (data.error) // server returned error message
					console.log(data.error);
			}).catch(function (error) {
				console.log("could not create/destroy like", error);
			});
		}
	}, {
		key: "handleEditClick",
		value: function handleEditClick() {
			this.setState({ editing: true });
		}
	}, {
		key: "handleUpdatePost",
		value: function handleUpdatePost(isNew, newContent) {
			// isNew will be always be false, as this is an edited post. bit of a poor design choice.
			this.setState({
				editing: false,
				content: newContent // manually setting content to force render
			});
			this.props.onMakePost(false, null); // notify parent element
		}
	}, {
		key: "handleProfileClick",
		value: function handleProfileClick() {
			// TODO
			return false;
		}
	}]);

	return Post;
}(React.Component);

// NewPost represents the necessary components to create or edit a post.


var NewPost = function (_React$Component3) {
	_inherits(NewPost, _React$Component3);

	function NewPost(props) {
		_classCallCheck(this, NewPost);

		var _this6 = _possibleConstructorReturn(this, (NewPost.__proto__ || Object.getPrototypeOf(NewPost)).call(this, props));

		_this6.state = {
			isNew: _this6.props.isNew,
			editId: _this6.props.editId,
			response: _this6.props.text,
			maxChars: 250,
			error: null
		};
		_this6.handleChange = _this6.handleChange.bind(_this6);
		_this6.handleClick = _this6.handleClick.bind(_this6);
		_this6.makePost = _this6.makePost.bind(_this6);
		return _this6;
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
				null,
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
			this.setState({ error: null }); // Initialize error to null by default so it disappears on next submit

			var input = this.state.response.trim();
			if (input.length <= 0) {
				this.setState({ error: "Post cannot be empty." });
			} else {
				this.makePost(input);
			}
		}

		// Handler for user creating posts.

	}, {
		key: "makePost",
		value: function makePost(content) {
			var _this7 = this;

			var csrftoken = getCookie('csrftoken'); // Need this in order to send a post request to Django
			var options = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
				body: JSON.stringify({ content: content })
			};
			var url = "/posts/create/";
			if (!this.state.isNew) // this means it is a post being edited
				url = "/posts/update/" + this.state.editId + "/";

			fetch(url, options).then(function (res) {
				return res.json();
			}).then(function (data) {
				if (data.error) {
					// No error in the fetch, but server returned error response.
					_this7.setState({
						error: data.error
					});
				}
				_this7.props.onMakePost(_this7.state.isNew, content); // notify parent element
				_this7.setState({
					response: ""
				});
			},
			// An error occurred in the fetch itself.
			function (error) {
				console.log(error.message);
			});
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