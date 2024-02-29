from flask import Flask, render_template, request, session, jsonify, redirect
from DBcm import UseDatabase, show_todos, post_todo, make_todo_done
from markupsafe import escape


app = Flask(__name__)

@app.route('/', methods=['POST','GET'])
def login() -> 'html':
    return render_template('login.html', the_title = 'To do list login page')


@app.route('/entry', methods=['POST','GET'])
def greet() -> 'html':
    username = request.form['login']
    app.config['username'] = username
    list = show_todos(username)
    return render_template('entry.html', 
                            the_username = username, 
                            the_list = list, 
                            the_title = 'Type and add smthn to todo list')


@app.route('/add_todo', methods=['POST','GET'])
def add_task_to_db():
    username = app.config['username']
    data = request.get_json()
    to_do = data.get('todo')
    post_todo(username, to_do)
    return jsonify(show_todos(username))

@app.route('/markdone', methods=['POST','GET'])
def mark_todo_as_done():
    username = app.config['username']
    data = request.get_json()
    id = data.get('id')
    make_todo_done(id)
    return jsonify(show_todos(username))



if __name__ == '__main__':
    app.run(debug=True)        

