from datetime import datetime
import mariadb


dbconfig = {'host': '127.0.0.1',
            'user': 'dbuser',
            'password': 'password111',
            'database': 'todolistDB',}

class UseDatabase:
    def __init__(self, config: dict) -> None:
        self.configuration = config
        
    def __enter__(self) -> 'cursor':
        self.conn = mariadb.connect(**self.configuration)
        self.cursor = self.conn.cursor()
        return self.cursor
        
#if somethig goes wrong, this three args are always given to the _exit_ by Interpreter        
    def __exit__(self, exc_type, exc_value, exc_trace) -> None:
        self.conn.commit()
        self.cursor.close()
        self.conn.close()
        
def show_todos(username) -> list:
        with UseDatabase(dbconfig) as cursor:
            _SQL = """select id, todo_text, created, done from todos where user = %s"""
            cursor.execute(_SQL, (username,))
            to_do_list = cursor.fetchall()
            return to_do_list

def post_todo(username, to_do) -> None:
        with UseDatabase(dbconfig) as cursor:
            _SQL = """INSERT INTO todos
                      (user, todo_text, created) 
                      values 
                      (%s, %s, %s)"""
            cursor.execute(_SQL, (username,
                                  to_do,
                                  str(datetime.now())[:-7],))

def make_todo_done(id) -> None:
    with UseDatabase(dbconfig) as cursor:
        _SQL = """UPDATE todos SET done=%s where id=%s"""
        cursor.execute(_SQL, (str(datetime.now())[:-7], id))