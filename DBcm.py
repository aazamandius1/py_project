from datetime import datetime
import mariadb
import bcrypt


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
            _SQL = """SELECT id, todo_text, created, done, tags from todos where user = %s"""
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

def delete_todo(id) -> None:
    with UseDatabase(dbconfig) as cursor:
        _SQL = """DELETE FROM todos WHERE id=%s"""
        cursor.execute(_SQL, (id,))        

def add_tags(tags_string, id) -> None:
    with UseDatabase(dbconfig) as cursor:
        # Normalize tags
        tags = [tag.strip().lower() for tag in tags_string.split(',')]
        tags = list(set(tags)) # Remove duplicates
        #check for existing tags
        _SQL = """SELECT tags FROM todos where id=%s"""
        cursor.execute(_SQL, (id,))
        current_tags = cursor.fetchall()

        if not current_tags or current_tags[0][0] is None:
            #if no tags exist, insert new tags
            new_tags = ','.join(tags)
            _SQL = """UPDATE todos SET tags=%s WHERE id=%s"""
            cursor.execute(_SQL, (new_tags, id))
        else:
            #if there are tags, merge new whith existing and remove duplicates
            existing_tags = set(current_tags[0][0].split(','))
            updated_tags = existing_tags.union(tags)
            updated_tags = ','.join(updated_tags)
            _SQL = """UPDATE todos SET tags=%s where id=%s"""
            cursor.execute(_SQL, ( updated_tags, id))

def add_user(username, email, password):
    with UseDatabase(dbconfig) as cursor:
        _SQL = """SELECT username FROM users WHERE username=%s"""
        cursor.execute(_SQL, (username,))
        db_username = cursor.fetchone()
        if db_username is None:
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            _SQL = """INSERT INTO users
                      (username, user_email, user_pwd) 
                      values 
                      (%s, %s, %s)"""
            cursor.execute(_SQL, (username,
                                  email,
                                  hashed_password))

def validate_user(username, password) -> bool:
    with UseDatabase(dbconfig) as cursor:
        _SQL = """SELECT user_pwd FROM users WHERE username=%s"""
        cursor.execute(_SQL, (username,))
        db_password_hash = cursor.fetchone()[0]
        if db_password_hash and bcrypt.checkpw(password.encode('utf-8'), db_password_hash.encode('utf-8')):
            return True
    return False

def is_username_avalible(username)->bool:
    with UseDatabase(dbconfig) as cursor:
        _SQL = """SELECT username FROM users WHERE username=%s"""
        cursor.execute(_SQL, (username,))
        db_username = cursor.fetchall()
        return not db_username