from flask import Flask, render_template, request, session
from DBcm import UseDatabase
from datetime import datetime

app = Flask(__name__)
app.config['dbconfig'] = { 'host': '127.0.0.1',
                           'user': 'dbuser',
                           'password': 'password111',
                           'database': 'todolistDB',}


@app.route('/', methods=['POST','GET'])
def login() -> 'html':
    return render_template('login.html', the_title = 'To do list login page')


@app.route('/entry', methods=['POST','GET'])
def greet() -> 'html':
    username = request.form['login']
    app.config['username'] = username
    
    list = show_todos([username])
    titles = ('Todo', 'created', 'done')
    return render_template('entry.html', 
                            the_row_titles = titles,
                            the_username = username, 
                            the_list = list, 
                            the_title = 'Type and add smthn to todo list')

@app.route('/todolist', methods=['POST','GET'])
def add_task() -> 'html':
    to_do = request.form['task']
    username = app.config['username']
    post_todo(username, to_do)
    list = show_todos(username)
    titles = ('Todo', 'created', 'done', '    ')
    return render_template('entry.html', 
                            the_row_titles = titles,
                            the_username = username, 
                            the_list = list, 
                            the_title = 'To do list')



def post_todo(username, to_do):
        with UseDatabase(app.config['dbconfig']) as cursor:
            _SQL = """INSERT INTO todos
                      (user, todo_text, created) 
                      values 
                      (%s, %s, %s)"""
            cursor.execute(_SQL, (username,
                                  to_do,
                                  str(datetime.now())[:-7],))

def show_todos(username) -> list:
        with UseDatabase(app.config['dbconfig']) as cursor:
            _SQL = """select todo_text, created, done from todos where user = %s"""
            cursor.execute(_SQL, (username,))
            to_do_list = cursor.fetchall()
            return to_do_list

def make_todo_done(username, id):
    #code here plz

    pass




if __name__ == '__main__':
    app.run(debug=True)        

