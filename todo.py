from flask import Flask, render_template, request, session, jsonify, redirect
from mongoDBcm import UseDatabase, show_todos, show_todos_with_tag, post_todo, make_todo_done, delete_todo, add_tag, clear_tags, add_user, validate_user, is_username_available
import json

app = Flask(__name__)

@app.route('/', methods=['POST','GET'])
def login() -> 'html':
    return render_template('login.html', the_title = 'To do list login page')


@app.route('/entry', methods=['POST','GET'])
def greet() -> 'html':
    username = request.form['login']
    password = request.form['password']
    if validate_user(username, password):
        app.config['username'] = username
        list = show_todos(username)
        return render_template('entry.html', 
                                the_username = username, 
                                the_list = list, 
                                the_title = 'Type and add smthn to todo list')
    return "Invalid login", 401                            


@app.route('/add_todo', methods=['POST','GET'])
def add_task_to_db():
    username = app.config['username']
    data = request.get_json()
    to_do = data.get('todo')
    post_todo(username, to_do)
    return show_todos(username)

@app.route('/markdone', methods=['POST','GET'])
def mark_todo_as_done():
    username = app.config['username']
    data = request.get_json()
    id = data.get('id')
    make_todo_done(id)
    return show_todos(username)

@app.route('/delete_todo', methods=['POST','GET'])
def delete_todo_entry():
    username = app.config['username']
    data = request.get_json()
    id = data.get('id')
    delete_todo(id)
    return show_todos(username)

@app.route('/addtag', methods=['POST','GET'])
def add_tag_to_todo():
    username = app.config['username']
    data = request.get_json()
    id = data.get('id')
    tag_string = data.get('tag_string')
    add_tag(tag_string, id)
    return show_todos(username)

@app.route('/cleartags', methods=['POST'])
def clear_tags_from_todo():
    username = app.config['username']
    data = request.get_json()
    id = data.get('id')
    clear_tags(id)
    return show_todos(username)

@app.route("/tags/<tag>")
def search_by_tag(tag: str):
    username = app.config['username']
    result = show_todos_with_tag(username, tag)
    return result

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    nickname = data['nickname']
    email = data['email']
    password = data['password']
    message = add_user(nickname, email, password)
    return jsonify({'success': True, 'message': message})

@app.route('/check-username', methods=['POST'])
def check_username():
    data = request.get_json()
    nickname = data['nickname']
    if is_username_available(nickname):
        return jsonify({'available': True})
    else:
        return jsonify({'available': False})        

if __name__ == '__main__':
    app.run(debug=True)        

